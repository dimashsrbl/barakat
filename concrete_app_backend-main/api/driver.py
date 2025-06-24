from typing import Optional

from fastapi import APIRouter, Depends

from api.dependencies import UOWDep, get_current_user, check_permission
from models.user import User
from schemas.driver import DriverSchemaAdd, DriverSchema, DriverSchemaUpdate, DriverSchemaIsActive
from services.driver import DriverService
from utils.response_formatting import format_response

router = APIRouter(
    prefix="/driver",
    tags=["Водитель"],
)


@router.post("/create", description='Создать нового водителя')
async def create_driver(
        driver: DriverSchemaAdd,
        uow: UOWDep,
        permissions: list = Depends(check_permission("create_handbook")),
        current_user: User = Depends(get_current_user),
) -> dict:
    driver = await DriverService().create(uow, driver)
    return format_response(driver)


@router.get("/get", description='Получить все значения')
async def get_all_drivers(
        uow: UOWDep,
        limit: int = None,
        offset: int = None,
        is_active: bool = True,
        is_desc: bool = True,
        order_attribute: Optional[str] = "id",
        name: Optional[str] = None,
        current_user: User = Depends(get_current_user),
) -> dict:
    drivers, total = await DriverService().get_all(uow, is_desc, order_attribute, name, limit, offset, is_active=is_active)
    return format_response(drivers, total)


@router.get(path="/get/{driver_id}", description='Получить значение по id')
async def get_driver_by_id(
        uow: UOWDep, driver_id: int,
        current_user: User = Depends(get_current_user),
) -> dict:
    driver = await DriverService().find_one_or_none(uow, id=driver_id)
    return format_response(driver)


@router.put(path="/update/{driver_id}", description='Обновить значение')
async def update_driver_by_id(
        uow: UOWDep,
        driver_id: int,
        driver_update: DriverSchemaUpdate,
        permissions: list = Depends(check_permission("edit_handbook")),
        current_user: User = Depends(get_current_user),
) -> dict:
    driver = await DriverService().update(uow, driver_id, driver_update)
    return format_response(driver)


@router.patch(path="/is_active/{driver_id}", description='Активация/Деактивация значения')
async def change_is_active(
        uow: UOWDep,
        driver_id: int,
        driver_update: DriverSchemaIsActive,
        permissions: list = Depends(check_permission("deactivate_handbook")),
        current_user: User = Depends(get_current_user),
) -> dict:
    driver = await DriverService().change_is_active(uow, driver_id, driver_update)
    return format_response(driver)
