from typing import Optional

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.db import Base, intpk, is_active
from schemas.object import ObjectSchema


class Object(Base):
    __tablename__ = "object"

    id: Mapped[intpk]
    company_id: Mapped[int] = mapped_column(ForeignKey('company.id'))
    name: Mapped[str] = mapped_column(unique=True)
    address: Mapped[Optional[str]]
    contact_number: Mapped[Optional[str]]
    chat_id: Mapped[Optional[str]]
    is_active: Mapped[is_active]

    material_types: Mapped[list['MaterialType']] = relationship(
        back_populates='objects',
        secondary='material_type_object'
    )

    def to_read_model(self) -> ObjectSchema:
        return ObjectSchema(
            id=self.id,
            company_id=self.company_id,
            name=self.name,
            address=self.address,
            contact_number=self.contact_number,
            chat_id=self.chat_id,
            is_active=self.is_active,
        )
