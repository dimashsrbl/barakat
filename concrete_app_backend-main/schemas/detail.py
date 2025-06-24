from typing import Optional

from pydantic import BaseModel, PositiveInt


class DetailSchema(BaseModel):
    id: int
    seller_company_id: PositiveInt
    client_company_id: PositiveInt
    material_id: PositiveInt
    construction_id: Optional[PositiveInt] = None
    object_id: Optional[PositiveInt] = None
    cone_draft_default: Optional[str] = None

    class Config:
        from_attributes = True


class DetailSchemaAdd(BaseModel):
    seller_company_id: PositiveInt
    client_company_id: PositiveInt
    material_id: PositiveInt
    construction_id: Optional[PositiveInt] = None
    object_id: Optional[PositiveInt] = None
    cone_draft_default: Optional[str] = None


class DetailSchemaUpdate(BaseModel):
    seller_company_id: PositiveInt
    client_company_id: PositiveInt
    material_id: PositiveInt
    construction_id: Optional[PositiveInt] = None
    object_id: Optional[PositiveInt] = None
    cone_draft_default: Optional[str] = None
