from typing import Optional

from pydantic import BaseModel


class ConcreteMixingPlantSchema(BaseModel):
    id: int
    name: str
    ip_address: str
    token: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True


class ConcreteMixingPlantSchemaAdd(BaseModel):
    name: str
    ip_address: str


class ConcreteMixingPlantSchemaUpdate(BaseModel):
    name: str
    ip_address: str


class ConcreteMixingPlantSchemaIsActive(BaseModel):
    is_active: bool
