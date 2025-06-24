from fastapi import APIRouter, Depends

from api.dependencies import UOWDep, get_current_user
from models.user import User
from schemas.receive_method_type import ReceiveMethodTypeSchema
from services.receive_method_type import ReceiveMethodTypeService
from utils.response_formatting import format_response

router = APIRouter(
    prefix="/receive_method_type",
    tags=["Тип способа приёмки"],
)


@router.get("/get", description='Получить все значения')
async def get_all_receive_method_types(
        uow: UOWDep,
        limit: int = None,
        offset: int = None,
        current_user: User = Depends(get_current_user),
) -> dict:
    receive_method_type, total = await ReceiveMethodTypeService().get_all(uow, limit, offset)
    return format_response(receive_method_type, total)


@router.get(path="/get/{receive_method_type_id}", description='Получить значение по id')
async def get_receive_method_type_by_id(
        uow: UOWDep, receive_method_type_id: int,
        current_user: User = Depends(get_current_user),
) -> dict:
    receive_method_type = await ReceiveMethodTypeService().find_one_or_none(uow, id=receive_method_type_id)
    return format_response(receive_method_type)
