from typing import Optional

from fastapi import APIRouter, Depends

from api.dependencies import UOWDep, get_current_user, check_permission
from models.user import User
from schemas.object import ObjectSchemaAdd, ObjectSchema, ObjectSchemaUpdate, ObjectSchemaIsActive
from services.object import ObjectService
from utils.response_formatting import format_response

router = APIRouter(
    prefix="/object",
    tags=["Объект"],
)


@router.post("/create", description='Создать значение')
async def create_object(
        object: ObjectSchemaAdd,
        uow: UOWDep,
        permissions: list = Depends(check_permission("create_handbook")),
        current_user: User = Depends(get_current_user),
) -> dict:
    object = await ObjectService().create(uow, object)
    return format_response(object)


@router.get("/get", description='Получить все значения')
async def get_all_objects(
        uow: UOWDep,
        limit: int = None,
        offset: int = None,
        is_active: bool = True,
        is_desc: bool = True,
        order_attribute: Optional[str] = "id",
        company_id: Optional[int] = None,
        is_for_requests: Optional[bool] = None,
        name: Optional[str] = None,
        current_user: User = Depends(get_current_user),
) -> dict:
    object, total = await ObjectService().get_all(uow, is_desc, order_attribute, name, limit, offset, company_id, is_for_requests, is_active=is_active)
    return format_response(object, total)


@router.get(path="/get/{object_id}", description='Получить значение по id')
async def get_object_by_id(
        uow: UOWDep, object_id: int,
        current_user: User = Depends(get_current_user),
) -> dict:
    object = await ObjectService().find_one_or_none(uow, id=object_id)
    return format_response(object)


@router.put(path="/update/{object_id}", description='Обновить значение')
async def update_object_by_id(
        uow: UOWDep,
        object_id: int,
        object_update: ObjectSchemaUpdate,
        permissions: list = Depends(check_permission("edit_handbook")),
        current_user: User = Depends(get_current_user),
) -> dict:
    object = await ObjectService().update(uow, object_id, object_update)
    return format_response(object)


@router.patch(path="/is_active/{object_id}", description='Активация/Деактивация значения')
async def change_is_active(
        uow: UOWDep,
        object_id: int,
        object_update: ObjectSchemaIsActive,
        permissions: list = Depends(check_permission("deactivate_handbook")),
        current_user: User = Depends(get_current_user),
) -> dict:
    object = await ObjectService().change_is_active(uow, object_id, object_update)
    return format_response(object)
