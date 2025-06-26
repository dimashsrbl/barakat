from sqlalchemy import ForeignKey, String, DateTime, Enum
from sqlalchemy.orm import Mapped, mapped_column
from db.db import Base, intpk, created_at
from schemas.inert_material_request import InertMaterialRequestRead
from enums.inert_request_status import InertRequestStatusEnum
import datetime

class InertMaterialRequest(Base):
    __tablename__ = 'inert_material_request'

    id: Mapped[intpk]
    transport_id: Mapped[int] = mapped_column(ForeignKey('transport.id'))
    carrier_id: Mapped[int] = mapped_column(ForeignKey('carrier.id'))
    material_id: Mapped[int] = mapped_column(ForeignKey('material.id'))
    created_by: Mapped[int] = mapped_column(ForeignKey('user.id'))
    detail_id: Mapped[int] = mapped_column(ForeignKey('detail.id'), nullable=True)
    status: Mapped[InertRequestStatusEnum] = mapped_column(Enum(InertRequestStatusEnum), default=InertRequestStatusEnum.active)
    created_at: Mapped[created_at]
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.now, onupdate=datetime.datetime.now)
    
    def __repr__(self):
        return f"<InertMaterialRequest id={self.id} transport_id={self.transport_id} status={self.status}>"

    def to_read_model(self) -> InertMaterialRequestRead:
        return InertMaterialRequestRead.model_validate(self, from_attributes=True) 