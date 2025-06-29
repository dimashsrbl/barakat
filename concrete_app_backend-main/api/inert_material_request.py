from fastapi import APIRouter, Depends, HTTPException
from schemas.inert_material_request import InertMaterialRequestCreate, InertMaterialRequestRead
from services.inert_material_request import InertMaterialRequestService
from api.dependencies import UOWDep
from models.user import User
from api.dependencies import get_current_user
from datetime import datetime, timedelta
from utils.response_formatting import format_response

router = APIRouter(prefix="/inert_request", tags=["Заявки на инертные материалы"])

@router.post("/create", response_model=InertMaterialRequestRead)
async def create_inert_request(
    data: InertMaterialRequestCreate,
    uow: UOWDep,
    current_user: User = Depends(get_current_user),
):
    # Проверка роли (только поставщик)
    if current_user.role.name != "Поставщик":
        raise HTTPException(status_code=403, detail="Только поставщик может создавать заявки!")
    return await InertMaterialRequestService().create(uow, data, current_user.id)

@router.post("/finish/{request_id}", response_model=InertMaterialRequestRead)
async def finish_inert_request(
    request_id: int,
    uow: UOWDep,
    current_user: User = Depends(get_current_user),
):
    return await InertMaterialRequestService().finish(uow, request_id)

@router.get("/all_with_status")
async def get_all_inert_requests_with_status(uow: UOWDep):
    """
    Получить все заявки на отвесы с вычислением статуса для фронта.
    """
    async with uow:
        requests = await uow.inert_material_request.find_all()
        result = []
        now = datetime.utcnow()
        for req in requests:
            weighing = await uow.weighing.find_one_or_none(inert_request_id=req.id)
            status = "В пути"
            if req.status.value == "finished":
                status = "Завершено"
            elif weighing and weighing.tare_weight and not weighing.brutto_weight:
                status = "Сделан первый отвес"
            elif weighing and weighing.tare_weight and weighing.brutto_weight and not (weighing.weediness and weighing.silo_number):
                status = "Ожидание лаборатории"
            elif (now - req.created_at) > timedelta(hours=12) and req.status.value != "finished":
                status = "Не приехал"
            user = await uow.user.find_one_or_none(id=req.created_by)
            company_name = None
            if user and getattr(user, 'company_id', None):
                company = await uow.company.find_one_or_none(id=user.company_id)
                company_name = company.name if company else None
            result.append({
                "id": req.id,
                "plate_number": (await uow.transport.find_one_or_none(id=req.transport_id)).plate_number,
                "carrier": (await uow.carrier.find_one_or_none(id=req.carrier_id)).name,
                "material": (await uow.material.find_one_or_none(id=req.material_id)).name,
                "created_at": req.created_at,
                "status": status,
                "company": company_name,
            })
        return result 

@router.get("/my_invoices")
async def get_my_invoices(uow: UOWDep, current_user: User = Depends(get_current_user)):
    # Возвращаем только заявки, созданные этим пользователем
    requests = await uow.inert_material_request.find_all()
    my_requests = [r for r in requests if r.created_by == current_user.id]
    company_name = None
    if current_user.company_id:
        company = await uow.company.find_one_or_none(id=current_user.company_id)
        company_name = company.name if company else None

    result = []
    now = datetime.utcnow()
    for req in my_requests:
        weighing = await uow.weighing.find_one_or_none(inert_request_id=req.id)
        status = "В пути"
        if req.status.value == "finished":
            status = "Завершено"
        elif weighing and weighing.tare_weight and not weighing.brutto_weight:
            status = "Сделан первый отвес"
        elif weighing and weighing.tare_weight and weighing.brutto_weight and not (weighing.weediness and weighing.silo_number):
            status = "Ожидание лаборатории"
        elif (now - req.created_at) > timedelta(hours=12) and req.status.value != "finished":
            status = "Не приехал"
        plate_number = (await uow.transport.find_one_or_none(id=req.transport_id)).plate_number if req.transport_id else None
        carrier = (await uow.carrier.find_one_or_none(id=req.carrier_id)).name if req.carrier_id else None
        material = (await uow.material.find_one_or_none(id=req.material_id)).name if req.material_id else None
        invoice_weighing = await uow.weighing.find_one_or_none(inert_request_id=req.id, is_finished=True)
        invoice_path = f"media/invoice_{invoice_weighing.id}.xlsx" if invoice_weighing else None
        result.append({
            "id": req.id,
            "plate_number": plate_number,
            "carrier": carrier,
            "material": material,
            "created_at": req.created_at,
            "status": status,
            "company": company_name,
            "invoice_path": invoice_path
        })
    return format_response(result) 