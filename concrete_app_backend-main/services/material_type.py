from typing import Tuple, List, Any

from exceptions import NotFoundException
from models.material_type import MaterialType
from schemas.material_type import MaterialTypeSchemaAdd, MaterialTypeSchema, MaterialTypeSchemaUpdate
from utils.unitofwork import IUnitOfWork


class MaterialTypeService:
    async def get_all(self, uow: IUnitOfWork, limit: int, offset: int, is_for_dependent: bool) -> tuple[Any, Any]:
        async with uow:
            is_for_dependent_filter = True
            if isinstance(is_for_dependent, bool):
                is_for_dependent_filter = MaterialType.is_for_dependent == is_for_dependent

            results, total = await uow.material_type.get_all(is_for_dependent_filter, limit=limit, offset=offset)
            return results, total

    async def find_one_or_none(self, uow: IUnitOfWork, **filter_by) -> MaterialTypeSchema:
        async with uow:
            result = await uow.material_type.find_one_or_none(**filter_by)
            if not result:
                raise NotFoundException("Тип материала")
            result = result.to_read_model()
            return result
