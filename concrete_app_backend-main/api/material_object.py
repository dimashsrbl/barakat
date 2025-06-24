# from fastapi import APIRouter
#
# from api.dependencies import UOWDep
# from schemas.material_object import MaterialObjectSchemaAdd, MaterialObjectSchema, MaterialObjectSchemaUpdate
# from services.material_object import MaterialObjectService
#
# router = APIRouter(
#     prefix="/material_object",
#     tags=["Промежуточная таблица Марки бетона и раствора + Объекта"],
# )
#
#
# @router.post("/create", description='Создать значение')
# async def create_material_object(
#         material_object: MaterialObjectSchemaAdd,
#         uow: UOWDep,
# ) -> MaterialObjectSchema:
#     created_material_object = await MaterialObjectService().create(uow, material_object)
#     return created_material_object
#
#
# @router.get("/get", description='Получить все значения')
# async def get_all_material_objects(
#         uow: UOWDep,
#         limit: int = None,
#         offset: int = None,
# ) -> list[MaterialObjectSchema]:
#     material_objects = await MaterialObjectService().get_all(uow, limit, offset)
#     return material_objects
#
#
# @router.get(path="/get/{material_object_id}", description='Получить значение по id')
# async def get_material_object_by_id(
#         uow: UOWDep, material_object_id: int
# ) -> MaterialObjectSchema:
#     material_object = await MaterialObjectService().get_by_id(uow, material_object_id)
#     return material_object
#
#
# @router.put(path="/update/{material_object_id}", description='Обновить значение')
# async def update_material_object_by_id(
#         uow: UOWDep,
#         material_object_id: int,
#         material_object_update: MaterialObjectSchemaUpdate,
# ) -> MaterialObjectSchema:
#     material_object = await MaterialObjectService().update(uow, material_object_id, material_object_update)
#     return material_object
