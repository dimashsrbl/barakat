# from fastapi import APIRouter
#
# from api.dependencies import UOWDep
# from schemas.weight_indicator import WeightIndicatorSchemaAdd, WeightIndicatorSchema, WeightIndicatorSchemaUpdate
# from services.weight_indicator import WeightIndicatorService
#
# router = APIRouter(
#     prefix="/weight_indicator",
#     tags=["Весовой индикатор"],
# )
#
#
# @router.post("/create", description='Создать значение')
# async def create_weight_indicator(
#         weight_indicator: WeightIndicatorSchemaAdd,
#         uow: UOWDep,
# ) -> WeightIndicatorSchema:
#     created_weight_indicator = await WeightIndicatorService().create(uow, weight_indicator)
#     return created_weight_indicator
#
#
# @router.get("/get", description='Получить все значения')
# async def get_all_weight_indicators(
#         uow: UOWDep,
#         limit: int = None,
#         offset: int = None,
# ) -> list[WeightIndicatorSchema]:
#     weight_indicators = await WeightIndicatorService().get_all(uow, limit, offset)
#     return weight_indicators
#
#
# @router.get(path="/get/{weight_indicator_id}", description='Получить значение по id')
# async def get_weight_indicator_by_id(
#         uow: UOWDep, weight_indicator_id: int
# ) -> WeightIndicatorSchema:
#     weight_indicator = await WeightIndicatorService().get_by_id(uow, weight_indicator_id)
#     return weight_indicator
#
#
# @router.put(path="/update/{weight_indicator_id}", description='Обновить значение')
# async def update_weight_indicator_by_id(
#         uow: UOWDep,
#         weight_indicator_id: int,
#         weight_indicator_update: WeightIndicatorSchemaUpdate,
# ) -> WeightIndicatorSchema:
#     weight_indicator = await WeightIndicatorService().update(uow, weight_indicator_id, weight_indicator_update)
#     return weight_indicator
#
# # @router.websocket(/1):
# # async def read_weight():
# #     weight_indicator.**data