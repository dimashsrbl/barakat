from typing import Optional

from fastapi import APIRouter, Depends

from api.dependencies import UOWDep, get_current_user, check_permission
from models.user import User
from schemas.transport import TransportSchemaAdd, TransportSchema, TransportSchemaUpdate, TransportSchemaIsActive
from services.transport import TransportService
from utils.response_formatting import format_response

router = APIRouter(
    prefix="/transport",
    tags=["Транспорт"],
)


@router.post("/create", description='Создать значение')
async def create_transport(
        transport: TransportSchemaAdd,
        uow: UOWDep,
        permissions: list = Depends(check_permission("create_handbook")),
        current_user: User = Depends(get_current_user),
) -> dict:
    transport = await TransportService().create(uow, transport)
    return format_response(transport)


@router.get("/get", description='Получить все значения')
async def get_all_transports(
        uow: UOWDep,
        limit: int = None,
        offset: int = None,
        is_active: bool = True,
        is_desc: bool = True,
        order_attribute: Optional[str] = "id",
        is_for_requests: Optional[bool] = None,
        plate_number: Optional[str] = None,
        current_user: User = Depends(get_current_user),
) -> dict:
    transport, total = await TransportService().get_all(uow, is_desc, order_attribute, plate_number, limit, offset, is_for_requests, is_active=is_active)
    return format_response(transport, total)


@router.get(path="/get/{transport_id}", description='Получить значение по id')
async def get_transport_by_id(
        uow: UOWDep, transport_id: int,
        current_user: User = Depends(get_current_user),
) -> dict:
    transport = await TransportService().find_one_or_none(uow, id=transport_id)
    return format_response(transport)


@router.put(path="/update/{transport_id}", description='Обновить значение')
async def update_transport_by_id(
        uow: UOWDep,
        transport_id: int,
        transport_update: TransportSchemaUpdate,
        permissions: list = Depends(check_permission("edit_handbook")),
        current_user: User = Depends(get_current_user),
) -> dict:
    transport = await TransportService().update(uow, transport_id, transport_update)
    return format_response(transport)


@router.patch(path="/is_active/{transport_id}", description='Активация/Деактивация значения')
async def change_is_active(
        uow: UOWDep,
        transport_id: int,
        transport_update: TransportSchemaIsActive,
        permissions: list = Depends(check_permission("deactivate_handbook")),
        current_user: User = Depends(get_current_user),
) -> dict:
    transport = await TransportService().change_is_active(uow, transport_id, transport_update)
    return format_response(transport)
