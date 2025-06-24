from typing import Optional

from fastapi import APIRouter, Depends

from api.dependencies import UOWDep, get_current_user, check_permission
from models.user import User
from schemas.carrier import CarrierSchemaAdd, CarrierSchema, CarrierSchemaUpdate, CarrierSchemaIsActive
from services.carrier import CarrierService
from utils.response_formatting import format_response

router = APIRouter(
    prefix="/carrier",
    tags=["Перевозчик"],
)


@router.post("/create", description='Создать нового перевозчика')
async def create_carrier(
        carrier: CarrierSchemaAdd,
        uow: UOWDep,
        permissions: list = Depends(check_permission("create_handbook")),
        current_user: User = Depends(get_current_user),
) -> dict:
    carrier = await CarrierService().create(uow, carrier)
    return format_response(carrier)


@router.get("/get", description='Получить все значения')
async def get_all_carriers(
        uow: UOWDep,
        limit: int = None,
        offset: int = None,
        is_active: bool = True,
        is_desc: bool = True,
        order_attribute: Optional[str] = "id",
        name: Optional[str] = None,
        current_user: User = Depends(get_current_user),
) -> dict:
    carriers, total = await CarrierService().get_all(uow, is_desc, order_attribute, name, limit, offset, is_active=is_active)
    return format_response(carriers, total)


@router.get(path="/get/{carrier_id}", description='Получить значение по id')
async def get_carrier_by_id(
        uow: UOWDep, carrier_id: int,
        current_user: User = Depends(get_current_user),
) -> dict:
    carrier = await CarrierService().find_one_or_none(uow, id=carrier_id)
    return format_response(carrier)


@router.put(path="/update/{carrier_id}", description='Обновить значение')
async def update_carrier_by_id(
        uow: UOWDep,
        carrier_id: int,
        carrier_update: CarrierSchemaUpdate,
        permissions: list = Depends(check_permission("edit_handbook")),
        current_user: User = Depends(get_current_user),
) -> dict:
    carrier = await CarrierService().update(uow, carrier_id, carrier_update)
    return format_response(carrier)


@router.patch(path="/is_active/{carrier_id}", description='Активация/Деактивация значения')
async def change_is_active(
        uow: UOWDep,
        carrier_id: int,
        carrier_update: CarrierSchemaIsActive,
        permissions: list = Depends(check_permission("deactivate_handbook")),
        current_user: User = Depends(get_current_user),
) -> dict:
    carrier = await CarrierService().change_is_active(uow, carrier_id, carrier_update)
    return format_response(carrier)
