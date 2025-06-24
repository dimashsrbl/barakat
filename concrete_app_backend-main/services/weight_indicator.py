# from schemas.weight_indicator import WeightIndicatorSchemaAdd, WeightIndicatorSchema, WeightIndicatorSchemaUpdate
# from utils.unitofwork import IUnitOfWork
#
#
# class WeightIndicatorService:
#     async def create(self, uow: IUnitOfWork, data: WeightIndicatorSchemaAdd) -> WeightIndicatorSchema:
#         data_dict = data.model_dump()
#         async with uow:
#             result = await uow.weight_indicator.create(data_dict)
#             await uow.commit()
#             return result
#
#     async def get_all(self, uow: IUnitOfWork, limit: int, offset: int) -> list[WeightIndicatorSchema]:
#         async with uow:
#             result = await uow.weight_indicator.get_all(limit=limit, offset=offset)
#             return result
#
#     async def get_by_id(self, uow: IUnitOfWork, id: int) -> WeightIndicatorSchema:
#         async with uow:
#             result = await uow.weight_indicator.get_by_id(id)
#             return result
#
#     async def update(self, uow: IUnitOfWork, id: int, new_data: WeightIndicatorSchemaUpdate) -> WeightIndicatorSchema:
#         updated_data = new_data.model_dump()
#         async with uow:
#             result = await uow.weight_indicator.update(id, updated_data)
#             await uow.commit()
#             return result
