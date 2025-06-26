from typing import Optional

from fastapi import APIRouter, Depends

from api.dependencies import UOWDep, get_current_user, check_permission
from models.user import User
from schemas.material import MaterialSchemaAdd, MaterialSchemaUpdate, MaterialSchemaIsActive
from services.material import MaterialService
from utils.response_formatting import format_response

router = APIRouter(
    prefix="/material",
    tags=["Материал"],
)


@router.post("/create", description='Создать значение')
async def create_material(
        material: MaterialSchemaAdd,
        uow: UOWDep,
        permissions: list = Depends(check_permission("create_handbook")),
        current_user: User = Depends(get_current_user),
) -> dict:
    material = await MaterialService().create(uow, material)
    return format_response(material)


@router.get("/get", description='Получить все значения')
async def get_all_materials(
        uow: UOWDep,
        limit: int = None,
        offset: int = None,
        is_active: bool = True,
        is_desc: bool = True,
        order_attribute: Optional[str] = "id",
        object_id: Optional[int] = None,
        material_type_id: Optional[int] = None,
        is_for_independent: Optional[bool] = None,
        is_for_dependent: Optional[bool] = None,
        is_for_requests: Optional[bool] = None,
        name: Optional[str] = None,
        current_user: User = Depends(get_current_user),
) -> dict:
    material, total = await MaterialService().get_all(uow, is_desc, order_attribute, name, limit, offset, object_id,
                                                      material_type_id,
                                                      is_for_dependent, is_for_independent, is_for_requests,
                                                      is_active=is_active)
    return format_response(material, total)


@router.get(path="/get/{material_id}", description='Получить значение по id')
async def get_material_by_id(
        uow: UOWDep, material_id: int,
        current_user: User = Depends(get_current_user),
) -> dict:
    material = await MaterialService().find_one_or_none(uow, id=material_id)
    return format_response(material)


@router.put(path="/update/{material_id}", description='Обновить значение')
async def update_material_by_id(
        uow: UOWDep,
        material_id: int,
        material_update: MaterialSchemaUpdate,
        permissions: list = Depends(check_permission("edit_handbook")),
        current_user: User = Depends(get_current_user),
) -> dict:
    material = await MaterialService().update(uow, material_id, material_update)
    return format_response(material)


@router.patch(path="/is_active/{material_id}", description='Активация/Деактивация значения')
async def change_is_active(
        uow: UOWDep,
        material_id: int,
        material_update: MaterialSchemaIsActive,
        permissions: list = Depends(check_permission("deactivate_handbook")),
        current_user: User = Depends(get_current_user),
) -> dict:
    material = await MaterialService().change_is_active(uow, material_id, material_update)
    return format_response(material)


@router.get("", description='Получить все материалы (универсальный)')
async def get_materials(
    uow: UOWDep,
    is_active: bool = True,
    current_user: User = Depends(get_current_user),
):
    materials, _ = await uow.material.get_all(is_active=is_active)
    return format_response(materials)
