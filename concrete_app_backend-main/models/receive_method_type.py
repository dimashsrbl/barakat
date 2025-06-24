from sqlalchemy.orm import Mapped, mapped_column

from db.db import Base, intpk, is_active
from schemas.receive_method_type import ReceiveMethodTypeSchema


class ReceiveMethodType(Base):
    __tablename__ = "receive_method_type"

    id: Mapped[intpk]
    name: Mapped[str] = mapped_column(unique=True)
    key_name: Mapped[str]
    is_active: Mapped[is_active]

    def to_read_model(self) -> ReceiveMethodTypeSchema:
        return ReceiveMethodTypeSchema(
            id=self.id,
            name=self.name,
            key_name=self.key_name,
            is_active=self.is_active,
        )
