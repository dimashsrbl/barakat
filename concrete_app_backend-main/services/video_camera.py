# from schemas.video_camera import VideoCameraSchemaAdd, VideoCameraSchema, VideoCameraSchemaUpdate
# from utils.unitofwork import IUnitOfWork
#
#
# class VideoCameraService:
#     async def create(self, uow: IUnitOfWork, data: VideoCameraSchemaAdd) -> VideoCameraSchema:
#         data_dict = data.model_dump()
#         async with uow:
#             result = await uow.video_camera.create(data_dict)
#             await uow.commit()
#             return result
#
#     async def get_all(self, uow: IUnitOfWork, limit: int, offset: int) -> list[VideoCameraSchema]:
#         async with uow:
#             result = await uow.video_camera.get_all(limit=limit, offset=offset)
#             return result
#
#     async def get_by_id(self, uow: IUnitOfWork, id: int) -> VideoCameraSchema:
#         async with uow:
#             result = await uow.video_camera.get_by_id(id)
#             return result
#
#     async def update(self, uow: IUnitOfWork, id: int, new_data: VideoCameraSchemaUpdate) -> VideoCameraSchema:
#         updated_data = new_data.model_dump()
#         async with uow:
#             result = await uow.video_camera.update(id, updated_data)
#             await uow.commit()
#             return result
