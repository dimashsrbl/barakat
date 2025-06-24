from typing import Optional

from pydantic import BaseModel, PositiveInt

from schemas.carrier import CarrierSchema
from schemas.driver import DriverSchema


class TransportSchema(BaseModel):
    id: int
    plate_number: str
    admissible_error: Optional[int] = None
    tare: Optional[int] = None
    carrier_id: Optional[PositiveInt] = None
    carrier: CarrierSchema = None
    driver_id: Optional[PositiveInt] = None
    driver: DriverSchema = None
    is_active: bool

    class Config:
        from_attributes = True


class TransportSchemaAdd(BaseModel):
    plate_number: str
    admissible_error: Optional[int] = None
    tare: Optional[int] = None
    carrier_id: Optional[PositiveInt] = None
    driver_id: Optional[PositiveInt] = None


class TransportSchemaUpdate(BaseModel):
    plate_number: str
    admissible_error: Optional[int] = None
    tare: Optional[int] = None
    carrier_id: Optional[PositiveInt] = None
    driver_id: Optional[PositiveInt] = None


class TransportSchemaIsActive(BaseModel):
    is_active: bool
