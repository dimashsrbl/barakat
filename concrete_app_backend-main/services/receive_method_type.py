from typing import Any

from exceptions import NotFoundException
from schemas.receive_method_type import ReceiveMethodTypeSchema
from utils.unitofwork import IUnitOfWork


class ReceiveMethodTypeService:
    async def get_all(self, uow: IUnitOfWork, limit: int, offset: int) -> tuple[Any, Any]:
        async with uow:
            results, total = await uow.receive_method_type.get_all(limit=limit, offset=offset)
            return results, total

    async def find_one_or_none(self, uow: IUnitOfWork, **filter_by) -> ReceiveMethodTypeSchema:
        async with uow:
            result = await uow.receive_method_type.find_one_or_none(**filter_by)
            if not result:
                raise NotFoundException("Тип способа приёмки")
            result = result.to_read_model()
            return result
