import datetime
from datetime import timedelta
from typing import Any

from sqlalchemy import or_, and_, select, func
from sqlalchemy.sql.functions import coalesce

from config import settings
from db.db import db_helper
from exceptions import NotFoundException, BadRequestException
from models.request import Request
from schemas.request import RequestSchemaAdd, RequestSchema, RequestSchemaUpdate, RequestSchemaIsActive, \
    NotificationStatusEnum
from utils.general_utils import get_order_by, request_finished, validate_sort_column
from utils.unitofwork import IUnitOfWork


class RequestService:
    async def create(self, uow: IUnitOfWork, data: RequestSchemaAdd, user_id: int) -> RequestSchema:
        data_dict = data.model_dump()

        detail = {
            'seller_company_id': data_dict.pop('seller_company_id'),
            'client_company_id': data_dict.pop('client_company_id'),
            'material_id': data_dict.pop('material_id'),
            'construction_id': data_dict.pop('construction_id'),
            'cone_draft_default': data_dict.pop('cone_draft_default'),
            'object_id': data_dict.pop('object_id'),
        }
        async with uow:
            seller_company = await uow.company.find_one_or_none(id=detail['seller_company_id'])
            if not seller_company:
                raise BadRequestException("invalid seller company id")

            client_company = await uow.company.find_one_or_none(id=detail['client_company_id'])
            if not client_company:
                raise BadRequestException("invalid client company id")

            material = await uow.material.find_one_or_none(id=detail['material_id'])
            if not material:
                raise BadRequestException("invalid material id")

            construction = await uow.construction.find_one_or_none(id=detail['construction_id'])
            if not construction:
                raise BadRequestException("invalid construction id")

            object = await uow.object.find_one_or_none(id=detail['object_id'])
            if not object:
                raise BadRequestException("invalid object id")

            detail = await uow.detail.create(detail)
            data_dict['detail_id'] = detail.id

            data_dict['created_by'] = user_id

            receive_method = None
            if data_dict['receive_method_id']:
                receive_method = await uow.receive_method.find_one_or_none(id=data_dict['receive_method_id'])
                if not receive_method:
                    raise BadRequestException("invalid receive method id")

            data_dict['initial_purpose_cubature'] = data_dict['purpose_cubature']
            result = await uow.request.create(data_dict)

            result.seller_company = seller_company.to_read_model()
            result.client_company = client_company.to_read_model()
            result.material = material.to_read_model()
            result.construction = construction.to_read_model()
            result.cone_draft_default = detail.cone_draft_default
            result.object = object.to_read_model()

            result.created_by_instance = (await uow.user.find_one_or_none(id=user_id)).to_read_model()
            if receive_method:
                result.receive_method = receive_method.to_read_model()
            await uow.commit()
            return result

    async def get_all_specific(self, uow: IUnitOfWork, date: datetime.datetime,
                               object_id: int, material_id: int, transport_id: int,
                               is_desc: bool, order_attribute: str, limit: int, offset: int,
                               **filter_by) -> tuple[Any, Any]:
        object_filter = True
        material_filter = True
        transport_filter = True

        if date:
            validate_sort_column(order_attribute, Request)
            order_by = get_order_by([{"is_desc": is_desc, "name": order_attribute}])

            today_start = date.replace(hour=0, minute=0, second=0, microsecond=0)
            tomorrow_start = (date.replace(hour=0, minute=0, second=0, microsecond=0) +
                              timedelta(days=1))

            date_filter = and_(
                Request.purpose_start >= today_start,
                Request.purpose_start < tomorrow_start,
            )
        else:
            order_by = get_order_by([{"is_desc": False, "name": "is_finished"}, {"is_desc": False, "name": "by_call"},
                                     {"is_desc": True, "name": "is_abs"},
                                     {"is_desc": True, "name": "is_call"},
                                     {"is_desc": False, "name": "purpose_start"}])

            today_start = datetime.datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
            tomorrow_start = (datetime.datetime.now().replace(hour=0, minute=0, second=0, microsecond=0) +
                              timedelta(days=1))

            date_filter = (
                or_(
                    and_(
                        Request.is_finished == False,
                        Request.purpose_start < today_start
                    ),
                    and_(
                        Request.purpose_start >= today_start,
                        Request.purpose_start < tomorrow_start,
                    )
                )
            )

        async with uow:
            if object_id:
                if not await uow.object.find_one_or_none(id=object_id, is_active=True):
                    raise BadRequestException(f"Invalid object id")
                detail_ids = []
                details, _ = await uow.detail.get_all(object_id=object_id)
                for detail in details:
                    detail_ids.append(detail.id)

                object_filter = Request.detail_id.in_(detail_ids)

            if material_id:
                if not await uow.material.find_one_or_none(id=material_id, is_active=True):
                    raise BadRequestException(f"Invalid material id")
                detail_ids = []
                details, _ = await uow.detail.get_all(material_id=material_id)
                for detail in details:
                    detail_ids.append(detail.id)

                material_filter = Request.detail_id.in_(detail_ids)

            if transport_id:
                transport = await uow.transport.find_one_or_none(id=transport_id)
                if not transport:
                    raise BadRequestException(f"invalid transport id")
                weighings, _ = await uow.weighing.get_all(transport_id=transport_id, is_active=True)

                detail_ids = set()
                for weighing in weighings:
                    detail_ids.add(weighing.detail_id)

                transport_filter = Request.detail_id.in_(detail_ids)

        async with db_helper.get_db_session() as session:
            stmt = (
                select(
                    coalesce(func.sum(Request.realized_cubature), 0).label('realized_cubature'),
                    coalesce(func.sum(Request.loading_cubature), 0).label('loading_cubature'),
                    coalesce(func.sum(Request.purpose_cubature), 0).label('purpose_cubature'),
                )
                .filter(date_filter, object_filter, material_filter, transport_filter)
                .filter_by(**filter_by)
            )
            raw = await session.execute(stmt)
            cubature = raw.mappings().one()

        async with uow:
            results, total = await uow.request.get_all(date_filter, object_filter, material_filter, transport_filter,
                                                       order_by=order_by, limit=limit, offset=offset,
                                                       **filter_by)

            # deactivated_results, deactivated_total = await uow.request.get_all(Request.purpose_start >= today_start,
            #                                                                    Request.purpose_start < tomorrow_start,
            #                                                                    object_filter,
            #                                                                    material_filter, transport_filter,
            #                                                                    order_by=order_by, is_active=False)
            # results += deactivated_results
            # total += deactivated_total

            for result in results:
                detail = await uow.detail.find_one_or_none(id=result.detail_id)
                if not detail:
                    raise NotFoundException("Запись деталей")
                detail = detail.to_read_model()

                seller_company = await uow.company.find_one_or_none(id=detail.seller_company_id)
                if not seller_company:
                    raise NotFoundException("Поставщик")
                result.seller_company = seller_company.to_read_model()

                client_company = await uow.company.find_one_or_none(id=detail.client_company_id)
                if not client_company:
                    raise NotFoundException("Заказчик")
                result.client_company = client_company.to_read_model()

                object = await uow.object.find_one_or_none(id=detail.object_id)
                if not object:
                    raise NotFoundException("Объект")
                result.object = object.to_read_model()

                material = await uow.material.find_one_or_none(id=detail.material_id)
                if not material:
                    raise NotFoundException("Материал")
                result.material = material.to_read_model()

                construction = await uow.construction.find_one_or_none(id=detail.construction_id)
                if not construction:
                    raise NotFoundException("Конструкция")
                result.construction = construction.to_read_model()

                result.cone_draft_default = detail.cone_draft_default

                receive_method = await uow.receive_method.find_one_or_none(id=result.receive_method_id)
                if receive_method:
                    result.receive_method = receive_method.to_read_model()

                result.remain_cubature = round(
                    result.purpose_cubature - (result.realized_cubature + result.loading_cubature), 2)

                result.created_by_instance = (await uow.user.find_one_or_none(id=result.created_by)).to_read_model()

            # todo: вынести вычисление кубатур в отдельную функцию
            purpose_cubature = round(cubature['purpose_cubature'], 2)
            realized_cubature = round(cubature['realized_cubature'], 2)
            loading_cubature = round(cubature['loading_cubature'], 2)
            remain_cubature = round(cubature['purpose_cubature'] - (cubature['realized_cubature'] + cubature[
                'loading_cubature']), 2)
            result = {
                'requests': results,
                'purpose_cubature': purpose_cubature,
                'realized_cubature': realized_cubature,
                'loading_cubature': loading_cubature,
                'remain_cubature': remain_cubature,
            }
            await uow.commit()
            return result, total

    async def find_one_or_none(self, uow: IUnitOfWork, **filter_by) -> RequestSchema:
        async with uow:
            result = await uow.request.find_one_or_none(**filter_by)
            if not result:
                raise NotFoundException("Заявка")
            result = result.to_read_model()

            detail = await uow.detail.find_one_or_none(id=result.detail_id)
            if not detail:
                raise NotFoundException("Запись деталей")
            detail = detail.to_read_model()

            seller_company = await uow.company.find_one_or_none(id=detail.seller_company_id)
            if not seller_company:
                raise NotFoundException("Поставщик")
            result.seller_company = seller_company.to_read_model()

            client_company = await uow.company.find_one_or_none(id=detail.client_company_id)
            if not client_company:
                raise NotFoundException("Заказчик")
            result.client_company = client_company.to_read_model()

            material = await uow.material.find_one_or_none(id=detail.material_id)
            if not material:
                raise NotFoundException("Материал")
            result.material = material.to_read_model()

            object = await uow.object.find_one_or_none(id=detail.object_id)
            if object:
                result.object = object.to_read_model()

            construction = await uow.construction.find_one_or_none(id=detail.construction_id)
            if construction:
                result.construction = construction.to_read_model()

            result.cone_draft_default = detail.cone_draft_default

            receive_method = await uow.receive_method.find_one_or_none(id=result.receive_method_id)
            if receive_method:
                result.receive_method = receive_method.to_read_model()

            created_by_instance = await uow.user.find_one_or_none(id=result.created_by)
            if created_by_instance:
                result.created_by_instance = created_by_instance.to_read_model()

            result.remain_cubature = round(
                result.purpose_cubature - (result.realized_cubature + result.loading_cubature), 2)

            await uow.commit()
            return result

    async def update(self, uow: IUnitOfWork, id: int, new_data: RequestSchemaUpdate) -> RequestSchema:
        updated_data = new_data.model_dump()

        async with uow:
            request = await uow.request.find_one_or_none(id=id)
            if not request:
                raise NotFoundException("Заявка")

            if request.realized_cubature < updated_data['purpose_cubature']:
                updated_data['is_finished'] = False
                updated_data['finished_at'] = None

            detail = {
                'seller_company_id': updated_data.pop('seller_company_id'),
                'client_company_id': updated_data.pop('client_company_id'),
                'material_id': updated_data.pop('material_id'),
                'construction_id': updated_data.pop('construction_id'),
                'cone_draft_default': updated_data.pop('cone_draft_default'),
                'object_id': updated_data.pop('object_id'),
            }
            receive_method = None
            seller_company = await uow.company.find_one_or_none(id=detail['seller_company_id'])
            if not seller_company:
                raise BadRequestException("invalid seller company id")

            client_company = await uow.company.find_one_or_none(id=detail['client_company_id'])
            if not client_company:
                raise BadRequestException("invalid client company id")

            material = await uow.material.find_one_or_none(id=detail['material_id'])
            if not material:
                raise BadRequestException("invalid material id")

            construction = await uow.construction.find_one_or_none(id=detail['construction_id'])
            if not construction:
                raise BadRequestException("invalid construction id")

            object = await uow.object.find_one_or_none(id=detail['object_id'])
            if not object:
                raise BadRequestException("invalid object id")

            if updated_data['receive_method_id']:
                receive_method = await uow.receive_method.find_one_or_none(id=updated_data['receive_method_id'])
                if not receive_method:
                    raise BadRequestException("invalid receive method id")

            updated_data['is_call'] = NotificationStatusEnum.initial
            result = await uow.request.update(id, updated_data)

            detail = await uow.detail.update(result.detail_id, detail)
            result.detail_id = result.detail_id

            result.seller_company = seller_company.to_read_model()
            result.client_company = client_company.to_read_model()
            result.material = material.to_read_model()
            result.construction = construction.to_read_model()
            result.cone_draft_default = detail.cone_draft_default
            result.object = object.to_read_model()

            result.created_by_instance = (await uow.user.find_one_or_none(id=result.created_by)).to_read_model()
            if receive_method:
                result.receive_method = receive_method.to_read_model()
            await uow.commit()
            return result

    async def close_request(self, uow: IUnitOfWork, id: int) -> RequestSchema:
        async with uow:
            result = await uow.request.find_one_or_none(id=id)
            if not result:
                raise NotFoundException("Заявка")
            result = result.to_read_model()

            if result.realized_cubature == 0:
                raise BadRequestException("Реализованная кубатура не может быть равна нулю, деактивируйте заявку")

            if result.loading_cubature != 0:
                raise BadRequestException("Нельзя закрыть досрочно заявку с незавершенными отвесами")

            updated_request = await uow.request.sync_data(id)

            updated_data = {
                'purpose_cubature': updated_request.realized_cubature
            }

            result = await uow.request.update(id, updated_data)
            await uow.request.sync_data(id)
            await uow.commit()
            return result

    async def change_is_active(self, uow: IUnitOfWork, id: int, new_data: RequestSchemaIsActive) -> RequestSchema:
        updated_data = new_data.model_dump()
        async with uow:
            result = await uow.request.find_one_or_none(id=id)
            if not result:
                raise NotFoundException("Заявка")
            result = result.to_read_model()
            if result.loading_cubature + result.realized_cubature != 0:
                raise BadRequestException("Вы не можете деактивировать начатую заявку")

            result = await uow.request.update(id, updated_data)
            detail = (await uow.detail.find_one_or_none(id=result.detail_id)).to_read_model()
            result.seller_company = (await uow.company.find_one_or_none(id=detail.seller_company_id)).to_read_model()
            result.client_company = (await uow.company.find_one_or_none(id=detail.client_company_id)).to_read_model()
            result.material = (await uow.material.find_one_or_none(id=detail.material_id)).to_read_model()
            result.construction = (await uow.construction.find_one_or_none(id=detail.construction_id)).to_read_model()
            result.cone_draft_default = detail.cone_draft_default
            result.object = (await uow.object.find_one_or_none(id=detail.object_id)).to_read_model()

            result.created_by_instance = (await uow.user.find_one_or_none(id=result.created_by)).to_read_model()

            receive_method = await uow.receive_method.find_one_or_none(id=result.receive_method_id)
            if receive_method:
                result.receive_method = receive_method.to_read_model()
            await uow.commit()
            return result
