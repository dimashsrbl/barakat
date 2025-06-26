from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from api.dependencies import UOWDep
from models.user import User
from api.dependencies import get_current_user
from services.inert_material_weighing import InertMaterialWeighingService

router = APIRouter(prefix="/inert_weighing", tags=["Взвешивание инертных материалов"])

class SimulateCameraInput(BaseModel):
    plate_number: str
    weight: int

@router.post("/simulate_camera")
async def simulate_camera(
    data: SimulateCameraInput,
    uow: UOWDep,
    current_user: User = Depends(get_current_user),
):
    """
    Имитация камеры: ручной ввод номера машины и веса.
    """
    try:
        result = await InertMaterialWeighingService().process_weighing(uow, data.plate_number, data.weight, current_user.id)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 