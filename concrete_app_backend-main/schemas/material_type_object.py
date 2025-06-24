from pydantic import BaseModel


class MaterialTypeObjectSchema(BaseModel):
    material_type_id: int
    object_id: int

    class Config:
        from_attributes = True


class MaterialTypeObjectSchemaAdd(BaseModel):
    material_type_id: str
    object_id: str


class MaterialTypeObjectSchemaUpdate(BaseModel):
    material_type_id: int
    object_id: int
