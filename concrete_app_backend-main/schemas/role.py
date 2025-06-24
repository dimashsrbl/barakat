from pydantic import BaseModel

from schemas.permission import PermissionSchema


class RoleSchema(BaseModel):
    id: int
    name: str

    permissions: list[PermissionSchema] = []

    class Config:
        from_attributes = True


class RoleSchemaAdd(BaseModel):
    name: str
    permissions: list[PermissionSchema] = []


class RoleSchemaUpdate(BaseModel):
    name: str
    permissions: list[PermissionSchema] = []
