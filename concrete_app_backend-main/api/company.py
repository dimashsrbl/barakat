from typing import Optional

from fastapi import APIRouter, Depends

from api.dependencies import UOWDep, get_current_user, check_permission
from models.user import User
from schemas.company import CompanySchemaAdd, CompanySchema, CompanySchemaUpdate, CompanySchemaIsActive, \
    CompanyFuncEnum, CompanySchemaIsDebtor
from services.company import CompanyService
from utils.response_formatting import format_response

router = APIRouter(
    prefix="/company",
    tags=["Компании"],
)


@router.post("/create", description='Создать значение')
async def create_company(
        company: CompanySchemaAdd,
        uow: UOWDep,
        permissions: list = Depends(check_permission("create_handbook")),
        current_user: User = Depends(get_current_user),
) -> dict:
    company = await CompanyService().create(uow, company)
    return format_response(company)


@router.get("/get", description='Получить все значения')
async def get_all_companies(
        uow: UOWDep,
        limit: int = None,
        offset: int = None,
        is_active: bool = True,
        is_desc: bool = True,
        order_attribute: Optional[str] = "id",
        company_function: CompanyFuncEnum = None,
        name: Optional[str] = None,
        current_user: User = Depends(get_current_user),
) -> dict:
    companies, total = await CompanyService().get_all(uow, is_desc, order_attribute, name, limit, offset, company_function,
                                                      is_active=is_active)
    return format_response(companies, total)


@router.get(path="/get/{company_id}", description='Получить значение по id')
async def get_company_by_id(
        uow: UOWDep, company_id: int,
        current_user: User = Depends(get_current_user),
) -> dict:
    company = await CompanyService().find_one_or_none(uow, id=company_id)
    return format_response(company)


@router.put(path="/update/{company_id}", description='Обновить значение')
async def update_company_by_id(
        uow: UOWDep,
        company_id: int,
        company_update: CompanySchemaUpdate,
        permissions: list = Depends(check_permission("edit_handbook")),
        current_user: User = Depends(get_current_user),
) -> dict:
    company = await CompanyService().update(uow, company_id, company_update)
    return format_response(company)


@router.put(path="/is_debtor/{company_id}", description='Изменение статуса должника и заметки')
async def change_is_debtor(
        uow: UOWDep,
        company_id: int,
        company_update: CompanySchemaIsDebtor,
        permissions: list = Depends(check_permission("edit_handbook")),
        current_user: User = Depends(get_current_user),
) -> dict:
    weighing = await CompanyService().change_is_debtor(uow, company_id, company_update)
    return format_response(weighing)


@router.patch(path="/is_active/{company_id}", description='Активация/Деактивация значения')
async def change_is_active(
        uow: UOWDep,
        company_id: int,
        company_update: CompanySchemaIsActive,
        permissions: list = Depends(check_permission("deactivate_handbook")),
        current_user: User = Depends(get_current_user),
) -> dict:
    company = await CompanyService().change_is_active(uow, company_id, company_update)
    return format_response(company)
