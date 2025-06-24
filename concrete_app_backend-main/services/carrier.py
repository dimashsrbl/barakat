from typing import Any

from exceptions import AlreadyExistException, NotFoundException
from models.carrier import Carrier
from schemas.carrier import CarrierSchemaAdd, CarrierSchema, CarrierSchemaUpdate, CarrierSchemaIsActive
from utils.general_utils import get_order_by, validate_sort_column
from utils.unitofwork import IUnitOfWork


class CarrierService:
    async def create(self, uow: IUnitOfWork, data: CarrierSchemaAdd) -> CarrierSchema:
        data_dict = data.model_dump()
        async with uow:
            carrier = await uow.carrier.find_one_or_none(name=data_dict['name'])
            if carrier:
                raise AlreadyExistException("Перевозчик")

            result = await uow.carrier.create(data_dict)
            await uow.commit()
            return result

    async def get_all(self, uow: IUnitOfWork, is_desc: bool, order_attribute: str, name: str, limit: int, offset: int, **filter_by) -> tuple[Any, Any]:
        validate_sort_column(order_attribute, Carrier)
        order_by = get_order_by([{"is_desc": is_desc, "name": order_attribute}])

        name_contain_filter = True
        async with uow:
            if name:
                name_contain_filter = Carrier.name.ilike(f'%{name}%')
            results, total = await uow.carrier.get_all(name_contain_filter, order_by=order_by, limit=limit, offset=offset, **filter_by)
            return results, total

    async def find_one_or_none(self, uow: IUnitOfWork, **filter_by) -> CarrierSchema:
        async with uow:
            result = await uow.carrier.find_one_or_none(**filter_by)
            if not result:
                raise NotFoundException("Перевозчик")
            result = result.to_read_model()
            return result

    async def update(self, uow: IUnitOfWork, id: int, new_data: CarrierSchemaUpdate) -> CarrierSchema:
        updated_data = new_data.model_dump()
        async with uow:
            result = await uow.carrier.find_one_or_none(id=id)
            if not result:
                raise NotFoundException("Перевозчик")

            if result.to_read_model().name != updated_data['name']:
                result = await uow.carrier.find_one_or_none(name=updated_data['name'])
                if result:
                    result = result.to_read_model()
                    if result.name == updated_data['name']:
                        raise AlreadyExistException("Перевозчик")

            result = await uow.carrier.update(id, updated_data)
            await uow.commit()
            return result

    async def change_is_active(self, uow, id: int, new_data: CarrierSchemaIsActive) -> CarrierSchema:
        updated_data = new_data.model_dump()
        async with uow:
            result = await uow.carrier.find_one_or_none(id=id)
            if not result:
                raise NotFoundException("Перевозчик")

            result = await uow.carrier.update(id, updated_data)
            await uow.commit()
            return result
