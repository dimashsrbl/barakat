import enum
from typing import Optional

from pydantic import BaseModel, PositiveInt

from schemas.material_type import MaterialTypeSchema


class MaterialSchema(BaseModel):
    id: int
    name: str
    material_type_id: PositiveInt
    material_type: MaterialTypeSchema = None
    density: Optional[PositiveInt] = None
    is_active: bool

    class Config:
        from_attributes = True


class MaterialSchemaAdd(BaseModel):
    name: str
    material_type_id: PositiveInt
    density: Optional[PositiveInt] = None


class MaterialSchemaUpdate(BaseModel):
    name: str
    material_type_id: PositiveInt
    density: Optional[PositiveInt] = None


class MaterialSchemaIsActive(BaseModel):
    is_active: bool
