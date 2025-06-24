from typing import List, Optional

from fastapi import APIRouter, Depends, status

from api.dependencies import get_current_user, UOWDep, check_permission
from exceptions import InvalidTokenException
from models.user import User
from schemas.user import UserSchemaCreate, UserSchema, UserSchemaUpdate, UserSchemaIsActive, LoginSchema
from services.user import UserService
from utils.response_formatting import format_response

auth_router = APIRouter(prefix="/auth", tags=["Авторизация"])
user_router = APIRouter(prefix="/users", tags=["Пользователи"])


@auth_router.post("/login")
async def login(
        uow: UOWDep,
        credentials: LoginSchema,
) -> dict:
    user = await UserService().authenticate_user(uow, credentials.username, credentials.password)
    token = await UserService().create_token(uow, user.id)
    return format_response(token)


@user_router.post("/create", status_code=status.HTTP_201_CREATED)
async def create(
        uow: UOWDep,
        user: UserSchemaCreate,
        permissions: list = Depends(check_permission("create_user")),
        current_user: User = Depends(get_current_user),
) -> dict:
    user = await UserService().create(uow, user)
    return format_response(user)


@user_router.get("")
async def get_users_list(
        uow: UOWDep,
        offset: Optional[int] = 0,
        limit: Optional[int] = 100,
        is_active: bool = True,
        is_desc: bool = True,
        order_attribute: Optional[str] = "id",
        current_user: User = Depends(get_current_user)
) -> dict:
    user, total = await UserService().get_all(uow, is_desc, order_attribute,offset=offset, limit=limit, is_active=is_active)
    return format_response(user, total)


@user_router.get("/me")
async def get_current_user_api(
        uow: UOWDep,
        current_user: User = Depends(get_current_user)
) -> dict:
    if isinstance(current_user, dict):
        return current_user
    user = await UserService().find_one_or_none(uow, id=current_user.id)
    return format_response(user)


# @user_router.put("/me")
# async def update_current_user(
#         uow: UOWDep,
#         user: UserSchemaUpdate,
#         current_user: User = Depends(get_current_user)
# ) -> dict:
#     user = await UserService().update(uow, current_user.id, user)
#     return format_response(user)


@user_router.get("/{user_id}")
async def get_user(
        uow: UOWDep,
        user_id: int,
        current_user: User = Depends(get_current_user)
) -> dict:
    user = await UserService().find_one_or_none(uow, id=user_id)
    return format_response(user)


@user_router.put("/{user_id}")
async def update_user(
        uow: UOWDep,
        user_id: int,
        user: UserSchemaUpdate,
        permissions: list = Depends(check_permission("edit_user")),
        current_user: User = Depends(get_current_user)
) -> dict:
    user = await UserService().update(uow, user_id, user)
    return format_response(user)


@user_router.patch(path="/is_active/{user_id}", description='Активация/Деактивация значения')
async def change_is_active(
        uow: UOWDep,
        user_id: int,
        user_update: UserSchemaIsActive,
        permissions: list = Depends(check_permission("deactivate_user")),
        current_user: User = Depends(get_current_user),
) -> dict:
    user = await UserService().change_is_active(uow, user_id, user_update)
    return format_response(user)
