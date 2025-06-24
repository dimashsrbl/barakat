from typing import Any

from utils.unitofwork import IUnitOfWork


class RolePermissionService:
    async def get_all(self, uow: IUnitOfWork, **filter_by) -> tuple[Any, Any]:
        async with uow:
            results, total = await uow.role_permission.get_all(**filter_by)
            return results, total
