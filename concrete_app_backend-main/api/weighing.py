import datetime
from typing import Optional

from fastapi import APIRouter, Depends

from api.dependencies import UOWDep, get_current_user, check_permission
from models.user import User
from schemas.weighing import *
from services.weighing import WeighingService
from utils.response_formatting import format_response

router = APIRouter(
    prefix="/weighing",
    tags=["Отвес"],
)


@router.post("/create_dependent", description='Создать отвес по заявке')
async def create_dependent_weighing(
        weighing: DependentWeighingSchemaAdd,
        uow: UOWDep,
        permissions: list = Depends(check_permission("create_dependent")),
        current_user: User = Depends(get_current_user),
) -> dict:
    weighing = await WeighingService().create_dependent(uow, weighing, current_user.id)
    return format_response(weighing)


@router.post("/create_independent", description='Создать отвес')
async def create_independent_weighing(
        weighing: IndependentWeighingSchemaAdd,
        uow: UOWDep,
        permissions: list = Depends(check_permission("create_independent")),
        current_user: User = Depends(get_current_user),
) -> dict:
    weighing = await WeighingService().create_independent(uow, weighing, current_user.id)
    return format_response(weighing)


@router.get("/get_dependent", description='Получить все заявочные отвесы')
async def get_all_dependent_weighings(
        uow: UOWDep,
        limit: int = None,
        offset: int = None,
        is_active: bool = True,
        is_desc: bool = True,
        order_attribute: Optional[str] = "id",
        is_finished: Optional[bool] = None,
        request_id: Optional[int] = None,
        current_user: User = Depends(get_current_user),
) -> dict:
    weighing, total = await WeighingService().get_all_dependent(uow, is_desc, order_attribute, limit, offset,
                                                                request_id, is_finished, current_user,
                                                                is_active=is_active)
    return format_response(weighing, total)


@router.get("/get_independent", description='Получить все отвесы')
async def get_all_independent_weighings(
        uow: UOWDep,
        limit: int = None,
        offset: int = None,
        is_active: bool = True,
        is_desc: bool = True,
        order_attribute: Optional[str] = "id",
        is_finished: Optional[bool] = None,
        from_date: datetime.datetime = None,
        to_date: datetime.datetime = None,
        seller_id: int = None,
        material_id: int = None,
        current_user: User = Depends(get_current_user),
) -> dict:
    weighing, total = await WeighingService().get_all_independent(
        uow, from_date, to_date,
        is_desc, order_attribute,
        limit, offset,
        is_finished,
        seller_id, material_id,
        is_active=is_active,
    )
    return format_response(weighing, total)


@router.get(path="/get_dependent/{weighing_id}", description='Получить заявочный отвес по id')
async def get_weighing_by_id(
        uow: UOWDep, weighing_id: int,
        current_user: User = Depends(get_current_user),
) -> dict:
    weighing = await WeighingService().get_by_id_dependent(uow, weighing_id)
    return format_response(weighing)


@router.get(path="/get_independent/{weighing_id}", description='Получить отвес по id')
async def get_weighing_by_id(
        uow: UOWDep, weighing_id: int,
        current_user: User = Depends(get_current_user),
) -> dict:
    weighing = await WeighingService().get_by_id_independent(uow, weighing_id)
    return format_response(weighing)


@router.put(path="/finish_dependent/{weighing_id}", description='Завершить заявочный отвес')
async def finish_dependent_weighing_by_id(
        uow: UOWDep,
        weighing_id: int,
        weighing_update: DependentWeighingSchemaUpdateNotFinished,
        permissions: list = Depends(check_permission("finish_dependent")),
        current_user: User = Depends(get_current_user),
) -> dict:
    weighing = await WeighingService().finish_dependent(uow, weighing_id, weighing_update, current_user.id)
    return format_response(weighing)


@router.put(path="/finish_independent/{weighing_id}", description='Завершить отвес')
async def finish_independent_weighing_by_id(
        uow: UOWDep,
        weighing_id: int,
        weighing_update: IndependentWeighingSchemaUpdateNotFinished,
        permissions: list = Depends(check_permission("finish_independent")),
        current_user: User = Depends(get_current_user),
) -> dict:
    weighing = await WeighingService().finish_independent(uow, weighing_id, weighing_update, current_user.id)
    return format_response(weighing)


@router.put(path="/update_finished_dependent/{weighing_id}",
            description='Редактирование завершенного заявочного отвеса')
async def update_finished_dependent_by_id(
        uow: UOWDep,
        weighing_id: int,
        weighing_update: DependentWeighingSchemaUpdateFinished,
        permissions: list = Depends(check_permission("edit_dependent")),
        current_user: User = Depends(get_current_user),
) -> dict:
    weighing = await WeighingService().update_dependent(uow, weighing_id, weighing_update)
    return format_response(weighing)


@router.put(path="/update_finished_independent/{weighing_id}", description='Редактирование завершенного отвеса')
async def update_finished_independent_by_id(
        uow: UOWDep,
        weighing_id: int,
        weighing_update: IndependentWeighingSchemaUpdateFinished,
        permissions: list = Depends(check_permission("edit_independent")),
        current_user: User = Depends(get_current_user),
) -> dict:
    weighing = await WeighingService().update_independent(uow, weighing_id, weighing_update)
    return format_response(weighing)


@router.put(path="/reconnect_weighing/{weighing_id}", description='Перепривязать отвес к другой заявке')
async def reconnect_weighing_to_another_request(
        uow: UOWDep,
        weighing_id: int,
        new_request_id: int,
        permissions: list = Depends(check_permission("reconnect_weighing")),
        current_user: User = Depends(get_current_user),
) -> dict:
    weighing = await WeighingService().reconnect(uow, weighing_id, new_request_id)
    return format_response(weighing)


@router.put(path="/change_cmp_and_cubature/{weighing_id}", description='Изменение БСУ и кубатуры отвеса')
async def change_cmp_and_cubature(
        uow: UOWDep,
        weighing_id: int,
        weighing_update: WeighingSchemaConcreteMixingPlant,
        permissions: list = Depends(check_permission("change_cmp_cubature_weighing")),
        current_user: User = Depends(get_current_user),
) -> dict:
    weighing = await WeighingService().change_cmp_and_cubature(uow, weighing_id, weighing_update)
    return format_response(weighing)


@router.put(path="/is_active/{weighing_id}", description='Активация/Деактивация значения')
async def change_is_active(
        uow: UOWDep,
        weighing_id: int,
        weighing_update: WeighingSchemaIsActive,
        permissions: list = Depends(check_permission("deactivate_weighing")),
        current_user: User = Depends(get_current_user),
) -> dict:
    weighing = await WeighingService().change_is_active(uow, weighing_id, weighing_update)
    return format_response(weighing)


@router.put(path="/is_return/{weighing_id}", description='Возврат отвеса')
async def change_is_return(
        uow: UOWDep,
        weighing_id: int,
        weighing_update: WeighingSchemaIsReturn,
        current_user: User = Depends(get_current_user),
) -> dict:
    weighing = await WeighingService().change_is_return(uow, weighing_id, weighing_update)
    return format_response(weighing)


@router.put(path="/change_monitoring_data/{weighing_id}", description='Изменение значения')
async def change_tare_and_brutto(
        uow: UOWDep,
        weighing_id: int,
        weighing_update: WeighingSchemaChangeMonitoringData,
        permissions: list = Depends(check_permission("edit_monitoring_data")),
        current_user: User = Depends(get_current_user),
) -> dict:
    weighing = await WeighingService().change_monitoring_data(uow, weighing_id, weighing_update)
    return format_response(weighing)


@router.get(path="/send_telegram_message/{weighing_id}", description='Отправить сообщение в телеграм')
async def send_telegram_message(
        uow: UOWDep,
        weighing_id: int,
        current_user: User = Depends(get_current_user),
) -> dict:
    weighing = await WeighingService().send_telegram_message(uow, weighing_id)
    return format_response(weighing)
