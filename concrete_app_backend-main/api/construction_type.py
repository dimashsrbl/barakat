from fastapi import APIRouter, Depends

from api.dependencies import UOWDep, get_current_user
from models.user import User
from services.construction_type import ConstructionTypeService
from utils.response_formatting import format_response

router = APIRouter(
    prefix="/construction_type",
    tags=["Тип конструкции"],
)


@router.get("/get", description='Получить все значения')
async def get_all_construction_types(
        uow: UOWDep,
        limit: int = None,
        offset: int = None,
        current_user: User = Depends(get_current_user),
) -> dict:
    construction_type, total = await ConstructionTypeService().get_all(uow, limit, offset)
    return format_response(construction_type, total)


@router.get(path="/get/{construction_type_id}", description='Получить значение по id')
async def get_construction_type_by_id(
        uow: UOWDep, construction_type_id: int,
        current_user: User = Depends(get_current_user),
) -> dict:
    construction_type = await ConstructionTypeService().find_one_or_none(uow, id=construction_type_id)
    return format_response(construction_type)
