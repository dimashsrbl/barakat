from typing import Optional

from pydantic import BaseModel


class ConstructionTypeSchema(BaseModel):
    id: int
    name: str
    key_name: str
    is_active: bool

    class Config:
        from_attributes = True


# class ConstructionSchemaAdd(BaseModel):
#     name: str
#     construction_type_id: int
#     description: Optional[str] = None
#
#
# class ConstructionSchemaUpdate(BaseModel):
#     name: str
#     construction_type_id: int
#     description: Optional[str] = None
#
#
# class ConstructionSchemaIsActive(BaseModel):
#     is_active: bool
