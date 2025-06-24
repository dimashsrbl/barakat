from exceptions import AlreadyExistException, NotFoundException
from models.receive_method import ReceiveMethod
from schemas.receive_method import ReceiveMethodSchemaAdd, ReceiveMethodSchema, ReceiveMethodSchemaUpdate, \
    ReceiveMethodSchemaIsActive
from utils.general_utils import get_order_by, validate_sort_column
from utils.unitofwork import IUnitOfWork


class ReceiveMethodService:
    async def create(self, uow: IUnitOfWork, data: ReceiveMethodSchemaAdd) -> ReceiveMethodSchema:
        data_dict = data.model_dump()
        async with uow:
            receive_method = await uow.receive_method.find_one_or_none(name=data_dict['name'])
            if receive_method:
                raise AlreadyExistException("Способ приёмки")

            result = await uow.receive_method.create(data_dict)
            result.receive_method_type = (
                await uow.receive_method_type.find_one_or_none(id=result.receive_method_type_id)).to_read_model()
            await uow.commit()
            return result

    async def get_all(self, uow: IUnitOfWork, is_desc: bool, order_attribute: str, name: str, limit: int, offset: int, **filter_by) -> list[
        ReceiveMethodSchema]:
        validate_sort_column(order_attribute, ReceiveMethod)
        order_by = get_order_by([{"is_desc": is_desc, "name": order_attribute}])

        name_contain_filter = True
        if name:
            name_contain_filter = ReceiveMethod.name.ilike(f'%{name}%')

        async with uow:
            results, total = await uow.receive_method.get_all(name_contain_filter, order_by=order_by, limit=limit, offset=offset,
                                                              **filter_by)
            for result in results:
                result.receive_method_type = (
                    await uow.receive_method_type.find_one_or_none(id=result.receive_method_type_id)).to_read_model()
            return results, total

    async def find_one_or_none(self, uow: IUnitOfWork, **filter_by) -> ReceiveMethodSchema:
        async with uow:
            result = await uow.receive_method.find_one_or_none(**filter_by)
            if not result:
                raise NotFoundException("Способ приёмки")

            result = result.to_read_model()
            result.receive_method_type = (await uow.receive_method_type.find_one_or_none(id=result.receive_method_type_id)).to_read_model()

            return result

    async def update(self, uow: IUnitOfWork, id: int, new_data: ReceiveMethodSchemaUpdate) -> ReceiveMethodSchema:
        updated_data = new_data.model_dump()
        async with uow:
            result = await uow.receive_method.find_one_or_none(id=id)
            if not result:
                raise NotFoundException("Способ приёмки")

            if result.to_read_model().name != updated_data['name']:
                result = await uow.receive_method.find_one_or_none(name=updated_data['name'])
                if result:
                    result = result.to_read_model()
                    if result.name == updated_data['name']:
                        raise AlreadyExistException("Способ приёмки")

            result = await uow.receive_method.update(id, updated_data)
            result.receive_method_type = (await uow.receive_method_type.find_one_or_none(id=result.receive_method_type_id)).to_read_model()

            await uow.commit()
            return result

    async def change_is_active(self, uow, id: int, new_data: ReceiveMethodSchemaIsActive) -> ReceiveMethodSchema:
        updated_data = new_data.model_dump()
        async with uow:
            result = await uow.receive_method.find_one_or_none(id=id)
            if not result:
                raise NotFoundException("Способ приёмки")

            result = await uow.receive_method.update(id, updated_data)
            result.receive_method_type = (await uow.receive_method_type.find_one_or_none(id=result.receive_method_type_id)).to_read_model()

            await uow.commit()
            return result
