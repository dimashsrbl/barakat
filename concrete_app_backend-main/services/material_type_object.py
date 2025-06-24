from typing import Tuple, List, Any

from schemas.material_type_object import MaterialTypeObjectSchemaAdd, MaterialTypeObjectSchema, \
    MaterialTypeObjectSchemaUpdate
from utils.unitofwork import IUnitOfWork


class MaterialTypeObjectService:
    async def create(self, uow: IUnitOfWork, data: MaterialTypeObjectSchemaAdd) -> MaterialTypeObjectSchema:
        data_dict = data.model_dump()
        async with uow:
            result = await uow.material_type_object.create(data_dict)
            await uow.commit()
            return result

    async def get_all(self, uow: IUnitOfWork, limit: int, offset: int) -> tuple[Any, Any]:
        async with uow:
            results, total = await uow.material_type_object.get_all(limit=limit, offset=offset)
            return results, total

    async def update(self, uow: IUnitOfWork, id: int,
                     new_data: MaterialTypeObjectSchemaUpdate) -> MaterialTypeObjectSchema:
        updated_data = new_data.model_dump()
        async with uow:
            result = await uow.material_type_object.update(id, updated_data)
            await uow.commit()
            return result
