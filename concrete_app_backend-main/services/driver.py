from typing import Any

from exceptions import AlreadyExistException, NotFoundException
from models.driver import Driver
from schemas.driver import DriverSchemaAdd, DriverSchema, DriverSchemaUpdate, DriverSchemaIsActive
from utils.general_utils import get_order_by, validate_sort_column
from utils.unitofwork import IUnitOfWork


class DriverService:
    async def create(self, uow: IUnitOfWork, data: DriverSchemaAdd) -> DriverSchema:
        data_dict = data.model_dump()
        async with uow:
            driver = await uow.driver.find_one_or_none(name=data_dict['name'])
            if driver:
                raise AlreadyExistException("Водитель")

            result = await uow.driver.create(data_dict)
            await uow.commit()
            return result

    async def get_all(self, uow: IUnitOfWork, is_desc: bool, order_attribute: str, name: str, limit: int, offset: int, **filter_by) -> tuple[Any, Any]:
        validate_sort_column(order_attribute, Driver)
        order_by = get_order_by([{"is_desc": is_desc, "name": order_attribute}])

        name_contain_filter = True
        if name:
            name_contain_filter = Driver.name.ilike(f'%{name}%')

        async with uow:
            results, total = await uow.driver.get_all(name_contain_filter, order_by=order_by, limit=limit, offset=offset, **filter_by)
            return results, total

    async def find_one_or_none(self, uow: IUnitOfWork, **filter_by) -> DriverSchema:
        async with uow:
            result = await uow.driver.find_one_or_none(**filter_by)
            if not result:
                raise NotFoundException("Водитель")
            result = result.to_read_model()
            return result

    async def update(self, uow: IUnitOfWork, id: int, new_data: DriverSchemaUpdate) -> DriverSchema:
        updated_data = new_data.model_dump()
        async with uow:
            result = await uow.driver.find_one_or_none(id=id)
            if not result:
                raise NotFoundException("Водитель")

            if result.to_read_model().name != updated_data['name']:
                result = await uow.driver.find_one_or_none(name=updated_data['name'])
                if result:
                    result = result.to_read_model()
                    if result.name == updated_data['name']:
                        raise AlreadyExistException("Водитель")

            result = await uow.driver.update(id, updated_data)
            await uow.commit()
            return result

    async def change_is_active(self, uow, id: int, new_data: DriverSchemaIsActive) -> DriverSchema:
        updated_data = new_data.model_dump()
        async with uow:
            result = await uow.driver.find_one_or_none(id=id)
            if not result:
                raise NotFoundException("Водитель")

            result = await uow.driver.update(id, updated_data)
            await uow.commit()
            return result
