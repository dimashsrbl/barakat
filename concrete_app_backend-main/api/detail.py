# from fastapi import APIRouter, Depends
#
# from api.dependencies import UOWDep, get_current_user
# from models.user import User
# from schemas.detail import DetailSchemaAdd, DetailSchema, DetailSchemaUpdate
# from services.detail import DetailService
#
# router = APIRouter(
#     prefix="/detail",
#     tags=["Детали"],
# )
#
#
# @router.post("/create", description='Создать значение')
# async def create_detail(
#         detail: DetailSchemaAdd,
#         uow: UOWDep,
#         current_user: User = Depends(get_current_user),
# ) -> DetailSchema:
#     created_detail = await DetailService().create(uow, detail)
#     return created_detail
#
#
# @router.get("/get", description='Получить все значения')
# async def get_all_details(
#         uow: UOWDep,
#         limit: int = None,
#         offset: int = None,
#         current_user: User = Depends(get_current_user),
# ) -> list[DetailSchema]:
#     details = await DetailService().get_all(uow, limit, offset)
#     return details
#
#
# @router.get(path="/get/{detail_id}", description='Получить значение по id')
# async def get_detail_by_id(
#         uow: UOWDep, detail_id: int,
#         current_user: User = Depends(get_current_user),
# ) -> DetailSchema:
#     detail = await DetailService().get_by_id(uow, detail_id)
#     return detail
#
#
# @router.put(path="/update/{detail_id}", description='Обновить значение')
# async def update_detail_by_id(
#         uow: UOWDep,
#         detail_id: int,
#         detail_update: DetailSchemaUpdate,
#         current_user: User = Depends(get_current_user),
# ) -> DetailSchema:
#     detail = await DetailService().update(uow, detail_id, detail_update)
#     return detail
