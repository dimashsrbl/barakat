from fastapi import APIRouter

from api.dependencies import UOWDep
from schemas.cv_assist import CVAssistPlateNumberSchema

from services.cv_assist import CVAssistService
from utils.response_formatting import format_response

router = APIRouter(
    prefix="/cv_assist",
    tags=["CV Ассистирование"],
)


@router.post("/plate_number", description='Получить транспорт по гос. номеру и незавершенный отвес, если есть')
async def cv_assist(
        uow: UOWDep,
        cv_assist_data: CVAssistPlateNumberSchema,
        # current_user: User = Depends(get_current_user),
) -> dict:
    data = await CVAssistService().plate_number_assist(uow, cv_assist_data)
    return format_response(data)