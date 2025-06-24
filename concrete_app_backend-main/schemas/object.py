from typing import Optional

from pydantic import BaseModel, PositiveInt

from schemas.company import CompanySchema
from schemas.material_type import MaterialTypeSchema


class ObjectSchema(BaseModel):
    id: int
    name: str
    address: Optional[str] = None
    contact_number: Optional[str] = None
    chat_id: Optional[str] = None
    company_id: PositiveInt
    company: CompanySchema = None
    is_active: bool

    material_types: list[MaterialTypeSchema] = []

    class Config:
        from_attributes = True


class ObjectSchemaAdd(BaseModel):
    name: str
    address: Optional[str] = None
    contact_number: Optional[str] = None
    chat_id: Optional[str] = None
    company_id: PositiveInt

    material_type_ids: set[int] = []


class ObjectSchemaUpdate(BaseModel):
    name: str
    address: Optional[str] = None
    contact_number: Optional[str] = None
    chat_id: Optional[str] = None
    company_id: PositiveInt

    material_type_ids: set[int] = []


class ObjectSchemaIsActive(BaseModel):
    is_active: bool
