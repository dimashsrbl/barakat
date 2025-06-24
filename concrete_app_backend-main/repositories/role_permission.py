from models.role_permission import RolePermission
from utils.repository import SQLAlchemyRepository


class RolePermissionRepository(SQLAlchemyRepository):
    model = RolePermission
