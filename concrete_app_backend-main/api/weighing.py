import datetime
from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel

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


class AutoWeighingRequest(BaseModel):
    plate_number: str | None = None

@router.post("/auto_independent", description="Автоматический независимый отвес (брутто -> тара -> накладная)")
async def auto_independent_weighing(
    req: AutoWeighingRequest,
    uow: UOWDep,
    current_user: User = Depends(get_current_user),
):
    """
    Полностью автоматизированный процесс независимого отвеса:
    1. Принимает номер машины (или генерирует)
    2. Первый отвес (брутто)
    3. Второй отвес (тара)
    4. Возвращает результат и накладную (заглушка)
    """
    import random
    from datetime import datetime

    # 1. Получение/генерация номера
    plate_number = req.plate_number or f"A{random.randint(100,999)}BC{random.randint(10,99)}"
    brutto = random.randint(20000, 30000)
    tare = random.randint(7000, 12000)

    # 2. Первый отвес (брутто)
    weighing_data = {
        "plate_number_input": plate_number,
        "brutto_weight": brutto,
        "seller_company_id": current_user.company_id,  # теперь из пользователя
        "client_company_id": 2,  # id компании 'Баракат'
        "material_id": 1,        # заглушка, можно доработать
        "construction_id": 1,    # заглушка, можно доработать
        "cubature": 10.0,        # заглушка
        "is_depend": False,
        "first_operator_id": current_user.id,
        "detail_id": 1,          # заглушка, можно доработать
    }
    weighing = await WeighingService().create_independent(
        uow,
        IndependentWeighingSchemaAdd(**weighing_data),
        current_user.id
    )

    # 3. Второй отвес (тара)
    finish_data = {
        "tare_weight": tare,
        "brutto_weight": brutto,
        "seller_company_id": getattr(weighing.seller_company, 'id', None),
        "client_company_id": getattr(weighing.client_company, 'id', None),
        "material_id": getattr(weighing.material, 'id', None),
        "construction_id": getattr(weighing.construction, 'id', None) if hasattr(weighing, 'construction') and weighing.construction else None,
        "cubature": weighing.cubature,
        "plate_number_input": plate_number,
        # ... другие поля при необходимости ...
    }
    finished_weighing = await WeighingService().finish_independent(
        uow,
        weighing.id,
        IndependentWeighingSchemaUpdateNotFinished(**finish_data),
        current_user.id
    )

    # 4. Генерация накладной (заглушка)
    invoice = {
        "plate_number": plate_number,
        "brutto": brutto,
        "tare": tare,
        "netto": brutto - tare,
        "date": datetime.now().isoformat(),
        "material": "Материал (заглушка)",
        "seller_company": "Поставщик (заглушка)",
        "client_company": "Заказчик (заглушка)"
    }

    return {
        "weighing": finished_weighing,
        "invoice": invoice
    }
