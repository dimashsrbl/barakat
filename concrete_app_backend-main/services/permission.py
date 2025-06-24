# from schemas.permission import PermissionSchema, PermissionSchemaAdd, PermissionSchemaUpdate
# from utils.unitofwork import IUnitOfWork
#
#
# class PermissionService:
#     async def create(self, uow: IUnitOfWork, data: PermissionSchemaAdd) -> PermissionSchema:
#         data_dict = data.model_dump()
#         async with uow:
#             result = await uow.permission.create(data_dict)
#             await uow.commit()
#             return result
#
#     async def get_all(self, uow: IUnitOfWork, limit: int, offset: int) -> list[PermissionSchema]:
#         async with uow:
#             result = await uow.permission.get_all(limit=limit, offset=offset)
#             return result
#
#     async def get_by_id(self, uow: IUnitOfWork, id: int) -> PermissionSchema:
#         async with uow:
#             result = await uow.permission.get_by_id(id)
#             return result
#
#     async def update(self, uow: IUnitOfWork, id: int, new_data: PermissionSchemaUpdate) -> PermissionSchema:
#         updated_data = new_data.model_dump()
#         async with uow:
#             result = await uow.permission.update(id, updated_data)
#             await uow.commit()
#             return result
