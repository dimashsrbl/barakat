from typing import Optional

from pydantic import BaseModel


class CarrierSchema(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True


class CarrierSchemaAdd(BaseModel):
    name: str
    description: Optional[str] = None


class CarrierSchemaUpdate(BaseModel):
    name: str
    description: Optional[str] = None


class CarrierSchemaIsActive(BaseModel):
    is_active: bool
