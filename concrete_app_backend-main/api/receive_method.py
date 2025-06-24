from typing import Optional

from fastapi import APIRouter, Depends

from api.dependencies import UOWDep, get_current_user, check_permission
from models.user import User
from schemas.receive_method import ReceiveMethodSchemaAdd, ReceiveMethodSchema, ReceiveMethodSchemaUpdate, \
    ReceiveMethodSchemaIsActive
from services.receive_method import ReceiveMethodService
from utils.response_formatting import format_response

router = APIRouter(
    prefix="/receive_method",
    tags=["Способ приёмки"],
)


@router.post("/create", description='Создать значение')
async def create_receive_method(
        receive_method: ReceiveMethodSchemaAdd,
        uow: UOWDep,
        permissions: list = Depends(check_permission("create_handbook")),
        current_user: User = Depends(get_current_user),
) -> dict:
    receive_method = await ReceiveMethodService().create(uow, receive_method)
    return format_response(receive_method)


@router.get("/get", description='Получить все значения')
async def get_all_receive_methods(
        uow: UOWDep,
        limit: int = None,
        offset: int = None,
        is_active: bool = True,
        is_desc: bool = True,
        order_attribute: Optional[str] = "id",
        name: Optional[str] = None,
        current_user: User = Depends(get_current_user),
) -> dict:
    receive_method, total = await ReceiveMethodService().get_all(uow, is_desc, order_attribute, name, limit, offset, is_active=is_active)
    return format_response(receive_method, total)


@router.get(path="/get/{receive_method_id}", description='Получить значение по id')
async def get_receive_method_by_id(
        uow: UOWDep, receive_method_id: int,
        current_user: User = Depends(get_current_user),
) -> dict:
    receive_method = await ReceiveMethodService().find_one_or_none(uow, id=receive_method_id)
    return format_response(receive_method)


@router.put(path="/update/{receive_method_id}", description='Обновить значение')
async def update_receive_method_by_id(
        uow: UOWDep,
        receive_method_id: int,
        receive_method_update: ReceiveMethodSchemaUpdate,
        permissions: list = Depends(check_permission("edit_handbook")),
        current_user: User = Depends(get_current_user),
) -> dict:
    receive_method = await ReceiveMethodService().update(uow, receive_method_id, receive_method_update)
    return format_response(receive_method)


@router.patch(path="/is_active/{receive_method_id}", description='Активация/Деактивация значения')
async def change_is_active(
        uow: UOWDep,
        receive_method_id: int,
        receive_method_update: ReceiveMethodSchemaIsActive,
        permissions: list = Depends(check_permission("deactivate_handbook")),
        current_user: User = Depends(get_current_user),
) -> dict:
    receive_method = await ReceiveMethodService().change_is_active(uow, receive_method_id, receive_method_update)
    return format_response(receive_method)
