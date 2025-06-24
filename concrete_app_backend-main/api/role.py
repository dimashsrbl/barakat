from fastapi import APIRouter, Depends

from api.dependencies import UOWDep, get_current_user
from models.user import User
from schemas.role import RoleSchema, RoleSchemaAdd, RoleSchemaUpdate
from services.role import RoleService
from utils.response_formatting import format_response

router = APIRouter(
    prefix="/role",
    tags=["Роли"],
)


@router.get("/get", description='Получить все значения')
async def get_all_roles(
        uow: UOWDep,
        limit: int = None,
        offset: int = None,
        current_user: User = Depends(get_current_user),
) -> dict:
    role, total = await RoleService().get_all(uow, limit, offset)
    return format_response(role, total)


@router.get(path="/get/{role_id}", description='Получить значение по id')
async def get_role_by_id(
        uow: UOWDep, role_id: int,
        current_user: User = Depends(get_current_user),
) -> dict:
    role = await RoleService().find_one_or_none(uow, id=role_id)
    return format_response(role)