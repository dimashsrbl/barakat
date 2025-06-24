import datetime
from datetime import timedelta
from typing import Union, Any, Optional

from sqlalchemy import or_, and_, select, distinct

from db.db import db_helper
from exceptions import AlreadyExistException, NotFoundException, BadRequestException
from models.detail import Detail
from models.material import Material
from models.request import Request
from schemas.material import MaterialSchemaAdd, MaterialSchema, MaterialSchemaUpdate, MaterialSchemaIsActive
from utils.general_utils import get_order_by, validate_sort_column
from utils.unitofwork import IUnitOfWork


class MaterialService:
    async def create(self, uow: IUnitOfWork, data: MaterialSchemaAdd) -> MaterialSchema:
        data_dict = data.model_dump()
        async with uow:
            material = await uow.material.find_one_or_none(name=data_dict['name'])
            if material:
                raise AlreadyExistException("Материал")

            is_exist_by_fk = await uow.material_type.find_one_or_none(id=data_dict['material_type_id'])
            if not is_exist_by_fk:
                raise BadRequestException("invalid material type id")

            result = (await uow.material.create(data_dict)).to_read_model()
            material_type = await uow.material_type.find_one_or_none(id=result.material_type_id)
            if material_type:
                result.material_type = material_type.to_read_model()
            await uow.commit()
            return result

    async def get_all(self, uow: IUnitOfWork, is_desc: bool, order_attribute: str, name: str, limit: int, offset: int,
                      object_id: int,
                      material_type_id: Optional[int], is_for_dependent: bool, is_for_independent: bool,
                      is_for_requests: bool,
                      **filter_by) -> \
            Union[tuple[list[Any], int], tuple[Any, Any]]:
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
                        Material
                    )
                    .distinct(Material.id)
                    .join(Detail, Detail.material_id == Material.id)
                    .join(Request, Request.detail_id == Detail.id)
                    .filter(date_filter)
                )
                raw = await session.execute(stmt)
                res = [row[0].to_read_model() for row in raw.all()]
                return res, len(res)

        name_contain_filter = True
        if name:
            name_contain_filter = Material.name.ilike(f'%{name}%')
        async with uow:
            validate_sort_column(order_attribute, Material)
            order_by = get_order_by([{"is_desc": is_desc, "name": order_attribute}])

            material_types_ids = []
            object_filter = True
            material_type_filter = True
            is_for_dependent_filter = True
            is_for_independent_filter = True
            is_for_requests_filter = True

            if object_id:
                if not await uow.object.find_one_or_none(id=object_id):
                    raise BadRequestException(f"Invalid object id")

                material_types_objects, _ = await uow.material_type_object.get_all(object_id=object_id)
                for material_type_object in material_types_objects:
                    material_types_ids.append(material_type_object.material_type_id)

                object_filter = Material.material_type_id.in_(material_types_ids)

            if material_type_id:
                if not await uow.material_type.find_one_or_none(id=material_type_id):
                    raise BadRequestException(f"Invalid object id")

                material_types_ids = [material_type_id]

                material_type_filter = Material.material_type_id.in_(material_types_ids)

            if isinstance(is_for_dependent, bool):
                material_types, _ = await uow.material_type.get_all(is_for_dependent=is_for_dependent)
                material_types_ids = []
                for material_type in material_types:
                    material_types_ids.append(material_type.id)
                is_for_dependent_filter = Material.material_type_id.in_(material_types_ids)

            if isinstance(is_for_independent, bool):
                material_types, _ = await uow.material_type.get_all(is_for_independent=is_for_independent)
                material_types_ids = []
                for material_type in material_types:
                    material_types_ids.append(material_type.id)
                is_for_independent_filter = Material.material_type_id.in_(material_types_ids)

            results, total = await uow.material.get_all(name_contain_filter, object_filter, material_type_filter, is_for_dependent_filter,
                                                        is_for_independent_filter,
                                                        order_by=order_by, limit=limit, offset=offset, **filter_by)
            for result in results:
                material_type = await uow.material_type.find_one_or_none(id=result.material_type_id)
                if material_type:
                    result.material_type = material_type.to_read_model()
            return results, total

    async def find_one_or_none(self, uow: IUnitOfWork, **filter_by) -> MaterialSchema:
        async with uow:
            result = await uow.material.find_one_or_none(**filter_by)
            if not result:
                raise NotFoundException("Материал")
            result = result.to_read_model()

            material_type = await uow.material_type.find_one_or_none(id=result.material_type_id)
            if material_type:
                result.material_type = material_type.to_read_model()
            return result

    async def update(self, uow: IUnitOfWork, id: int, new_data: MaterialSchemaUpdate) -> MaterialSchema:
        updated_data = new_data.model_dump()
        async with uow:
            is_exist_by_id = await uow.material.find_one_or_none(id=id)
            if not is_exist_by_id:
                raise NotFoundException("Материал")

            if is_exist_by_id.to_read_model().name != updated_data['name']:
                result = await uow.material.find_one_or_none(name=updated_data['name'])
                if result:
                    result = result.to_read_model()
                    if result.name == updated_data['name']:
                        raise AlreadyExistException("Материал")

            is_exist_by_fk = await uow.material_type.find_one_or_none(id=updated_data['material_type_id'])
            if not is_exist_by_fk:
                raise NotFoundException("Тип материала")

            result = await uow.material.update(id, updated_data)
            material_type = await uow.material_type.find_one_or_none(id=result.material_type_id)
            if material_type:
                result.material_type = material_type.to_read_model()
            await uow.commit()
            return result

    async def change_is_active(self, uow, id: int, new_data: MaterialSchemaIsActive) -> MaterialSchema:
        updated_data = new_data.model_dump()
        async with uow:
            result = await uow.material.find_one_or_none(id=id)
            if not result:
                raise NotFoundException("Материал")

            result = await uow.material.update(id, updated_data)
            material_type = await uow.material_type.find_one_or_none(id=result.material_type_id)
            if material_type:
                result.material_type = material_type.to_read_model()
            await uow.commit()
            return result
