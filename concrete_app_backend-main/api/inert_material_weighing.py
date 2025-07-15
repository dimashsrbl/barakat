from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from api.dependencies import UOWDep
from models.user import User
from api.dependencies import get_current_user
from services.inert_material_weighing import InertMaterialWeighingService

router = APIRouter(prefix="/inert_weighing", tags=["Взвешивание инертных материалов"])

class SimulateCameraInput(BaseModel):
    plate_number: str

class AutoWeighingInput(BaseModel):
    plate_number: str
    weight: int

@router.post("/simulate_camera")
async def simulate_camera(
    data: SimulateCameraInput,
    uow: UOWDep,
):
    """
    Имитация камеры: только фиксирует номер машины и возвращает статус ожидания веса.
    Отвес не создается! Отвес создается только при поступлении реального веса с индикатора.
    """
    # Записываем номер машины в файл для автоматизации
    with open("/tmp/current_plate.txt", "w") as f:
        f.write(data.plate_number)
    return {
        "message": f"Камера сработала для номера {data.plate_number}",
        "plate_number": data.plate_number,
        "status": "waiting_for_weight",
        "next_step": "Ожидание стабильного веса с индикатора (5 секунд)"
    }

@router.post("/auto_weighing")
async def auto_weighing(
    data: AutoWeighingInput,
    uow: UOWDep,
):
    """
    Автоматическое взвешивание: принимает данные с индикатора веса.
    Вызывается автоматически при стабильном весе > 2000 кг.
    Создает отвес только если вес > 0.
    """
    try:
        if data.weight <= 0:
            raise HTTPException(status_code=400, detail="Вес должен быть больше 0")
        # Используем автоматического оператора (ID=1532) по умолчанию
        auto_operator_id = 1532
        result = await InertMaterialWeighingService().process_weighing(uow, data.plate_number, data.weight, auto_operator_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 