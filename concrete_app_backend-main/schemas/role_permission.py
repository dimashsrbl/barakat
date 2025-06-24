from pydantic import BaseModel


class RolePermissionSchema(BaseModel):
    role_id: int
    permission_id: int

    class Config:
        from_attributes = True


class RolePermissionSchemaAdd(BaseModel):
    role_id: int
    permission_id: int


class RolePermissionSchemaUpdate(BaseModel):
    role_id: int
    permission_id: int
