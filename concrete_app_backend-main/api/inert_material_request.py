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
    for r in my_requests:
        d = r.to_read_model() if hasattr(r, 'to_read_model') else dict(r)
        d = d.model_dump() if hasattr(d, 'model_dump') else dict(d)
        d['company'] = company_name
        weighing = await uow.weighing.find_one_or_none(inert_request_id=r.id, is_finished=True)
        if weighing:
            d['invoice_path'] = f"media/invoice_{weighing.id}.xlsx"
        else:
            d['invoice_path'] = None
        result.append(d)
    return format_response(result) 