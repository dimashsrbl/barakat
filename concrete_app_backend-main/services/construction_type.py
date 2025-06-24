from typing import Any

from exceptions import NotFoundException
from schemas.construction_type import ConstructionTypeSchema
from utils.unitofwork import IUnitOfWork


class ConstructionTypeService:
    async def get_all(self, uow: IUnitOfWork, limit: int, offset: int) -> tuple[Any, Any]:
        async with uow:
            results, total = await uow.construction_type.get_all(limit=limit, offset=offset)
            return results, total

    async def find_one_or_none(self, uow: IUnitOfWork, **filter_by) -> ConstructionTypeSchema:
        async with uow:
            result = await uow.construction_type.find_one_or_none(**filter_by)
            if not result:
                raise NotFoundException("Тип конструкции")
            result = result.to_read_model()
            return result
