from models.permission import Permission
from utils.repository import SQLAlchemyRepository


class PermissionRepository(SQLAlchemyRepository):
    model = Permission
