# import serial
# from fastapi import APIRouter
#
# from api.dependencies import UOWDep
# from schemas.weight_indicator import WeightIndicatorSchema
#
# router = APIRouter(
#     prefix="/indicator",
#     tags=["вес индикатор"],
# )
# indicators = {}
#
#
# @router.get("/init_weighing_indicator", description='Инициализация вес индикатора')
# async def init(uow: UOWDep, id: int):
#     indicator_settings: WeightIndicatorSchema = await uow.weight_indicator.get_by_id(id)
#     indicator = serial.Serial()
#     indicator.baudrate = indicator_settings.baudrate
#     indicator.port = indicator_settings.port
#     indicator.name = indicator_settings.name
#     indicators[indicator_settings.id] = indicator
