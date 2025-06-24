# from typing import Tuple, List, Any
#
# from schemas.detail import DetailSchemaAdd, DetailSchema, DetailSchemaUpdate
# from utils.unitofwork import IUnitOfWork
#
#
# class DetailService:
#     async def create(self, uow: IUnitOfWork, data: DetailSchemaAdd) -> DetailSchema:
#         data_dict = data.model_dump()
#         async with uow:
#             result = await uow.detail.create(data_dict)
#             await uow.commit()
#             return result
#
#     async def get_all(self, uow: IUnitOfWork, limit: int, offset: int) -> tuple[Any, Any]:
#         async with uow:
#             results, total = await uow.detail.get_all(limit=limit, offset=offset)
#             return results, total
#
#     async def get_by_id(self, uow: IUnitOfWork, id: int) -> DetailSchema:
#         async with uow:
#             result = await uow.detail.get_by_id(id)
#             return result
#
#     async def update(self, uow: IUnitOfWork, id: int, new_data: DetailSchemaUpdate) -> DetailSchema:
#         updated_data = new_data.model_dump()
#         async with uow:
#             result = await uow.detail.update(id, updated_data)
#             await uow.commit()
#             return result
