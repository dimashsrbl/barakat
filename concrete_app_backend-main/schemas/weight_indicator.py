# from pydantic import BaseModel
#
#
# class WeightIndicatorSchema(BaseModel):
#     id: int
#     name: str
#     port_number: int
#     driver_name: str
#     baudrate: int
#     is_active: bool
#
#     class Config:
#         from_attributes = True
#
#
# class WeightIndicatorSchemaAdd(BaseModel):
#     name: str
#     port_number: int
#     driver_name: str
#     baudrate: int
#
#
# class WeightIndicatorSchemaUpdate(BaseModel):
#     name: str
#     port_number: int
#     driver_name: str
#     baudrate: int
#     is_active: bool
