import math
from typing import Any

from sqlalchemy import select, func

from config import settings
from db.db import db_helper
from exceptions import BadRequestException, NotFoundException
from models.weighing import Weighing
from schemas.request import NotificationStatusEnum
from schemas.weighing import *
from utils.cmp_integration import create_new_production, process_recipe
# from utils.cmp_integration import create_new_production
from utils.general_utils import get_order_by, send_to_telegram, validate_sort_column, \
    request_will_be_finished
from utils.unitofwork import IUnitOfWork


class WeighingService:
    async def create_dependent(self, uow: IUnitOfWork, data: DependentWeighingSchemaAdd,
                               user_id: int) -> SingleDependentWeighingSchemaRead:
        data_dict = data.model_dump()
        plate_number = data_dict.pop('plate_number_input')

        if (data_dict['tare_weight'] and data_dict['brutto_weight']
                or not data_dict['tare_weight'] and not data_dict['brutto_weight']):
            raise BadRequestException("It is necessary to fill either the tare or the gross")

        if (data_dict['transport_id'] and plate_number
                or not data_dict['transport_id'] and not plate_number):
            raise BadRequestException("It is necessary to fill either the transport id or the plate number input")

        # Автоматически задать параметры для зависимого отвеса
        data_dict['is_depend'] = True
        data_dict['first_operator_id'] = user_id

        async with uow:
            request = await uow.request.find_one_or_none(id=data_dict.pop('request_id'))
            if not request:
                raise BadRequestException('invalid request id')
            request = request.to_read_model()
            if not request.is_active:
                raise BadRequestException('Нельзя проводить отвес по деактивированной заявке')

            # Проверка на завершенность заявки
            if request_will_be_finished(request, data_dict['cubature']):
                raise BadRequestException("Превышен лимит по заявке")

            if data_dict['transport_id']:
                transport = await uow.transport.find_one_or_none(id=data_dict['transport_id'])
                if not transport:
                    raise BadRequestException("invalid transport id")
            elif plate_number:
                transport = await uow.transport.find_one_or_none(plate_number=plate_number)
                if not transport:
                    transport_dict = {
                        "plate_number": plate_number,
                        "is_active": False
                    }
                    transport = await uow.transport.create(transport_dict)
                data_dict['transport_id'] = transport.id

            if data_dict['concrete_mixing_plant_id']:
                concrete_mixing_plant = await uow.concrete_mixing_plant.find_one_or_none(
                    id=data_dict['concrete_mixing_plant_id'])
                if not concrete_mixing_plant:
                    raise BadRequestException("invalid concrete mixing plant id")

            construction = await uow.construction.find_one_or_none(id=data_dict['construction_id'])
            if not construction:
                raise BadRequestException("invalid construction id")

            detail = (await uow.detail.find_one_or_none(id=request.detail_id)).to_read_model()
            data_dict['detail_id'] = detail.id

            if data_dict['photo_id']:
                photo = await uow.photo.find_one_or_none(id=data_dict['photo_id'])
                if not photo:
                    raise BadRequestException("invalid photo id")
                if photo.is_attached:
                    raise BadRequestException("the photo has already been linked")

            result = await uow.weighing.create(data_dict)
            result = result.to_read_model()

            await uow.request.sync_data(request.id)

            result.request_purpose_cubature = round(request.purpose_cubature, 2)
            result.request_realized_cubature = round(request.realized_cubature, 2)
            result.request_loading_cubature = round(request.loading_cubature, 2)
            result.request_remain_cubature = round(round(request.purpose_cubature, 2) - (
                    round(request.realized_cubature, 2) + round(request.loading_cubature, 2)), 2)

            result.seller_company = (await uow.company.find_one_or_none(id=detail.seller_company_id)).to_read_model()
            result.client_company = (await uow.company.find_one_or_none(id=detail.client_company_id)).to_read_model()
            result.material = (await uow.material.find_one_or_none(id=detail.material_id)).to_read_model()
            if detail.object_id:
                result.object = (await uow.object.find_one_or_none(id=detail.object_id)).to_read_model()

            result.transport = (await uow.transport.find_one_or_none(id=result.transport_id)).to_read_model()
            if result.transport.carrier_id:
                result.transport.carrier = (
                    await uow.carrier.find_one_or_none(id=result.transport.carrier_id)).to_read_model()

            if result.concrete_mixing_plant_id:
                result.concrete_mixing_plant = concrete_mixing_plant.to_read_model()

            if result.photo_id:
                result.photo = photo.to_read_model()

            if result.construction_id:
                result.construction = (await uow.construction.find_one_or_none(
                    id=result.construction_id)).to_read_model()

            first_operator = await uow.user.find_one_or_none(id=result.first_operator_id)
            result.first_operator = first_operator.to_read_model()

            await uow.request.update(request.id, {'is_abs': NotificationStatusEnum.read})
            if result.photo_id:
                await uow.photo.update(result.photo_id, {'is_attached': True})

            # send to telegram group logic start
            if result.tare_weight and transport.tare:
                admissible_error = transport.admissible_error or 0
                if result.tare_weight > transport.tare * (1 + admissible_error / 100):
                    message = f"""
{settings.NOT_FINISHED_DEPENDENT_WEIGHING_URL}/{request.id}/edit/{result.id}
Гос. номер АБС: {transport.plate_number}
Фактическая тара: {result.tare_weight}
Справочная тара: {transport.tare}
Перегруз: {result.tare_weight - transport.tare} кг
                    """
                    await send_to_telegram(settings.TELEGRAM_GROUP_CHAT_ID, message)
            # send to telegram group logic end

            # # bsu request sending logic start
            receipt = await process_recipe(material_id=result.material.id,
                                           construction_type_id=result.construction.construction_type_id,
                                           receive_method_id=request.receive_method_id)

            construction_site = f"{result.client_company.company_type.value} {result.client_company.name}"
            if result.object:
                construction_site += f" ({result.object.name})"

            production_add_data = {
                'receipt': receipt,
                'construction_site': construction_site,
                'plate_number': result.transport.plate_number,
                'cone_draft': result.cone_draft,
                'cubature': result.cubature,
            }
            result.is_sent_to_cmp = await create_new_production(production_add_data,
                                                                f"http://{result.concrete_mixing_plant.ip_address}:8001")
            # # bsu request sending logic end
            await uow.detail.update(detail.id, {"cone_draft_default": result.cone_draft})

            # --- АВТОМАТИЧЕСКОЕ ЗАВЕРШЕНИЕ ЗАЯВКИ ---
            # Проверяем, остались ли еще незавершенные отвесы по detail_id
            active_weighings, _ = await uow.weighing.get_all(is_finished=False, detail_id=detail.id, is_depend=True)
            if not active_weighings:
                from services.request import RequestService
                await RequestService().close_request(uow, request.id)
            # --- КОНЕЦ БЛОКА ---

            await uow.commit()
            return result

    async def create_independent(self, uow: IUnitOfWork, data: IndependentWeighingSchemaAdd,
                                 user_id: int) -> SingleIndependentWeighingSchemaRead:
        data_dict = data.model_dump()
        plate_number = data_dict.pop('plate_number_input')

        if (data_dict['tare_weight'] and data_dict['brutto_weight']
                or not data_dict['tare_weight'] and not data_dict['brutto_weight']):
            raise BadRequestException("It is necessary to fill either the tare or the gross")

        if (data_dict['transport_id'] and plate_number
                or not data_dict['transport_id'] and not plate_number):
            raise BadRequestException("It is necessary to fill either the transport id or the plate number input")

        # Автоматически задать параметры для независимого отвеса
        data_dict['is_depend'] = False
        data_dict['first_operator_id'] = user_id

        async with uow:
            # detail parsing start.
            # Подготовить словарь для создания таблицы Деталей
            detail_dict = {'seller_company_id': data_dict.pop('seller_company_id'),
                           'client_company_id': data_dict.pop('client_company_id'),
                           'material_id': data_dict.pop('material_id')}

            seller_company = await uow.company.find_one_or_none(id=detail_dict['seller_company_id'])
            if not seller_company:
                raise BadRequestException("invalid seller company id")

            client_company = await uow.company.find_one_or_none(id=detail_dict['client_company_id'])
            if not client_company:
                raise BadRequestException("invalid client company id")

            material = await uow.material.find_one_or_none(id=detail_dict['material_id'])
            if not material:
                raise BadRequestException("invalid material id")

            detail = await uow.detail.create(detail_dict)
            data_dict['detail_id'] = detail.id
            # detail parsing end.

            if data_dict['transport_id']:
                transport = await uow.transport.find_one_or_none(id=data_dict['transport_id'])
                if not transport:
                    raise BadRequestException("invalid transport id")
            elif plate_number:
                transport = await uow.transport.find_one_or_none(plate_number=plate_number)
                if not transport:
                    transport_dict = {
                        "plate_number": plate_number,
                        "is_active": False
                    }
                    transport = await uow.transport.create(transport_dict)
                data_dict['transport_id'] = transport.id

            if data_dict['photo_id']:
                photo = await uow.photo.find_one_or_none(id=data_dict['photo_id'])
                if not photo:
                    raise BadRequestException("invalid photo id")
                if photo.is_attached:
                    raise BadRequestException("the photo has already been linked")

            result = await uow.weighing.create(data_dict)
            result.seller_company = seller_company.to_read_model()
            result.client_company = client_company.to_read_model()
            result.material = material.to_read_model()

            result.transport = transport.to_read_model()
            carrier = await uow.carrier.find_one_or_none(id=result.transport.carrier_id)
            if carrier:
                result.transport.carrier = carrier.to_read_model()

            if result.photo_id:
                result.photo = photo.to_read_model()

            first_operator = await uow.user.find_one_or_none(id=result.first_operator_id)
            result.first_operator = first_operator.to_read_model()
            if result.photo_id:
                await uow.photo.update(result.photo_id, {'is_attached': True})
            await uow.commit()
            return result

    async def get_all_dependent(self, uow: IUnitOfWork, is_desc: bool, order_attribute: str, limit: int, offset: int,
                                request_id: int,
                                is_finished: Optional[bool], current_user,
                                **filter_by) \
            -> tuple[list[MultipleDependentWeighingSchemaRead], int]:

        validate_sort_column(order_attribute, Weighing)
        order_by = get_order_by([{"is_desc": is_desc, "name": order_attribute}])

        async with uow:
            finished_filter = True
            detail_filter = True
            if isinstance(is_finished, bool):
                finished_filter = Weighing.is_finished == is_finished

            if request_id:
                order_by_data = [{'name': order_attribute, 'is_desc': is_desc}, {'name': 'second_at', 'is_desc': False}]
                order_by = get_order_by(order_by_data)

                request = await uow.request.find_one_or_none(id=request_id)
                if not request:
                    raise BadRequestException("invalid request id")
                detail = await uow.detail.find_one_or_none(id=request.detail_id)
                detail_filter = Weighing.detail_id == detail.id

                if request.is_call == NotificationStatusEnum.not_read and current_user.role.name == "Диспетчер весовой":
                    await uow.request.update(request.id, {'is_call': NotificationStatusEnum.read})
                await uow.commit()

            results, total = await uow.weighing.get_all(finished_filter, detail_filter, order_by=order_by,
                                                        limit=limit, offset=offset,
                                                        is_depend=True, **filter_by)
            for result in results:
                result.transport = (await uow.transport.find_one_or_none(id=result.transport_id)).to_read_model()
                concrete_mixing_plant = await uow.concrete_mixing_plant.find_one_or_none(
                    id=result.concrete_mixing_plant_id)
                if concrete_mixing_plant:
                    result.concrete_mixing_plant = concrete_mixing_plant.to_read_model()
            return results, total

    async def get_all_independent(self,
                                  uow: IUnitOfWork, from_date, to_date, is_desc: bool, order_attribute: str,
                                  limit: int, offset: int,
                                  is_finished, seller_id, material_id, **filter_by) \
            -> tuple[dict[str, Any], Any]:
        date_filter = True
        seller_filter = True
        material_filter = True

        async with uow:
            if seller_id:
                if not await uow.company.find_one_or_none(id=seller_id):
                    raise BadRequestException(f"Invalid seller id")
                detail_ids = []
                details, _ = await uow.detail.get_all(seller_company_id=seller_id)
                for detail in details:
                    detail_ids.append(detail.id)

                seller_filter = Weighing.detail_id.in_(detail_ids)

            if material_id:
                if not await uow.material.find_one_or_none(id=material_id):
                    raise BadRequestException(f"Invalid material id")
                detail_ids = []
                details, _ = await uow.detail.get_all(material_id=material_id)
                for detail in details:
                    detail_ids.append(detail.id)

                material_filter = Weighing.detail_id.in_(detail_ids)

            if from_date and to_date:
                date_filter = Weighing.first_at.between(from_date, to_date)

            validate_sort_column(order_attribute, Weighing)
            order_by = get_order_by(
                [{"is_desc": is_desc, "name": order_attribute}, {'name': 'second_at', 'is_desc': True}])

            is_finished_filter = True
            if isinstance(is_finished, bool):
                is_finished_filter = Weighing.is_finished == is_finished

        async with db_helper.get_db_session() as session:
            stmt = (
                select(
                    func.sum(Weighing.tare_weight).label('tare'),
                    func.sum(Weighing.brutto_weight).label('brutto'),
                    func.sum(Weighing.clean_weight).label('clean')
                )
                .filter(seller_filter, material_filter, date_filter, is_finished_filter)
                .filter_by(is_depend=False, **filter_by)
            )

            raw = await session.execute(stmt)
            total_weight = raw.mappings().one()

        async with uow:

            results, total = await uow.weighing.get_all(seller_filter, material_filter, date_filter, is_finished_filter,
                                                        order_by=order_by, limit=limit,
                                                        offset=offset,
                                                        is_depend=False, **filter_by)

            for result in results:
                if result.detail_id:
                    detail = (await uow.detail.find_one_or_none(id=result.detail_id)).to_read_model()
                    result.seller_company = (
                        await uow.company.find_one_or_none(id=detail.seller_company_id)).to_read_model()
                    result.client_company = (
                        await uow.company.find_one_or_none(id=detail.client_company_id)).to_read_model()
                    result.material = (await uow.material.find_one_or_none(id=detail.material_id)).to_read_model()
                else:
                    result.seller_company = None
                    result.client_company = None
                    result.material = None
                result.transport = (await uow.transport.find_one_or_none(id=result.transport_id)).to_read_model()

            total_tare = round(total_weight['tare'] / 1000, 2) if total_weight['tare'] else 0
            total_brutto = round(total_weight['brutto'] / 1000, 2) if total_weight['brutto'] else 0
            total_clean = round(total_weight['clean'] / 1000, 2) if total_weight['clean'] else 0
            result = {
                'weighings': results,
                'total_tare': total_tare,
                'total_brutto': total_brutto,
                'total_clean': total_clean,
            }
            return result, total

    async def get_by_id_dependent(self, uow: IUnitOfWork, id: int) -> SingleDependentWeighingSchemaRead:
        async with uow:
            result = await uow.weighing.find_one_or_none(id=id, is_depend=True)
            if not result:
                raise NotFoundException("Зависимый отвес")
            result = result.to_read_model()

            detail = (await uow.detail.find_one_or_none(id=result.detail_id)).to_read_model()
            request = await uow.request.find_one_or_none(detail_id=detail.id)

            result.request_purpose_cubature = round(request.purpose_cubature, 2)
            result.request_realized_cubature = round(request.realized_cubature, 2)
            result.request_loading_cubature = round(request.loading_cubature, 2)
            result.request_remain_cubature = round(round(request.purpose_cubature, 2) - (
                    round(request.realized_cubature, 2) + round(request.loading_cubature, 2)), 2)

            result.seller_company = (await uow.company.find_one_or_none(id=detail.seller_company_id)).to_read_model()
            result.client_company = (await uow.company.find_one_or_none(id=detail.client_company_id)).to_read_model()
            result.material = (await uow.material.find_one_or_none(id=detail.material_id)).to_read_model()

            if detail.object_id:
                result.object = (await uow.object.find_one_or_none(id=detail.object_id)).to_read_model()

            if result.concrete_mixing_plant_id:
                result.concrete_mixing_plant = (await uow.concrete_mixing_plant.find_one_or_none(
                    id=result.concrete_mixing_plant_id)).to_read_model()

            if result.photo_id:
                result.photo = (await uow.photo.find_one_or_none(id=result.photo_id)).to_read_model()

            if result.construction_id:
                result.construction = (
                    await uow.construction.find_one_or_none(id=result.construction_id)).to_read_model()

            result.transport = (await uow.transport.find_one_or_none(id=result.transport_id)).to_read_model()
            if result.transport.carrier_id:
                result.transport.carrier = (
                    await uow.carrier.find_one_or_none(id=result.transport.carrier_id)).to_read_model()

            if result.driver_id:
                result.driver = (
                    await uow.driver.find_one_or_none(id=result.driver_id)).to_read_model()

            result.first_operator = (await uow.user.find_one_or_none(id=result.first_operator_id)).to_read_model()
            if result.second_operator_id:
                result.second_operator = (await uow.user.find_one_or_none(id=result.second_operator_id)).to_read_model()

            return result

    async def get_by_id_independent(self, uow: IUnitOfWork, id: int) -> SingleIndependentWeighingSchemaRead:
        async with uow:
            result = await uow.weighing.find_one_or_none(id=id)
            if not result:
                raise NotFoundException("Независимый отвес")
            result = result.to_read_model()

            detail = (await uow.detail.find_one_or_none(id=result.detail_id)).to_read_model()

            result.seller_company = (await uow.company.find_one_or_none(id=detail.seller_company_id)).to_read_model()
            result.client_company = (await uow.company.find_one_or_none(id=detail.client_company_id)).to_read_model()
            result.material = (await uow.material.find_one_or_none(id=detail.material_id)).to_read_model()

            result.transport = (await uow.transport.find_one_or_none(id=result.transport_id)).to_read_model()
            if result.transport.carrier_id:
                result.transport.carrier = (
                    await uow.carrier.find_one_or_none(id=result.transport.carrier_id)).to_read_model()

            if result.driver_id:
                result.driver = (
                    await uow.driver.find_one_or_none(id=result.driver_id)).to_read_model()

            if result.photo_id:
                result.photo = (await uow.photo.find_one_or_none(id=result.photo_id)).to_read_model()

            result.first_operator = (await uow.user.find_one_or_none(id=result.first_operator_id)).to_read_model()
            if result.second_operator_id:
                result.second_operator = (await uow.user.find_one_or_none(id=result.second_operator_id)).to_read_model()

            return result

    async def finish_dependent(self, uow: IUnitOfWork, id: int, new_data: DependentWeighingSchemaUpdateNotFinished,
                               user_id: int) \
            -> SingleDependentWeighingSchemaRead:
        updated_data = new_data.model_dump()
        plate_number = updated_data.pop('plate_number_input')

        if updated_data['brutto_weight'] == updated_data['tare_weight']:
            raise BadRequestException("gross and tare cannot be equal")

        if (updated_data['transport_id'] and plate_number
                or not updated_data['transport_id'] and not plate_number):
            raise BadRequestException("It is necessary to fill either the transport id or the plate number input")

        updated_data['second_at'] = datetime.datetime.now()
        updated_data['second_operator_id'] = user_id
        updated_data['is_finished'] = True
        async with uow:
            result = await uow.weighing.find_one_or_none(id=id, is_finished=False, is_depend=True)
            if not result:
                raise BadRequestException("invalid weighing id or weighing was finished or weighing is not dependent")
            result = result.to_read_model()

            # Если брутто меньше тары свапаем значения
            if updated_data['brutto_weight'] <= updated_data['tare_weight']:
                updated_data['brutto_weight'], updated_data['tare_weight'] = updated_data['tare_weight'], \
                    updated_data['brutto_weight']

            if result.brutto_weight:
                old_brutto = result.brutto_weight
                if old_brutto != updated_data['brutto_weight']:
                    if old_brutto != updated_data['tare_weight']:
                        raise BadRequestException(
                            "Invalid weight value: your tare/brutto must be same as in first weighing")
            else:
                old_tare = result.tare_weight
                if old_tare != updated_data['tare_weight']:
                    if old_tare != updated_data['brutto_weight']:
                        raise BadRequestException(
                            "Invalid weight value: your tare/brutto must be same as in first weighing")

            updated_data['netto_weight'] = updated_data['brutto_weight'] - updated_data['tare_weight']
            updated_data['clean_weight'] = updated_data['netto_weight']

            if updated_data['transport_id']:
                transport = await uow.transport.find_one_or_none(id=updated_data['transport_id'])
                if not transport:
                    raise BadRequestException("invalid transport id")
            elif plate_number:
                transport = await uow.transport.find_one_or_none(plate_number=plate_number)
                if not transport:
                    transport_dict = {
                        "plate_number": plate_number,
                        "is_active": False
                    }
                    transport = await uow.transport.create(transport_dict)
                updated_data['transport_id'] = transport.id

            if updated_data['concrete_mixing_plant_id']:
                concrete_mixing_plant = await uow.concrete_mixing_plant.find_one_or_none(
                    id=updated_data['concrete_mixing_plant_id'])
                if not concrete_mixing_plant:
                    raise BadRequestException("invalid concrete mixing plant id")

            construction = await uow.construction.find_one_or_none(id=updated_data['construction_id'])
            if not construction:
                raise BadRequestException("invalid construction id")

            if updated_data['photo_id']:
                photo = await uow.photo.find_one_or_none(id=updated_data['photo_id'])
                if not photo:
                    raise BadRequestException("invalid photo id")

            if result.photo_id and result.photo_id != photo.id:
                old_photo = await uow.photo.find_one_or_none(id=result.photo_id)
                if old_photo:
                    await uow.photo.update(old_photo.id, {'is_attached': False})
                # is_deleted = delete_file(old_photo.filename)
                # if not is_deleted:
                #     raise BadRequestException("Не удалось удалить старое фото отвеса")

            request = await uow.request.find_one_or_none(detail_id=result.detail_id)
            # Проверка на завершенность заявки
            if request_will_be_finished(request, updated_data['cubature'], result.cubature):
                raise BadRequestException("Превышен лимит по заявке")
            result = await uow.weighing.update(id, updated_data)
            await uow.request.sync_data(request.id)

            result.request_purpose_cubature = round(request.purpose_cubature, 2)
            result.request_realized_cubature = round(request.realized_cubature, 2)
            result.request_loading_cubature = round(request.loading_cubature, 2)
            result.request_remain_cubature = round(round(request.purpose_cubature, 2) - (
                    round(request.realized_cubature, 2) + round(request.loading_cubature, 2)), 2)

            result.transport = transport.to_read_model()
            carrier = await uow.carrier.find_one_or_none(id=result.transport.carrier_id)
            if carrier:
                result.transport.carrier = carrier.to_read_model()

            if result.driver_id:
                result.driver = (await uow.driver.find_one_or_none(id=result.driver_id)).to_read_model()

            if result.concrete_mixing_plant_id:
                result.concrete_mixing_plant = concrete_mixing_plant.to_read_model()
            result.construction = construction.to_read_model()

            first_operator = await uow.user.find_one_or_none(id=result.first_operator_id)
            result.first_operator = first_operator.to_read_model()

            second_operator = await uow.user.find_one_or_none(id=result.second_operator_id)
            result.second_operator = second_operator.to_read_model()

            if result.photo_id:
                result.photo = await uow.photo.update(result.photo_id, {'is_attached': True})

            detail = await uow.detail.find_one_or_none(id=result.detail_id)

            result.seller_company = (await uow.company.find_one_or_none(id=detail.seller_company_id)).to_read_model()
            result.material = (await uow.material.find_one_or_none(id=detail.material_id)).to_read_model()

            if abs(result.netto_weight - (result.material.density * result.cubature)) > 1000:
                raise BadRequestException("Превышение нормы перегруза/недогруза")

            # send to telegram group logic start
            transport = transport.to_read_model()
            if result.material.density:
                fact_density = round(result.clean_weight / result.cubature, 2)
                density = result.material.density
                if (fact_density > density * 1.03) or (fact_density < density * 0.97):
                    message = f"""
{settings.FINISHED_DEPENDENT_WEIGHING_URL}/{result.id}
Гос. номер АБС: {transport.plate_number}
Марка бетона: {result.material.name}
Фактический удельный вес МБ: {fact_density}
Справочный удельный вес МБ: {density}
Перегруз/Недогруз: {round(fact_density - density, 2)} кг/м3
Общий перегруз/недогруз: {round((fact_density - density) * result.cubature, 2)} кг
                    """
                    await send_to_telegram(settings.TELEGRAM_GROUP_CHAT_ID, message)
            # send to telegram group logic end

            if request.auto_send_telegram:
                object = await uow.object.find_one_or_none(id=detail.object_id)
                result.is_sent_to_telegram = False
                if object:
                    driver_name = "неизвестный"
                    if result.driver:
                        driver_name = result.driver.name
                    message = f"""АБС отправлен на объект:
    
{updated_data['second_at'].strftime('%d.%m.%Y %H:%M')}
{result.seller_company.name}, {object.name}
{result.transport.plate_number}, {driver_name}
{result.material.name}, {result.cubature} куб."""
                    result.is_sent_to_telegram = await send_to_telegram(object.chat_id, message)

            await uow.detail.update(detail.id, {"cone_draft_default": result.cone_draft})

            # --- АВТОМАТИЧЕСКОЕ ЗАВЕРШЕНИЕ ЗАЯВКИ ---
            # Проверяем, остались ли еще незавершенные отвесы по detail_id
            active_weighings, _ = await uow.weighing.get_all(is_finished=False, detail_id=detail.id, is_depend=True)
            if not active_weighings:
                from services.request import RequestService
                await RequestService().close_request(uow, request.id)
            # --- КОНЕЦ БЛОКА ---

            await uow.commit()
            return result

    async def finish_independent(self, uow: IUnitOfWork, id: int, new_data: IndependentWeighingSchemaUpdateNotFinished,
                                 user_id: int) \
            -> SingleIndependentWeighingSchemaRead:
        updated_data = new_data.model_dump()
        plate_number = updated_data.pop('plate_number_input')

        if updated_data['brutto_weight'] == updated_data['tare_weight']:
            raise BadRequestException("gross and tare cannot be equal")

        if (updated_data['transport_id'] and plate_number
                or not updated_data['transport_id'] and not plate_number):
            raise BadRequestException("It is necessary to fill either the transport id or the plate number input")

        updated_data['second_at'] = datetime.datetime.now()
        updated_data['second_operator_id'] = user_id
        updated_data['status'] = 'waiting_lab'
        updated_data['is_finished'] = False
        async with uow:
            result = await uow.weighing.find_one_or_none(id=id, is_finished=False, is_depend=False)
            if not result:
                raise BadRequestException("invalid weighing id or weighing was finished")
            result = result.to_read_model()

            # Если брутто меньше тары свапаем значения
            if updated_data['brutto_weight'] <= updated_data['tare_weight']:
                updated_data['brutto_weight'], updated_data['tare_weight'] = updated_data['tare_weight'], \
                    updated_data['brutto_weight']

            if result.brutto_weight:
                old_brutto = result.brutto_weight
                if old_brutto != updated_data['brutto_weight']:
                    if old_brutto != updated_data['tare_weight']:
                        raise BadRequestException(
                            "Invalid weight value: your tare/brutto must be same as in first weighing")
            else:
                old_tare = result.tare_weight
                if old_tare != updated_data['tare_weight']:
                    if old_tare != updated_data['brutto_weight']:
                        raise BadRequestException(
                            "Invalid weight value: your tare/brutto must be same as in first weighing")

            updated_data['netto_weight'] = updated_data['brutto_weight'] - updated_data['tare_weight']
            # Пересчёт чистого веса при изменении сорности
            if (
                'weediness' in updated_data
                and updated_data['weediness'] is not None
                and result.tare_weight is not None
                and result.brutto_weight is not None
            ):
                updated_data['clean_weight'] = math.ceil(
                    updated_data['netto_weight'] * (1 - updated_data['weediness'] / 100))
            else:
                updated_data['clean_weight'] = updated_data['netto_weight']

            detail_dict = {'seller_company_id': updated_data.pop('seller_company_id'),
                           'client_company_id': updated_data.pop('client_company_id'),
                           'material_id': updated_data.pop('material_id')}
            seller_company = await uow.company.find_one_or_none(id=detail_dict['seller_company_id'])
            if not seller_company:
                raise BadRequestException("invalid seller company id")

            client_company = await uow.company.find_one_or_none(id=detail_dict['client_company_id'])
            if not client_company:
                raise BadRequestException("invalid client company id")

            material = await uow.material.find_one_or_none(id=detail_dict['material_id'])
            if not material:
                raise BadRequestException("invalid material id")

            if updated_data['transport_id']:
                transport = await uow.transport.find_one_or_none(id=updated_data['transport_id'])
                if not transport:
                    raise BadRequestException("invalid transport id")
            elif plate_number:
                transport = await uow.transport.find_one_or_none(plate_number=plate_number)
                if not transport:
                    transport_dict = {
                        "plate_number": plate_number,
                        "is_active": False
                    }
                    transport = await uow.transport.create(transport_dict)
                updated_data['transport_id'] = transport.id

            if updated_data['photo_id']:
                photo = await uow.photo.find_one_or_none(id=updated_data['photo_id'])
                if not photo:
                    raise BadRequestException("invalid photo id")

                if result.photo_id and result.photo_id != photo.id:
                    old_photo = await uow.photo.find_one_or_none(id=result.photo_id)
                    if old_photo:
                        await uow.photo.update(old_photo.id, {'is_attached': False})
                    # is_deleted = delete_file(old_photo.filename)
                    # if not is_deleted:
                    #     raise BadRequestException("Не удалось удалить старое фото отвеса")

            result = await uow.weighing.update(id, updated_data)
            await uow.detail.update(result.detail_id, detail_dict)

            # Получаем свежий отвес из БД для корректной проверки завершённости
            fresh_weighing = await uow.weighing.find_one_or_none(id=id)
            print(f"[DEBUG] fresh_weighing: id={getattr(fresh_weighing, 'id', None)}, inert_request_id={getattr(fresh_weighing, 'inert_request_id', None)}, brutto_weight={getattr(fresh_weighing, 'brutto_weight', None)}, weediness={getattr(fresh_weighing, 'weediness', None)}, silo_number={getattr(fresh_weighing, 'silo_number', None)}")
            if (
                fresh_weighing
                and fresh_weighing.inert_request_id
                and fresh_weighing.brutto_weight is not None
                and fresh_weighing.weediness is not None
                and fresh_weighing.silo_number is not None
            ):
                print(f"[DEBUG] Завершаем заявку: {fresh_weighing.inert_request_id}")
                from services.inert_material_request import InertMaterialRequestService
                await InertMaterialRequestService().finish(uow, fresh_weighing.inert_request_id)

            result.seller_company = seller_company.to_read_model()
            result.client_company = client_company.to_read_model()
            result.material = material.to_read_model()

            result.transport = transport.to_read_model()
            carrier = await uow.carrier.find_one_or_none(id=result.transport.carrier_id)
            if carrier:
                result.transport.carrier = carrier.to_read_model()

            first_operator = await uow.user.find_one_or_none(id=result.first_operator_id)
            result.first_operator = first_operator.to_read_model()

            second_operator = await uow.user.find_one_or_none(id=result.second_operator_id)
            result.second_operator = second_operator.to_read_model()

            if result.photo_id:
                result.photo = await uow.photo.update(result.photo_id, {'is_attached': True})

            # Проверяем, заполнены ли сорность и номер силоса
            weediness_filled = bool(updated_data.get('weediness'))
            silo_number_filled = bool(updated_data.get('silo_number'))
            tare_filled = result.tare_weight is not None or updated_data.get('tare_weight')
            brutto_filled = result.brutto_weight is not None or updated_data.get('brutto_weight')

            if weediness_filled and silo_number_filled and tare_filled and brutto_filled:
                updated_data['status'] = 'finished'
                updated_data['is_finished'] = True
                # Генерируем акт и сохраняем путь
                from services.report import ReportService
                report_service = ReportService()
                try:
                    file_path = await report_service.generate_weighing_act_xlsx(result.id)
                    pass  # invoice_path больше не сохраняем в БД
                except Exception as e:
                    pass
                # --- Если есть заявка, меняем её статус на finished ---
                if result.inert_request_id:
                    from services.inert_material_request import InertMaterialRequestService
                    await InertMaterialRequestService().finish(uow, result.inert_request_id)
            else:
                updated_data['status'] = 'waiting_lab'
                updated_data['is_finished'] = False

            if updated_data['transport_id']:
                transport = await uow.transport.find_one_or_none(id=updated_data['transport_id'])
                if not transport:
                    raise BadRequestException("invalid transport id")
            elif plate_number:
                transport = await uow.transport.find_one_or_none(plate_number=plate_number)
                if not transport:
                    transport_dict = {
                        "plate_number": plate_number,
                        "is_active": False
                    }
                    transport = await uow.transport.create(transport_dict)
                updated_data['transport_id'] = transport.id

            result = await uow.weighing.update(id, updated_data)
            await uow.detail.update(result.detail_id, detail_dict)

            result.seller_company = seller_company.to_read_model()
            result.client_company = client_company.to_read_model()
            result.material = material.to_read_model()

            result.transport = transport.to_read_model()
            carrier = await uow.carrier.find_one_or_none(id=result.transport.carrier_id)
            if carrier:
                result.transport.carrier = carrier.to_read_model()

            result.first_operator = first_operator.to_read_model()
            if result.second_operator_id:
                result.second_operator = second_operator.to_read_model()

            if result.photo_id:
                result.photo = await uow.photo.update(result.photo_id, {'is_attached': True})

            await uow.commit()
            return result

    async def update_dependent(self, uow: IUnitOfWork, id: int, new_data: DependentWeighingSchemaUpdateFinished) \
            -> SingleDependentWeighingSchemaRead:
        updated_data = new_data.model_dump()
        plate_number = updated_data.pop('plate_number_input')

        if (updated_data['transport_id'] and plate_number
                or not updated_data['transport_id'] and not plate_number):
            raise BadRequestException("It is necessary to fill either the transport id or the plate number input")

        async with uow:
            weighing = await uow.weighing.find_one_or_none(id=id)
            if not weighing:
                raise BadRequestException("invalid weighing id")

            if not weighing.is_finished:
                raise BadRequestException("weighing not finished")
            weighing = weighing.to_read_model()

            if updated_data['transport_id']:
                transport = await uow.transport.find_one_or_none(id=updated_data['transport_id'])
                if not transport:
                    raise BadRequestException("invalid transport id")
            elif plate_number:
                transport = await uow.transport.find_one_or_none(plate_number=plate_number)
                if not transport:
                    transport_dict = {
                        "plate_number": plate_number,
                        "is_active": False
                    }
                    transport = await uow.transport.create(transport_dict)
                updated_data['transport_id'] = transport.id

            concrete_mixing_plant = None
            if updated_data['concrete_mixing_plant_id']:
                concrete_mixing_plant = await uow.concrete_mixing_plant.find_one_or_none(
                    id=updated_data['concrete_mixing_plant_id'])
                if not concrete_mixing_plant:
                    raise BadRequestException("invalid concrete mixing plant id")

            construction = await uow.construction.find_one_or_none(id=updated_data['construction_id'])
            if not construction:
                raise BadRequestException("invalid construction id")

            request = await uow.request.find_one_or_none(detail_id=weighing.detail_id)
            # Проверка на завершенность заявки
            if request_will_be_finished(request, updated_data['cubature'], weighing.cubature):
                raise BadRequestException("Превышен лимит по заявке")

            result = await uow.weighing.update(id, updated_data)
            await uow.request.sync_data(request.id)

            result.transport = transport.to_read_model()
            carrier = await uow.carrier.find_one_or_none(id=result.transport.carrier_id)
            if carrier:
                result.transport.carrier = carrier.to_read_model()

            if concrete_mixing_plant:
                result.concrete_mixing_plant = concrete_mixing_plant.to_read_model()
            result.construction = construction.to_read_model()

            first_operator = await uow.user.find_one_or_none(id=result.first_operator_id)
            result.first_operator = first_operator.to_read_model()

            second_operator = await uow.user.find_one_or_none(id=result.second_operator_id)
            result.second_operator = second_operator.to_read_model()

            if result.photo_id:
                result.photo = (await uow.photo.find_one_or_none(id=result.photo_id)).to_read_model()

            await uow.commit()
            return result

    async def update_independent(self, uow: IUnitOfWork, id: int, new_data: IndependentWeighingSchemaUpdateFinished) \
            -> SingleIndependentWeighingSchemaRead:
        updated_data = new_data.model_dump()
        plate_number = updated_data.pop('plate_number_input')

        if (updated_data['transport_id'] and plate_number
                or not updated_data['transport_id'] and not plate_number):
            raise BadRequestException("It is necessary to fill either the transport id or the plate number input")

        # Готовим словарь для обновления таблицы Деталей
        detail_dict = {'seller_company_id': updated_data.pop('seller_company_id'),
                       'client_company_id': updated_data.pop('client_company_id'),
                       'material_id': updated_data.pop('material_id')}
        async with uow:
            weighing = await uow.weighing.find_one_or_none(id=id)
            if not weighing:
                raise BadRequestException("invalid weighing id")

            # Пересчёт чистого веса при изменении сорности
            if (
                'weediness' in updated_data
                and updated_data['weediness'] is not None
                and weighing.tare_weight is not None
                and weighing.brutto_weight is not None
            ):
                netto_weight = weighing.brutto_weight - weighing.tare_weight
                updated_data['netto_weight'] = netto_weight
                updated_data['clean_weight'] = math.ceil(netto_weight * (1 - updated_data['weediness'] / 100))
            # Если weediness пустое — clean_weight не трогаем, ошибки не будет

            # Проверяем, заполнены ли сорность и номер силоса
            weediness_filled = bool(updated_data.get('weediness'))
            silo_number_filled = bool(updated_data.get('silo_number'))
            tare_filled = weighing.tare_weight is not None or updated_data.get('tare_weight')
            brutto_filled = weighing.brutto_weight is not None or updated_data.get('brutto_weight')

            if weediness_filled and silo_number_filled and tare_filled and brutto_filled:
                updated_data['status'] = 'finished'
                updated_data['is_finished'] = True
                # Генерируем акт и сохраняем путь
                from services.report import ReportService
                report_service = ReportService()
                try:
                    file_path = await report_service.generate_weighing_act_xlsx(weighing.id)
                    pass  # invoice_path больше не сохраняем в БД
                except Exception as e:
                    pass
                # --- Если есть заявка, меняем её статус на finished ---
                if weighing.inert_request_id:
                    from services.inert_material_request import InertMaterialRequestService
                    await InertMaterialRequestService().finish(uow, weighing.inert_request_id)
            else:
                updated_data['status'] = 'waiting_lab'
                updated_data['is_finished'] = False

            if updated_data['transport_id']:
                transport = await uow.transport.find_one_or_none(id=updated_data['transport_id'])
                if not transport:
                    raise BadRequestException("invalid transport id")
            elif plate_number:
                transport = await uow.transport.find_one_or_none(plate_number=plate_number)
                if not transport:
                    transport_dict = {
                        "plate_number": plate_number,
                        "is_active": False
                    }
                    transport = await uow.transport.create(transport_dict)
                updated_data['transport_id'] = transport.id

            result = await uow.weighing.update(id, updated_data)
            await uow.detail.update(result.detail_id, detail_dict)

            result.seller_company = (await uow.company.find_one_or_none(id=detail_dict['seller_company_id'])).to_read_model()
            result.client_company = (await uow.company.find_one_or_none(id=detail_dict['client_company_id'])).to_read_model()
            result.material = (await uow.material.find_one_or_none(id=detail_dict['material_id'])).to_read_model()

            result.transport = transport.to_read_model()
            carrier = await uow.carrier.find_one_or_none(id=result.transport.carrier_id)
            if carrier:
                result.transport.carrier = carrier.to_read_model()

            result.first_operator = (await uow.user.find_one_or_none(id=result.first_operator_id)).to_read_model()
            if result.second_operator_id:
                result.second_operator = (await uow.user.find_one_or_none(id=result.second_operator_id)).to_read_model()

            if result.photo_id:
                result.photo = (await uow.photo.find_one_or_none(id=result.photo_id)).to_read_model()

            await uow.commit()
            return result

    async def change_cmp_and_cubature(self, uow: IUnitOfWork, id: int,
                                      new_data: WeighingSchemaConcreteMixingPlant) -> WeighingSchema:
        updated_data = new_data.model_dump()
        async with uow:
            weighing = await uow.weighing.find_one_or_none(id=id)
            if not weighing:
                raise NotFoundException("Отвес")
            if not weighing.is_depend:
                raise BadRequestException("Отвес не является зависимым")
            weighing = weighing.to_read_model()

            if weighing.concrete_mixing_plant_id == updated_data['concrete_mixing_plant_id'] and weighing.cubature == \
                    updated_data['cubature']:
                raise BadRequestException("Необходимо изменить хотя бы один параметр")

            request = await uow.request.find_one_or_none(detail_id=weighing.detail_id)
            # Проверка на завершенность заявки
            if request_will_be_finished(request, updated_data['cubature'], weighing.cubature):
                raise BadRequestException("Превышен лимит по заявке")

            result = await uow.weighing.update(id, updated_data)
            if weighing.cubature != updated_data['cubature']:
                await uow.request.sync_data(request.id)

            detail = await uow.detail.find_one_or_none(id=result.detail_id)
            result.seller_company = (await uow.company.find_one_or_none(id=detail.seller_company_id)).to_read_model()
            result.client_company = (await uow.company.find_one_or_none(id=detail.client_company_id)).to_read_model()
            result.material = (await uow.material.find_one_or_none(id=detail.material_id)).to_read_model()

            result.transport = (await uow.transport.find_one_or_none(id=result.transport_id)).to_read_model()
            carrier = await uow.carrier.find_one_or_none(id=result.transport.carrier_id)
            if carrier:
                result.transport.carrier = carrier.to_read_model()

            first_operator = await uow.user.find_one_or_none(id=result.first_operator_id)
            result.first_operator = first_operator.to_read_model()

            second_operator = await uow.user.find_one_or_none(id=result.second_operator_id)
            if second_operator:
                result.second_operator = second_operator.to_read_model()

            if result.photo_id:
                result.photo = (await uow.photo.find_one_or_none(id=result.photo_id)).to_read_model()

            result.concrete_mixing_plant = (
                await uow.concrete_mixing_plant.find_one_or_none(id=result.concrete_mixing_plant_id)).to_read_model()
            result.object = await uow.object.find_one_or_none(id=detail.object_id)
            # # bsu request sending logic start
            result.construction = (
                await uow.construction.find_one_or_none(id=detail.construction_id)).to_read_model()
            construction_type = (await uow.construction_type.find_one_or_none(
                id=result.construction.construction_type_id)).to_read_model()
            if construction_type:
                construction_type_id = construction_type.id
            else:
                construction_type_id = None

            receipt = await process_recipe(material_id=result.material.id,
                                           construction_type_id=construction_type_id,
                                           receive_method_id=request.receive_method_id)
            # material_name = result.material.name.split('-')
            # receipt = material_name[0]

            # receive_method = (
            #     await uow.receive_method.find_one_or_none(id=request.receive_method_id)).to_read_model()
            # receive_method_type = (await uow.receive_method_type.find_one_or_none(
            #     id=receive_method.receive_method_type_id)).to_read_model()
            # if receive_method_type.key_name:
            #     receipt += f"-{receive_method_type.key_name}"
            #
            # if 'СС' in material_name:
            #     receipt += f"-СС"

            construction_site = f"{result.client_company.company_type.value} {result.client_company.name}"
            if result.object:
                construction_site += f" ({result.object.name})"

            production_add_data = {
                'receipt': receipt,
                'construction_site': construction_site,
                'plate_number': result.transport.plate_number,
                'cone_draft': result.cone_draft,
                'cubature': result.cubature,
            }
            result.is_sent_to_cmp = await create_new_production(production_add_data,
                                                                f"http://{result.concrete_mixing_plant.ip_address}:8001")
            # # bsu request sending logic end
            await uow.commit()
            return result

    async def change_is_active(self, uow: IUnitOfWork, id: int, new_data: WeighingSchemaIsActive) -> WeighingSchema:
        updated_data = new_data.model_dump()
        async with uow:
            weighing = await uow.weighing.find_one_or_none(id=id)
            if not weighing:
                raise NotFoundException("Отвес")

            result = await uow.weighing.update(id, updated_data)
            if result.is_depend:
                request = await uow.request.find_one_or_none(detail_id=result.detail_id)
                await uow.request.sync_data(request.id)
            detail = await uow.detail.find_one_or_none(id=result.detail_id)
            result.seller_company = (await uow.company.find_one_or_none(id=detail.seller_company_id)).to_read_model()
            result.client_company = (await uow.company.find_one_or_none(id=detail.client_company_id)).to_read_model()
            result.material = (await uow.material.find_one_or_none(id=detail.material_id)).to_read_model()

            result.transport = (await uow.transport.find_one_or_none(id=result.transport_id)).to_read_model()
            carrier = await uow.carrier.find_one_or_none(id=result.transport.carrier_id)
            if carrier:
                result.transport.carrier = carrier.to_read_model()

            first_operator = await uow.user.find_one_or_none(id=result.first_operator_id)
            result.first_operator = first_operator.to_read_model()

            second_operator = await uow.user.find_one_or_none(id=result.second_operator_id)
            if second_operator:
                result.second_operator = second_operator.to_read_model()

            if result.photo_id:
                result.photo = (await uow.photo.find_one_or_none(id=result.photo_id)).to_read_model()

            await uow.commit()
            return result

    async def change_is_return(self, uow: IUnitOfWork, id: int, new_data: WeighingSchemaIsReturn) -> WeighingSchema:
        updated_data = new_data.model_dump()
        async with uow:
            weighing = await uow.weighing.find_one_or_none(id=id)
            if not weighing:
                raise NotFoundException("Отвес")

            result = await uow.weighing.update(id, updated_data)
            if result.is_depend:
                request = await uow.request.find_one_or_none(detail_id=result.detail_id)
                await uow.request.sync_data(request.id)
            detail = await uow.detail.find_one_or_none(id=result.detail_id)
            result.seller_company = (await uow.company.find_one_or_none(id=detail.seller_company_id)).to_read_model()
            result.client_company = (await uow.company.find_one_or_none(id=detail.client_company_id)).to_read_model()
            result.material = (await uow.material.find_one_or_none(id=detail.material_id)).to_read_model()

            result.transport = (await uow.transport.find_one_or_none(id=result.transport_id)).to_read_model()
            carrier = await uow.carrier.find_one_or_none(id=result.transport.carrier_id)
            if carrier:
                result.transport.carrier = carrier.to_read_model()
            first_operator = await uow.user.find_one_or_none(id=result.first_operator_id)
            result.first_operator = first_operator.to_read_model()

            second_operator = await uow.user.find_one_or_none(id=result.second_operator_id)
            if second_operator:
                result.second_operator = second_operator.to_read_model()

            if result.photo_id:
                result.photo = (await uow.photo.find_one_or_none(id=result.photo_id)).to_read_model()

            await uow.commit()
            return result

    async def reconnect(self, uow: IUnitOfWork, weighing_id: int,
                        new_request_id: int) -> bool:
        async with uow:
            weighing = await uow.weighing.find_one_or_none(id=weighing_id)

            new_request = await uow.request.find_one_or_none(id=new_request_id)
            if not new_request:
                raise BadRequestException('invalid request id')
            new_request = new_request.to_read_model()

            # Проверка на завершенность заявки
            if request_will_be_finished(new_request, weighing.cubature):
                raise BadRequestException("Превышен лимит по заявке")

            new_detail_id = new_request.detail_id

            old_detail = (await uow.detail.find_one_or_none(id=weighing.detail_id)).to_read_model()
            old_request = (await uow.request.find_one_or_none(detail_id=old_detail.id)).to_read_model()

            await uow.weighing.update(weighing_id, {'detail_id': new_detail_id})

            await uow.request.sync_data(old_request.id)
            await uow.request.sync_data(new_request.id)
            await uow.commit()
            return True

    async def change_monitoring_data(self, uow: IUnitOfWork, id: int,
                                     new_data: WeighingSchemaChangeMonitoringData) -> WeighingSchema:
        updated_data = new_data.model_dump()
        async with uow:
            weighing = await uow.weighing.find_one_or_none(id=id)
            if not weighing:
                raise NotFoundException("Отвес")
            if not weighing.is_finished:
                raise BadRequestException("Нельзя менять данные по весы по незавершенному отвесу")
            weighing = weighing.to_read_model()

            if updated_data['tare_weight'] >= updated_data['brutto_weight']:
                raise BadRequestException("Брутто должно быть больше тары")

            updated_data['old_tare_weight'] = weighing.tare_weight
            updated_data['old_brutto_weight'] = weighing.brutto_weight
            updated_data['old_bag_details'] = weighing.bag_details

            updated_data['netto_weight'] = updated_data['brutto_weight'] - updated_data['tare_weight']
            if weighing.weediness:
                updated_data['clean_weight'] = math.ceil(
                    updated_data['netto_weight'] * (1 - weighing.weediness / 100))
            else:
                updated_data['clean_weight'] = updated_data['netto_weight']

            updated_data['is_adjusted'] = True

            first_operator = await uow.user.find_one_or_none(id=updated_data['first_operator_id'])
            if not first_operator:
                raise NotFoundException("Первый оператор")
            second_operator = await uow.user.find_one_or_none(id=updated_data['second_operator_id'])
            if not second_operator:
                raise NotFoundException("Второй оператор")
            result = await uow.weighing.update(id, updated_data)
            if result.is_depend:
                request = await uow.request.find_one_or_none(detail_id=result.detail_id)
                await uow.request.sync_data(request.id)

            detail = await uow.detail.find_one_or_none(id=result.detail_id)
            result.seller_company = (await uow.company.find_one_or_none(id=detail.seller_company_id)).to_read_model()
            result.client_company = (await uow.company.find_one_or_none(id=detail.client_company_id)).to_read_model()
            result.material = (await uow.material.find_one_or_none(id=detail.material_id)).to_read_model()

            result.transport = (await uow.transport.find_one_or_none(id=result.transport_id)).to_read_model()
            carrier = await uow.carrier.find_one_or_none(id=result.transport.carrier_id)
            if carrier:
                result.transport.carrier = carrier.to_read_model()
            first_operator = await uow.user.find_one_or_none(id=result.first_operator_id)
            result.first_operator = first_operator.to_read_model()

            second_operator = await uow.user.find_one_or_none(id=result.second_operator_id)
            if second_operator:
                result.second_operator = second_operator.to_read_model()

            result.old_tare_weight = updated_data['old_tare_weight']
            result.old_brutto_weight = updated_data['old_brutto_weight']

            if result.photo_id:
                result.photo = (await uow.photo.find_one_or_none(id=result.photo_id)).to_read_model()

            await uow.commit()
            return result

    async def send_telegram_message(self, uow: IUnitOfWork, id: int) -> bool:
        async with uow:
            weighing = await uow.weighing.find_one_or_none(id=id)
            if not weighing:
                raise NotFoundException("Отвес")
            weighing = weighing.to_read_model()
            if not weighing.is_depend:
                raise BadRequestException("Отвес должен быть зависимым")

            detail = await uow.detail.find_one_or_none(id=weighing.detail_id)

            weighing.seller_company = (await uow.company.find_one_or_none(id=detail.seller_company_id)).to_read_model()
            weighing.material = (await uow.material.find_one_or_none(id=detail.material_id)).to_read_model()
            weighing.transport = (await uow.transport.find_one_or_none(id=weighing.transport_id)).to_read_model()

            object = await uow.object.find_one_or_none(id=detail.object_id)
            if object:
                driver_name = "неизвестный"
                if weighing.driver_id:
                    driver = await uow.driver.find_one_or_none(id=weighing.driver_id)
                    driver_name = driver.name
                message = f"""АБС отправлен на объект:

{weighing.second_at.strftime('%d.%m.%Y %H:%M')}
{weighing.seller_company.name}, {object.name}
{weighing.transport.plate_number}, {driver_name}
{weighing.material.name}, {weighing.cubature} куб."""
            result = await send_to_telegram(object.chat_id, message)
            return result
