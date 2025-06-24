import enum
from typing import Optional

from pydantic import BaseModel

from schemas.construction_type import ConstructionTypeSchema


class ConstructionSchema(BaseModel):
    id: int
    name: str
    construction_type_id: int
    construction_type: ConstructionTypeSchema = None
    description: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True


class ConstructionSchemaAdd(BaseModel):
    name: str
    construction_type_id: int
    description: Optional[str] = None


class ConstructionSchemaUpdate(BaseModel):
    name: str
    construction_type_id: int
    description: Optional[str] = None


class ConstructionSchemaIsActive(BaseModel):
    is_active: bool
