# from typing import Optional
#
# from pydantic import BaseModel
#
#
# class DiscreteOutputModuleSchema(BaseModel):
#     id: int
#     name: str
#     port_number: int
#     device_address: int
#     gate_in_register: Optional[int]
#     redlight_in_register: Optional[int]
#     greenlight_in_register: Optional[int]
#     gate_out_register: Optional[int]
#     redlight_out_register: Optional[int]
#     greenlight_out_register: Optional[int]
#     weight_indicator_id: int
#     is_active: bool
#
#     class Config:
#         from_attributes = True
#
#
# class DiscreteOutputModuleSchemaAdd(BaseModel):
#     name: str
#     port_number: int
#     device_address: int
#     gate_in_register: Optional[int]
#     redlight_in_register: Optional[int]
#     greenlight_in_register: Optional[int]
#     gate_out_register: Optional[int]
#     redlight_out_register: Optional[int]
#     greenlight_out_register: Optional[int]
#     weight_indicator_id: int
#
#
# class DiscreteOutputModuleSchemaUpdate(BaseModel):
#     name: Optional[str]
#     port_number: Optional[int]
#     device_address: Optional[int]
#     gate_in_register: Optional[int]
#     redlight_in_register: Optional[int]
#     greenlight_in_register: Optional[int]
#     gate_out_register: Optional[int]
#     redlight_out_register: Optional[int]
#     greenlight_out_register: Optional[int]
#     weight_indicator_id: Optional[int]
#     is_active: Optional[bool]
