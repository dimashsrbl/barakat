# import random
#
# import serial
# from fastapi import APIRouter
# from starlette.websockets import WebSocket, WebSocketDisconnect
# import asyncio
#
# # from test_weighing_indicator.logic import indicators
# from websocket.websocket_manager import manager
#
# router = APIRouter(
#     prefix="/ws",
#     tags=["Весовой индикатор"],
# )
#
#
# @router.websocket("/")
# async def websocket_endpoint(websocket: WebSocket):
#     await manager.connect(websocket)
#     while True:
#         await asyncio.sleep(0.15)
#         value = random.randint(20000, 50000)
#         await websocket.send_text(str(value))
