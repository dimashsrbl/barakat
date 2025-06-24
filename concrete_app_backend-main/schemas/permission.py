from pydantic import BaseModel


class PermissionSchema(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class PermissionSchemaAdd(BaseModel):
    name: str


class PermissionSchemaUpdate(BaseModel):
    name: str
