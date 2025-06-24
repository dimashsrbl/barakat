from fastapi import APIRouter, Depends

from api.dependencies import UOWDep, get_current_user
from models.user import User
from schemas.material_type import MaterialTypeSchema, MaterialTypeSchemaAdd, MaterialTypeSchemaUpdate
from services.material_type import MaterialTypeService
from utils.response_formatting import format_response

router = APIRouter(
    prefix="/material_type",
    tags=["Тип материала"],
)


@router.get("/get", description='Получить все значения')
async def get_all_material_types(
        uow: UOWDep,
        limit: int = None,
        offset: int = None,
        is_for_dependent: bool = None,
        current_user: User = Depends(get_current_user),
) -> dict:
    material_type, total = await MaterialTypeService().get_all(uow, limit, offset, is_for_dependent)
    return format_response(material_type, total)


@router.get(path="/get/{material_type_id}", description='Получить значение по id')
async def get_material_type_by_id(
        uow: UOWDep, material_type_id: int,
        current_user: User = Depends(get_current_user),
) -> dict:
    material_type = await MaterialTypeService().find_one_or_none(uow, id=material_type_id)
    return format_response(material_type)
