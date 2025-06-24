from typing import Optional

from fastapi import APIRouter, Depends

from api.dependencies import UOWDep, get_current_user
from models.user import User
from schemas.concrete_mixing_plant import ConcreteMixingPlantSchemaAdd, ConcreteMixingPlantSchemaUpdate, \
    ConcreteMixingPlantSchemaIsActive
from services.concrete_mixing_plant import ConcreteMixingPlantService
from utils.response_formatting import format_response
from fastapi import APIRouter, Depends

from api.dependencies import UOWDep, get_current_user
from models.user import User
from schemas.concrete_mixing_plant import ConcreteMixingPlantSchemaAdd, ConcreteMixingPlantSchemaUpdate, \
    ConcreteMixingPlantSchemaIsActive
from services.concrete_mixing_plant import ConcreteMixingPlantService
from utils.response_formatting import format_response

router = APIRouter(
    prefix="/concrete_mixing_plant",
    tags=["Бетоносмесительная установка"],
)


@router.post("/create", description='Создать значение')
async def create_concrete_mixing_plant(
        concrete_mixing_plant: ConcreteMixingPlantSchemaAdd,
        uow: UOWDep,
        current_user: User = Depends(get_current_user),
) -> dict:
    concrete_mixing_plant = await ConcreteMixingPlantService().create(uow, concrete_mixing_plant)
    return format_response(concrete_mixing_plant)


@router.get("/get", description='Получить все значения')
async def get_all_concrete_mixing_plants(
        uow: UOWDep,
        limit: int = None,
        offset: int = None,
        is_active: bool = True,
        is_desc: bool = True,
        order_attribute: Optional[str] = "id",
        current_user: User = Depends(get_current_user),
) -> dict:
    concrete_mixing_plants, total = await ConcreteMixingPlantService().get_all(uow, is_desc, order_attribute, limit,
                                                                               offset,
                                                                               is_active=is_active)
    return format_response(concrete_mixing_plants, total)


@router.get("/get_statistics", description='Получить статистику загруженности БСУ')
async def get_concrete_mixing_plants_statistics(
        uow: UOWDep,
        current_user: User = Depends(get_current_user),
) -> dict:
    concrete_mixing_plants, total = await ConcreteMixingPlantService().get_all_cmp_statistics(uow)
    return format_response(concrete_mixing_plants, total)


@router.get(path="/get/{concrete_mixing_plant_id}", description='Получить значение по id')
async def get_concrete_mixing_plant_by_id(
        uow: UOWDep, concrete_mixing_plant_id: int,
        current_user: User = Depends(get_current_user),
) -> dict:
    concrete_mixing_plant = await ConcreteMixingPlantService().find_one_or_none(uow, id=concrete_mixing_plant_id)
    return format_response(concrete_mixing_plant)


@router.put(path="/update/{concrete_mixing_plant_id}", description='Обновить значение')
async def update_concrete_mixing_plant_by_id(
        uow: UOWDep,
        concrete_mixing_plant_id: int,
        concrete_mixing_plant_update: ConcreteMixingPlantSchemaUpdate,
        current_user: User = Depends(get_current_user),
) -> dict:
    concrete_mixing_plant = await ConcreteMixingPlantService().update(uow, concrete_mixing_plant_id,
                                                                      concrete_mixing_plant_update)
    return format_response(concrete_mixing_plant)


@router.patch(path="/is_active/{concrete_mixing_plant_id}", description='Активация/Деактивация значения')
async def change_is_active(
        uow: UOWDep,
        concrete_mixing_plant_id: int,
        concrete_mixing_plant_update: ConcreteMixingPlantSchemaIsActive,
        current_user: User = Depends(get_current_user),
) -> dict:
    concrete_mixing_plant = await ConcreteMixingPlantService().change_is_active(
        uow, concrete_mixing_plant_id, concrete_mixing_plant_update
    )
    return format_response(concrete_mixing_plant)
