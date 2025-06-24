from typing import Optional

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.db import Base, intpk
from schemas.construction import ConstructionSchema
from schemas.detail import DetailSchema


class Detail(Base):
    __tablename__ = "detail"

    id: Mapped[intpk]
    seller_company_id: Mapped[int] = mapped_column(ForeignKey('company.id'))
    client_company_id: Mapped[int] = mapped_column(ForeignKey('company.id'))
    material_id: Mapped[int] = mapped_column(ForeignKey('material.id'))
    construction_id: Mapped[Optional[int]] = mapped_column(ForeignKey('construction.id'))
    object_id: Mapped[Optional[int]] = mapped_column(ForeignKey('object.id'))
    cone_draft_default: Mapped[Optional[str]]

    request_relation: Mapped["Request"] = relationship(back_populates='detail_relation')

    def to_read_model(self) -> DetailSchema:
        return DetailSchema(
            id=self.id,
            seller_company_id=self.seller_company_id,
            client_company_id=self.client_company_id,
            material_id=self.material_id,
            construction_id=self.construction_id,
            object_id=self.object_id,
            cone_draft_default=self.cone_draft_default,
        )
