from exceptions import NotFoundException
from schemas.role import RoleSchemaAdd, RoleSchema, RoleSchemaUpdate
from utils.unitofwork import IUnitOfWork


class RoleService:
    async def get_all(self, uow: IUnitOfWork, limit: int, offset: int) -> list[RoleSchema]:
        async with uow:
            results, total = await uow.role.get_all(limit=limit, offset=offset)
            return results, total

    async def find_one_or_none(self, uow: IUnitOfWork, **filter_by) -> RoleSchema:
        async with uow:
            result = await uow.role.find_one_or_none(**filter_by)
            if not result:
                raise NotFoundException("Роль")
            result = result.to_read_model()

            return result
