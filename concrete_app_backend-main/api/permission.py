# from fastapi import APIRouter, Depends
#
# from api.dependencies import UOWDep, get_current_user
# from models.user import User
# from schemas.permission import PermissionSchema, PermissionSchemaAdd, PermissionSchemaUpdate
# from services.permission import PermissionService
#
# router = APIRouter(
#     prefix="/permission",
#     tags=["Право доступа"],
# )
#
#
# @router.post("/create", description='Создать значение')
# async def create_permission(
#         permission: PermissionSchemaAdd,
#         uow: UOWDep,
# ) -> PermissionSchema:
#     created_permission = await PermissionService().create(uow, permission)
#     return created_permission
#
#
# @router.get("/get", description='Получить все значения')
# async def get_all_permissions(
#         uow: UOWDep,
#         limit: int = None,
#         offset: int = None,
#         current_user: User = Depends(get_current_user),
# ) -> list[PermissionSchema]:
#     permissions = await PermissionService().get_all(uow, limit, offset)
#     return permissions
#
#
# @router.get(path="/get/{permission_id}", description='Получить значение по id')
# async def get_permission_by_id(
#         uow: UOWDep, permission_id: int,
#         current_user: User = Depends(get_current_user),
# ) -> PermissionSchema:
#     permission = await PermissionService().get_by_id(uow, permission_id)
#     return permission
#
#
# @router.put(path="/update/{permission_id}", description='Обновить значение')
# async def update_permission_by_id(
#         uow: UOWDep,
#         permission_id: int,
#         permission_update: PermissionSchemaUpdate,
# ) -> PermissionSchema:
#     permission = await PermissionService().update(uow, permission_id, permission_update)
#     return permission
