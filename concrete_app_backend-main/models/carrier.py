from enum import unique
from typing import Optional

from sqlalchemy.orm import Mapped, mapped_column

from db.db import Base, intpk, is_active
from schemas.carrier import CarrierSchema


class Carrier(Base):
    __tablename__ = "carrier"

    id: Mapped[intpk]
    name: Mapped[str] = mapped_column(unique=True)
    description: Mapped[Optional[str]]
    is_active: Mapped[is_active]

    def to_read_model(self) -> CarrierSchema:
        return CarrierSchema(
            id=self.id,
            name=self.name,
            description=self.description,
            is_active=self.is_active,
        )
