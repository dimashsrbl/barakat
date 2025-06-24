# from schemas.discrete_output_module import DiscreteOutputModuleSchemaAdd, DiscreteOutputModuleSchema, DiscreteOutputModuleSchemaUpdate
# from utils.unitofwork import IUnitOfWork
#
#
# class DiscreteOutputModuleService:
#     async def create(self, uow: IUnitOfWork, data: DiscreteOutputModuleSchemaAdd) -> DiscreteOutputModuleSchema:
#         data_dict = data.model_dump()
#         async with uow:
#             result = await uow.discrete_output_module.create(data_dict)
#             await uow.commit()
#             return result
#
#     async def get_all(self, uow: IUnitOfWork, limit: int, offset: int) -> list[DiscreteOutputModuleSchema]:
#         async with uow:
#             result = await uow.discrete_output_module.get_all(limit=limit, offset=offset)
#             return result
#
#     async def get_by_id(self, uow: IUnitOfWork, id: int) -> DiscreteOutputModuleSchema:
#         async with uow:
#             result = await uow.discrete_output_module.get_by_id(id)
#             return result
#
#     async def update(self, uow: IUnitOfWork, id: int, new_data: DiscreteOutputModuleSchemaUpdate) -> DiscreteOutputModuleSchema:
#         updated_data = new_data.model_dump()
#         async with uow:
#             result = await uow.discrete_output_module.update(id, updated_data)
#             await uow.commit()
#             return result
