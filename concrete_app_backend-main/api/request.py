import datetime
from typing import Optional

from fastapi import APIRouter, Depends

from api.dependencies import UOWDep, get_current_user, check_permission
from models.user import User
from schemas.request import RequestSchemaAdd, RequestSchema, RequestSchemaUpdate, RequestSchemaIsActive
from services.request import RequestService
from utils.response_formatting import format_response

router = APIRouter(
    prefix="/request",
    tags=["Заявка"],
)


@router.post("/create", description='Создать значение')
async def create_request(
        request: RequestSchemaAdd,
        uow: UOWDep,
        permissions: list = Depends(check_permission("create_request")),
        user: User = Depends(get_current_user)
) -> dict:
    request = await RequestService().create(uow, request, user.id)
    return format_response(request)


# @router.get("/get", description='Получить все значения')
# async def get_all_requests(
#         uow: UOWDep,
#         limit: int = None,
#         offset: int = None,
#         is_active: Optional[bool] = True,
#         is_desc: Optional[bool] = True,
#         from_date: datetime.datetime = None,
#         to_date: datetime.datetime = None,
#         current_user: User = Depends(get_current_user),
# ) -> dict:
#     request, total = await RequestService().get_all(
#         uow, from_date, to_date, is_desc, limit, offset, is_active=is_active
#     )
#     return format_response(request, total)


@router.get("/get_special", description='Получить все заявки для плана или журнала заявок')
async def get_all_requests_special(
        uow: UOWDep,
        limit: int = None,
        offset: int = None,
        is_desc: bool = False,
        order_attribute: Optional[str] = "id",
        date: datetime.datetime = None,
        object_id: Optional[int] = None,
        material_id: Optional[int] = None,
        transport_id: Optional[int] = None,
        current_user: User = Depends(get_current_user),
) -> dict:
    request, total = await RequestService().get_all_specific(
        uow, date, object_id, material_id, transport_id, is_desc, order_attribute,limit, offset, is_active=True
    )
    return format_response(request, total)


@router.get(path="/get/{request_id}", description='Получить значение по id')
async def get_request_by_id(
        uow: UOWDep, request_id: int,
        current_user: User = Depends(get_current_user),
) -> dict:
    request = await RequestService().find_one_or_none(uow, id=request_id)
    return format_response(request)


@router.put(path="/update/{request_id}", description='Обновить значение')
async def update_request_by_id(
        uow: UOWDep,
        request_id: int,
        request_update: RequestSchemaUpdate,
        permissions: list = Depends(check_permission("edit_request")),
        current_user: User = Depends(get_current_user),
) -> dict:
    request = await RequestService().update(uow, request_id, request_update)
    return format_response(request)


@router.patch(path="/close_request/{request_id}", description='Закрытие заявки досрочно')
async def close_request(
        uow: UOWDep,
        request_id: int,
        permissions: list = Depends(check_permission("close_request")),
        current_user: User = Depends(get_current_user),
) -> dict:
    request = await RequestService().close_request(uow, request_id)
    return format_response(request)


@router.patch(path="/is_active/{request_id}", description='Активация/Деактивация значения')
async def change_is_active(
        uow: UOWDep,
        request_id: int,
        request_update: RequestSchemaIsActive,
        permissions: list = Depends(check_permission("deactivate_request")),
        current_user: User = Depends(get_current_user),
) -> dict:
    request = await RequestService().change_is_active(uow, request_id, request_update)
    return format_response(request)
