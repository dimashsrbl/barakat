import datetime
import enum
from typing import Optional

from pydantic import BaseModel, NaiveDatetime

from schemas.company import CompanySchema
from schemas.construction import ConstructionSchema
from schemas.material import MaterialSchema
from schemas.object import ObjectSchema
from schemas.receive_method import ReceiveMethodSchema
from schemas.user import UserSchema


class NotificationStatusEnum(enum.Enum):
    initial = "Первоначальный"
    read = "Прочитано"
    not_read = "Не прочитано"


class RequestSchema(BaseModel):
    id: int
    interval: int
    realized_cubature: float
    loading_cubature: float
    purpose_cubature: float
    initial_purpose_cubature: float
    remain_cubature: float = None
    created_at: datetime.datetime
    finished_at: Optional[datetime.datetime] = None
    description: Optional[str]
    purpose_start: datetime.datetime
    is_active: bool
    is_finished: bool
    detail_id: int

    receive_method_id: Optional[int] = None
    receive_method: ReceiveMethodSchema = None

    created_by: int
    created_by_instance: UserSchema = None
    object: ObjectSchema = None
    seller_company: CompanySchema = None
    client_company: CompanySchema = None
    material: MaterialSchema = None
    construction: ConstructionSchema = None
    cone_draft_default: str = None

    # Notifications
    is_abs: NotificationStatusEnum
    is_call: NotificationStatusEnum
    by_call: bool
    auto_send_telegram: bool

    class Config:
        from_attributes = True


class RequestSchemaAdd(BaseModel):
    interval: int
    description: Optional[str] = None
    purpose_cubature: float
    purpose_start: NaiveDatetime
    receive_method_id: Optional[int] = None

    seller_company_id: int
    client_company_id: int
    material_id: int
    construction_id: int
    cone_draft_default: str
    object_id: int
    by_call: bool = False
    auto_send_telegram: bool


class RequestSchemaUpdate(BaseModel):
    interval: int
    description: Optional[str] = None
    purpose_cubature: float
    purpose_start: NaiveDatetime
    receive_method_id: Optional[int] = None

    seller_company_id: int
    client_company_id: int
    material_id: int
    construction_id: int
    cone_draft_default: str
    object_id: int
    by_call: bool = False
    auto_send_telegram: bool


class RequestSchemaIsActive(BaseModel):
    is_active: bool
