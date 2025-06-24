from typing import Optional

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.db import Base, intpk, is_active
from models.driver import Driver
from schemas.transport import TransportSchema


class Transport(Base):
    __tablename__ = "transport"

    id: Mapped[intpk]
    plate_number: Mapped[str] = mapped_column(unique=True)
    admissible_error: Mapped[Optional[int]]
    tare: Mapped[Optional[int]]
    carrier_id: Mapped[Optional[int]] = mapped_column(ForeignKey("carrier.id"))
    driver_id: Mapped[Optional[int]] = mapped_column(ForeignKey("driver.id"))
    is_active: Mapped[is_active]

    def to_read_model(self) -> TransportSchema:
        return TransportSchema(
            id=self.id,
            plate_number=self.plate_number,
            admissible_error=self.admissible_error,
            tare=self.tare,
            carrier_id=self.carrier_id,
            driver_id=self.driver_id,
            is_active=self.is_active,
        )
