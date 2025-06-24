# import json
#
# from fastapi import APIRouter
# from sqlalchemy import update, select
# from starlette.websockets import WebSocket
#
# from db.db import async_session_maker
# from models.concrete_mixing_plant import ConcreteMixingPlant
# from models.weighing import Weighing
# from websocket.websocket_manager import cmp_manager
#
# router = APIRouter()
#
#
# @router.websocket("/cmp_connect")
# async def websocket_endpoint(websocket: WebSocket):
#     try:
#         await cmp_manager.connect(websocket)
#         while True:
#             message = await websocket.receive_text()
#             message = json.loads(message)
#             print(f"{message=}")
#             # message = created production, maybe report by materials
#             async with async_session_maker() as session:
#                 stmt = select(ConcreteMixingPlant).filter_by(name=message['cmp'])
#                 raw = await session.execute(stmt)
#                 cmp = raw.scalar_one_or_none()
#                 if not cmp:
#                     continue
#
#                 stmt = update(Weighing).filter_by(
#                     is_active=True,
#                     is_read_by_cmp=False,
#                     concrete_mixing_plant_id=cmp.id,
#                     is_depend=True
#                 ).values(is_read_by_cmp=True)
#                 # to do add date filters
#                 res = await session.execute(stmt)
#                 await session.commit()
#     except Exception as e:
#         print(f"Ошибка в cmp WebSocket: {e}")
#     finally:
#         cmp_manager.disconnect(websocket)
