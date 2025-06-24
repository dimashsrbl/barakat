from typing import Tuple, List, Any

from exceptions import AlreadyExistException, NotFoundException
from models.construction import Construction
from schemas.construction import ConstructionSchemaAdd, ConstructionSchema, ConstructionSchemaUpdate, \
    ConstructionSchemaIsActive
from utils.general_utils import get_order_by, validate_sort_column
from utils.unitofwork import IUnitOfWork


class ConstructionService:
    async def create(self, uow: IUnitOfWork, data: ConstructionSchemaAdd) -> ConstructionSchema:
        data_dict = data.model_dump()
        async with uow:
            construction = await uow.construction.find_one_or_none(name=data_dict['name'])
            if construction:
                raise AlreadyExistException("Конструкция")

            result = await uow.construction.create(data_dict)
            result.construction_type = (
                await uow.construction_type.find_one_or_none(id=result.construction_type_id)).to_read_model()
            await uow.commit()
            return result

    async def get_all(self, uow: IUnitOfWork, is_desc: bool, order_attribute: str, name: str, limit: int, offset: int, **filter_by) -> tuple[Any, Any]:
        validate_sort_column(order_attribute, Construction)
        order_by = get_order_by([{"is_desc": is_desc, "name": order_attribute}])

        name_contain_filter = True
        if name:
            name_contain_filter = Construction.name.ilike(f'%{name}%')

        async with uow:
            results, total = await uow.construction.get_all(name_contain_filter, order_by=order_by, limit=limit, offset=offset, **filter_by)
            for result in results:
                result.construction_type = (
                    await uow.construction_type.find_one_or_none(id=result.construction_type_id)).to_read_model()
            return results, total

    async def find_one_or_none(self, uow: IUnitOfWork, **filter_by) -> ConstructionSchema:
        async with uow:
            result = await uow.construction.find_one_or_none(**filter_by)
            if not result:
                raise NotFoundException("Конструкция")
            result = result.to_read_model()
            result.construction_type = (
                await uow.construction_type.find_one_or_none(id=result.construction_type_id)).to_read_model()
            return result

    async def update(self, uow: IUnitOfWork, id: int, new_data: ConstructionSchemaUpdate) -> ConstructionSchema:
        updated_data = new_data.model_dump()
        async with uow:
            result = await uow.construction.find_one_or_none(id=id)
            if not result:
                raise NotFoundException("Конструкция")

            if result.to_read_model().name != updated_data['name']:
                result = await uow.construction.find_one_or_none(name=updated_data['name'])
                if result:
                    result = result.to_read_model()
                    if result.name == updated_data['name']:
                        raise AlreadyExistException("Конструкция")

            result = await uow.construction.update(id, updated_data)
            result.construction_type = (
                await uow.construction_type.find_one_or_none(id=result.construction_type_id)).to_read_model()

            await uow.commit()
            return result

    async def change_is_active(self, uow, id: int, new_data: ConstructionSchemaIsActive) -> ConstructionSchema:
        updated_data = new_data.model_dump()
        async with uow:
            result = await uow.construction.find_one_or_none(id=id)
            if not result:
                raise NotFoundException("Конструкция")

            result = await uow.construction.update(id, updated_data)
            result.construction_type = (
                await uow.construction_type.find_one_or_none(id=result.construction_type_id)).to_read_model()

            await uow.commit()
            return result
