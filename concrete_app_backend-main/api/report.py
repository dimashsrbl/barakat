import datetime
from typing import Optional

from fastapi import APIRouter, Depends
from starlette.responses import FileResponse

from api.dependencies import get_current_user
from models.user import User
from services.report import ReportService
from utils.response_formatting import format_response

router = APIRouter(
    prefix="/report",
    tags=["Отчеты"],
)


@router.get("/summary_invoice", description='Получить сводный отчет')
async def get_summary_invoice(
        from_date: datetime.datetime,
        to_date: datetime.datetime,
        seller_companies: Optional[str] = None,
        client_companies: Optional[str] = None,
        current_user: User = Depends(get_current_user),
) -> FileResponse:
    report = await ReportService().get_summary(from_date, to_date, seller_companies, client_companies)
    return format_response(report)


@router.get("/detail_invoice", description='Получить детальный отчет')
async def get_detail_invoice(
        from_date: datetime.datetime,
        to_date: datetime.datetime,
        materials: Optional[str] = None,
        seller_companies: Optional[str] = None,
        client_companies: Optional[str] = None,
        carriers: Optional[str] = None,
        current_user: User = Depends(get_current_user),
) -> bytes:
    report = await ReportService().get_detail(from_date, to_date, materials, seller_companies, client_companies,
                                              carriers)
    return format_response(report)


@router.get("/detail_invoice_by_deleted_or_adjusted",
            description='Получить детальный отчет по удаленным или корректированным отвесам')
async def get_detail_invoice_by_deleted_or_adjusted(
        from_date: datetime.datetime,
        to_date: datetime.datetime,
        # materials: Optional[str] = None,
        # seller_companies: Optional[str] = None,
        # client_companies: Optional[str] = None,
        current_user: User = Depends(get_current_user),
) -> bytes:
    report = await ReportService().get_detail_by_deleted_or_adjusted(from_date, to_date)
    return format_response(report)


@router.get("/independent_by_materials_invoice", description='Получить отчет по материалам независимых отвесов')
async def get_independent_by_materials_invoice(
        from_date: datetime.datetime,
        to_date: datetime.datetime,
        materials: Optional[str] = None,
        current_user: User = Depends(get_current_user),
) -> bytes:
    report = await ReportService().get_independent_by_materials(from_date, to_date, materials)
    return format_response(report)


@router.get("/dependent_summary_invoice", description='Получить сводный отчет по зависимым отвесамм')
async def get_dependent_summary_invoice(
        from_date: datetime.datetime,
        to_date: datetime.datetime,
        material_types: Optional[str] = None,
        client_companies: Optional[str] = None,
        objects: Optional[str] = None,
        current_user: User = Depends(get_current_user),
) -> FileResponse:
    report = await ReportService().get_dependent_summary(from_date, to_date, material_types, client_companies, objects)
    return format_response(report)


@router.get("/dependent_detail_invoice", description='Получить детальный отчет')
async def get_dependent_detail_invoice(
        from_date: datetime.datetime,
        to_date: datetime.datetime,
        materials: Optional[str] = None,
        client_companies: Optional[str] = None,
        objects: Optional[str] = None,
        current_user: User = Depends(get_current_user),
) -> bytes:
    report = await ReportService().get_dependent_detail(from_date, to_date, materials, client_companies, objects)
    return format_response(report)


@router.get("/dependent_detail_invoice_by_deleted_or_adjusted",
            description='Получить детальный отчет по удаленным или корректированным зависимым отвесам')
async def get_detail_invoice_by_deleted_or_adjusted(
        from_date: datetime.datetime,
        to_date: datetime.datetime,
        # materials: Optional[str] = None,
        # seller_companies: Optional[str] = None,
        # client_companies: Optional[str] = None,
        current_user: User = Depends(get_current_user),
) -> bytes:
    report = await ReportService().get_dependent_detail_by_deleted_or_adjusted(from_date, to_date)
    return format_response(report)


@router.get("/dependent_by_materials_invoice", description='Получить отчет по маркам')
async def get_dependent_by_materials_invoice(
        from_date: datetime.datetime,
        to_date: datetime.datetime,
        report_type: str = "day",
        current_user: User = Depends(get_current_user),
) -> bytes:
    report = await ReportService().get_dependent_by_materials(from_date, to_date, report_type)
    return format_response(report)


@router.get("/weighing_act/{weighing_id}", description='Получить акт взвешивания по id отвеса')
async def get_weighing_act(
        weighing_id: int,
        current_user: User = Depends(get_current_user),
) -> FileResponse:
    """
    Генерирует и возвращает XLSX-файл акта взвешивания по id отвеса
    """
    file_path = await ReportService().generate_weighing_act_xlsx(weighing_id)
    return FileResponse(
        path=file_path,
        filename=f"act_{weighing_id}.xlsx",
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
