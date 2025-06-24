import datetime
from datetime import timedelta
from typing import Tuple, List, Any

from sqlalchemy import or_, and_, select

from config import settings
from db.db import db_helper
from exceptions import NotFoundException, AlreadyExistException, BadRequestException
from models.detail import Detail
from models.object import Object
from models.request import Request
from schemas.company import CompanyTypeEnum
from schemas.object import ObjectSchemaAdd, ObjectSchema, ObjectSchemaUpdate, ObjectSchemaIsActive
from utils.general_utils import get_order_by, validate_sort_column
from utils.unitofwork import IUnitOfWork


class ObjectService:
    async def create(self, uow: IUnitOfWork, data: ObjectSchemaAdd) -> ObjectSchema:
        data_dict = data.model_dump()
        material_type_ids = data_dict.pop('material_type_ids')

        async with uow:
            result = await uow.object.find_one_or_none(name=data_dict['name'])
            if result:
                raise AlreadyExistException("Объект")

            company = await uow.company.find_one_or_none(id=data_dict['company_id'])
            if not company:
                raise BadRequestException("Invalid company id")
            result = await uow.object.create(data_dict)
            result = result.to_read_model()

            result.company = company.to_read_model()

            await uow.material_type_object.delete(object_id=result.id)
            if not await self.add_link(uow=uow, object_id=result.id,
                                       material_type_ids=material_type_ids):
                raise BadRequestException("invalid value in the transmitted list of material types")

            for material_type_id in material_type_ids:
                material_type = await uow.material_type.find_one_or_none(id=material_type_id)
                if material_type:
                    result.material_types.append(material_type.to_read_model())
            await uow.commit()
            return result

    async def get_all(self, uow: IUnitOfWork, is_desc: bool, order_attribute: str, name: str, limit: int, offset: int, company_id, is_for_requests, **filter_by) \
            -> tuple[Any, Any]:
        validate_sort_column(order_attribute, Object)
        order_by = get_order_by([{"is_desc": is_desc, "name": order_attribute}])

        name_contain_filter = True
        if name:
            name_contain_filter = Object.name.ilike(f'%{name}%')
        if is_for_requests:
            today_start = datetime.datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
            tomorrow_start = (datetime.datetime.now().replace(hour=0, minute=0, second=0, microsecond=0) +
                              timedelta(days=1))

            date_filter = (
                or_(
                    and_(
                        Request.is_finished == False,
                        Request.purpose_start < today_start,
                        Request.is_active == True
                    ),
                    and_(
                        Request.purpose_start >= today_start,
                        Request.purpose_start < tomorrow_start,
                        Request.is_active == True
                    )
                )
            )

            async with db_helper.get_db_session() as session:
                stmt = (
                    select(
                        Object
                    )
                    .distinct(Object.id)
                    .join(Detail, Detail.object_id == Object.id)
                    .join(Request, Request.detail_id == Detail.id)
                    .filter(date_filter)
                )
                raw = await session.execute(stmt)
                res = [row[0].to_read_model() for row in raw.all()]
                return res, len(res)

        async with uow:
            if company_id:
                company = await uow.company.find_one_or_none(id=company_id)
                if not company:
                    raise BadRequestException("Компания не существует")
                results, total = await uow.object.get_all(name_contain_filter, order_by=order_by, limit=limit, offset=offset, **filter_by,
                                                          company_id=company_id)
                if company.company_type == CompanyTypeEnum.PP:
                    default_object_to_add = await uow.object.find_one_or_none(name=settings.DEFAULT_OBJECT_NAME_FOR_PRIVATE_PERSON)

                    if default_object_to_add:
                        results.insert(0, default_object_to_add.to_read_model())

                return results, total

            results, total = await uow.object.get_all(name_contain_filter, order_by=order_by, limit=limit, offset=offset, **filter_by)
            for result in results:
                company = await uow.company.find_one_or_none(id=result.company_id)
                result.company = company.to_read_model()
            return results, total

    async def find_one_or_none(self, uow: IUnitOfWork, **filter_by) -> ObjectSchema:
        async with uow:
            result = await uow.object.find_one_or_none(**filter_by)
            if not result:
                raise NotFoundException("Объект")
            result = result.to_read_model()

            company = await uow.company.find_one_or_none(id=result.company_id)
            result.company = company.to_read_model()

            material_types_objects, _ = await uow.material_type_object.get_all(object_id=result.id)
            for material_type_object in material_types_objects:
                if material_type_object:
                    material_type = await uow.material_type.find_one_or_none(
                        id=material_type_object.material_type_id)
                    result.material_types.append(material_type.to_read_model())
            return result

    async def update(self, uow: IUnitOfWork, id: int, new_data: ObjectSchemaUpdate) -> ObjectSchema:
        updated_data = new_data.model_dump()
        material_type_ids = updated_data.pop('material_type_ids')
        async with uow:
            result = await uow.object.find_one_or_none(id=id)
            if not result:
                raise NotFoundException("Объект")

            if result.to_read_model().name != updated_data['name']:
                result = await uow.object.find_one_or_none(name=updated_data['name'])
                if result:
                    result = result.to_read_model()
                    if result.name == updated_data['name']:
                        raise AlreadyExistException("Объект")

            company = await uow.company.find_one_or_none(id=updated_data['company_id'])
            if not company:
                raise BadRequestException("Invalid company id")
            result = await uow.object.update(id, updated_data)
            result.company = company.to_read_model()

            await uow.material_type_object.delete(object_id=id)
            if not await self.add_link(uow=uow, object_id=result.id,
                                       material_type_ids=material_type_ids):
                raise BadRequestException("invalid value in the transmitted list of material types")

            for material_type_id in material_type_ids:
                result.material_types.append(await uow.material_type.find_one_or_none(id=material_type_id))
            await uow.commit()
            return result

    async def add_link(self, uow: IUnitOfWork, object_id: int, material_type_ids: list[int]):
        for material_type_id in material_type_ids:
            material_type = await uow.material_type.find_one_or_none(id=material_type_id)
            if material_type:
                await uow.material_type_object.create(
                    {
                        'object_id': object_id,
                        'material_type_id': material_type_id,
                    }
                )
            else:
                return False
        return True

    async def change_is_active(self, uow, id: int, new_data: ObjectSchemaIsActive) -> ObjectSchema:
        updated_data = new_data.model_dump()
        async with uow:
            result = await uow.object.find_one_or_none(id=id)
            if not result:
                raise NotFoundException("Объект")

            result = await uow.object.update(id, updated_data)

            company = await uow.company.find_one_or_none(id=result.company_id)
            result.company = company.to_read_model()

            material_types_objects, _ = await uow.material_type_object.get_all(object_id=result.id)
            for material_type_object in material_types_objects:
                if material_type_object:
                    material_type = await uow.material_type.find_one_or_none(
                        id=material_type_object.material_type_id)
                    result.material_types.append(material_type.to_read_model())
            await uow.commit()
            return result
