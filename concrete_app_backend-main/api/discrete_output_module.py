# from fastapi import APIRouter
#
# from api.dependencies import UOWDep
# from schemas.discrete_output_module import DiscreteOutputModuleSchemaAdd, DiscreteOutputModuleSchema, DiscreteOutputModuleSchemaUpdate
# from services.discrete_output_module import DiscreteOutputModuleService
#
# router = APIRouter(
#     prefix="/discrete_output_module",
#     tags=["Шлагбаумы и светофоры"],
# )
#
#
# @router.post("/create", description='Создать значение')
# async def create_discrete_output_module(
#         discrete_output_module: DiscreteOutputModuleSchemaAdd,
#         uow: UOWDep,
# ) -> DiscreteOutputModuleSchema:
#     created_discrete_output_module = await DiscreteOutputModuleService().create(uow, discrete_output_module)
#     return created_discrete_output_module
#
#
# @router.get("/get", description='Получить все значения')
# async def get_all_discrete_output_modules(
#         uow: UOWDep,
#         limit: int = None,
#         offset: int = None,
# ) -> list[DiscreteOutputModuleSchema]:
#     discrete_output_modules = await DiscreteOutputModuleService().get_all(uow, limit, offset)
#     return discrete_output_modules
#
#
# @router.get(path="/get/{discrete_output_module_id}", description='Получить значение по id')
# async def get_discrete_output_module_by_id(
#         uow: UOWDep, discrete_output_module_id: int
# ) -> DiscreteOutputModuleSchema:
#     discrete_output_module = await DiscreteOutputModuleService().get_by_id(uow, discrete_output_module_id)
#     return discrete_output_module
#
#
# @router.put(path="/update/{discrete_output_module_id}", description='Обновить значение')
# async def update_discrete_output_module_by_id(
#         uow: UOWDep,
#         discrete_output_module_id: int,
#         discrete_output_module_update: DiscreteOutputModuleSchemaUpdate,
# ) -> DiscreteOutputModuleSchema:
#     discrete_output_module = await DiscreteOutputModuleService().update(uow, discrete_output_module_id, discrete_output_module_update)
#     return discrete_output_module
