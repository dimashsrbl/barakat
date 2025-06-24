from typing import Optional

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from db.db import Base, intpk, is_active
from schemas.receive_method import ReceiveMethodSchema


class ReceiveMethod(Base):
    __tablename__ = "receive_method"

    id: Mapped[intpk]
    name: Mapped[str] = mapped_column(unique=True)
    receive_method_type_id:  Mapped[int] = mapped_column(ForeignKey('receive_method_type.id'))
    description: Mapped[Optional[str]]
    is_active: Mapped[is_active]

    def to_read_model(self) -> ReceiveMethodSchema:
        return ReceiveMethodSchema(
            id=self.id,
            name=self.name,
            receive_method_type_id=self.receive_method_type_id,
            description=self.description,
            is_active=self.is_active,
        )
