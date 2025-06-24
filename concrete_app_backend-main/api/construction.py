from typing import Optional

from fastapi import APIRouter, Depends

from api.dependencies import UOWDep, get_current_user, check_permission
from models.user import User
from schemas.construction import ConstructionSchemaAdd, ConstructionSchema, ConstructionSchemaUpdate, \
    ConstructionSchemaIsActive
from services.construction import ConstructionService
from utils.response_formatting import format_response

router = APIRouter(
    prefix="/construction",
    tags=["Конструкция"],
)


@router.post("/create", description='Создать значение')
async def create_construction(
        construction: ConstructionSchemaAdd,
        uow: UOWDep,
        permissions: list = Depends(check_permission("create_handbook")),
        current_user: User = Depends(get_current_user),
) -> dict:
    construction = await ConstructionService().create(uow, construction)
    return format_response(construction)


@router.get("/get", description='Получить все значения')
async def get_all_constructions(
        uow: UOWDep,
        limit: int = None,
        offset: int = None,
        is_active: bool = True,
        is_desc: bool = True,
        order_attribute: Optional[str] = "id",
        name: Optional[str] = None,
        current_user: User = Depends(get_current_user),
) -> dict:
    constructions, total = await ConstructionService().get_all(uow, is_desc, order_attribute, name, limit, offset, is_active=is_active)
    return format_response(constructions, total)


@router.get(path="/get/{construction_id}", description='Получить значение по id')
async def get_construction_by_id(
        uow: UOWDep, construction_id: int,
        current_user: User = Depends(get_current_user),
) -> dict:
    construction = await ConstructionService().find_one_or_none(uow, id=construction_id)
    return format_response(construction)


@router.put(path="/update/{construction_id}", description='Обновить значение')
async def update_construction_by_id(
        uow: UOWDep,
        construction_id: int,
        construction_update: ConstructionSchemaUpdate,
        permissions: list = Depends(check_permission("edit_handbook")),
        current_user: User = Depends(get_current_user),
) -> dict:
    construction = await ConstructionService().update(uow, construction_id, construction_update)
    return format_response(construction)


@router.patch(path="/is_active/{construction_id}", description='Активация/Деактивация значения')
async def change_is_active(
        uow: UOWDep,
        construction_id: int,
        construction_update: ConstructionSchemaIsActive,
        permissions: list = Depends(check_permission("deactivate_handbook")),
        current_user: User = Depends(get_current_user),
) -> dict:
    construction = await ConstructionService().change_is_active(uow, construction_id, construction_update)
    return format_response(construction)
