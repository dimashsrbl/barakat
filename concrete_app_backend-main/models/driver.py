from enum import unique
from typing import Optional

from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.db import Base, intpk, is_active
from schemas.driver import DriverSchema


class Driver(Base):
    __tablename__ = "driver"

    id: Mapped[intpk]
    name: Mapped[str] = mapped_column(unique=True)
    is_active: Mapped[is_active]

    def to_read_model(self) -> DriverSchema:
        return DriverSchema(
            id=self.id,
            name=self.name,
            is_active=self.is_active,
        )
