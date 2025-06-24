# from fastapi import APIRouter
#
# from api.dependencies import UOWDep
# from schemas.video_camera import VideoCameraSchemaAdd, VideoCameraSchema, VideoCameraSchemaUpdate
# from services.video_camera import VideoCameraService
#
# router = APIRouter(
#     prefix="/video_camera",
#     tags=["Видеокамера"],
# )
#
#
# @router.post("/create", description='Создать значение')
# async def create_video_camera(
#         video_camera: VideoCameraSchemaAdd,
#         uow: UOWDep,
# ) -> VideoCameraSchema:
#     created_video_camera = await VideoCameraService().create(uow, video_camera)
#     return created_video_camera
#
#
# @router.get("/get", description='Получить все значения')
# async def get_all_video_cameras(
#         uow: UOWDep,
#         limit: int = None,
#         offset: int = None,
# ) -> list[VideoCameraSchema]:
#     video_cameras = await VideoCameraService().get_all(uow, limit, offset)
#     return video_cameras
#
#
# @router.get(path="/get/{video_camera_id}", description='Получить значение по id')
# async def get_video_camera_by_id(
#         uow: UOWDep, video_camera_id: int
# ) -> VideoCameraSchema:
#     video_camera = await VideoCameraService().get_by_id(uow, video_camera_id)
#     return video_camera
#
#
# @router.put(path="/update/{video_camera_id}", description='Обновить значение')
# async def update_video_camera_by_id(
#         uow: UOWDep,
#         video_camera_id: int,
#         video_camera_update: VideoCameraSchemaUpdate,
# ) -> VideoCameraSchema:
#     video_camera = await VideoCameraService().update(uow, video_camera_id, video_camera_update)
#     return video_camera
