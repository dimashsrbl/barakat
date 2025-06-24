# from fastapi import APIRouter
# from starlette.websockets import WebSocket
#
# from websocket.websocket_manager import notifications_manager
#
# router = APIRouter()
#
#
# @router.websocket("/notifications")
# async def websocket_endpoint(websocket: WebSocket):
#     try:
#         await notifications_manager.connect(websocket)
#         await websocket.receive_text()
#     except Exception as e:
#         print(f"Ошибка в notifications WebSocket: {e}")
#     finally:
#         notifications_manager.disconnect(websocket)
