from typing import Optional

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from db.db import Base, intpk, is_active
from schemas.company import CompanySchema
from schemas.concrete_mixing_plant import ConcreteMixingPlantSchema


class ConcreteMixingPlant(Base):
    __tablename__ = "concrete_mixing_plant"

    id: Mapped[intpk]
    name: Mapped[str] = mapped_column(unique=True)
    ip_address: Mapped[str]
    token: Mapped[Optional[str]]
    is_active: Mapped[is_active]

    def to_read_model(self) -> ConcreteMixingPlantSchema:
        return ConcreteMixingPlantSchema(
            id=self.id,
            name=self.name,
            ip_address=self.ip_address,
            token=self.token,
            is_active=self.is_active,
        )
