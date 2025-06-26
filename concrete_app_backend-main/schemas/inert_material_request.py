from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enums.inert_request_status import InertRequestStatusEnum

class InertMaterialRequestBase(BaseModel):
    transport_id: int
    carrier_id: int
    material_id: int

class InertMaterialRequestCreate(InertMaterialRequestBase):
    pass

class InertMaterialRequestRead(InertMaterialRequestBase):
    id: int
    created_by: int
    status: InertRequestStatusEnum
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True 