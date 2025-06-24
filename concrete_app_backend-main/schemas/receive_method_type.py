from pydantic import BaseModel


class ReceiveMethodTypeSchema(BaseModel):
    id: int
    name: str
    key_name: str
    is_active: bool

    class Config:
        from_attributes = True


# class ReceiveMethodSchemaAdd(BaseModel):
#     name: str
#     construction_type_id: int
#     description: Optional[str] = None
# 
# 
# class ReceiveMethodSchemaUpdate(BaseModel):
#     name: str
#     construction_type_id: int
#     description: Optional[str] = None
# 
# 
# class ReceiveMethodSchemaIsActive(BaseModel):
#     is_active: bool
