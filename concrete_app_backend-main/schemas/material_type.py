from pydantic import BaseModel


class MaterialTypeSchema(BaseModel):
    id: int
    name: str
    is_active: bool
    is_for_dependent: bool
    is_for_independent: bool

    class Config:
        from_attributes = True


class MaterialTypeSchemaAdd(BaseModel):
    name: str
    is_for_dependent: bool
    is_for_independent: bool


class MaterialTypeSchemaUpdate(BaseModel):
    name: str
    is_for_dependent: bool
    is_for_independent: bool


class MaterialTypeSchemaIsActive(BaseModel):
    is_active: bool
