from pydantic import BaseModel


class DriverSchema(BaseModel):
    id: int
    name: str
    is_active: bool

    class Config:
        from_attributes = True


class DriverSchemaAdd(BaseModel):
    name: str


class DriverSchemaUpdate(BaseModel):
    name: str


class DriverSchemaIsActive(BaseModel):
    is_active: bool
