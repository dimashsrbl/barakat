from typing import Optional

from pydantic import BaseModel

from schemas.receive_method_type import ReceiveMethodTypeSchema


class ReceiveMethodSchema(BaseModel):
    id: int
    name: str
    receive_method_type_id: int
    receive_method_type: ReceiveMethodTypeSchema = None
    description: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True


class ReceiveMethodSchemaAdd(BaseModel):
    name: str
    receive_method_type_id: int
    description: Optional[str] = None


class ReceiveMethodSchemaUpdate(BaseModel):
    name: str
    receive_method_type_id: int
    description: Optional[str] = None


class ReceiveMethodSchemaIsActive(BaseModel):
    is_active: bool
