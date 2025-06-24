from typing import Optional

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from db.db import Base, intpk, is_active
from schemas.construction import ConstructionSchema


class Construction(Base):
    __tablename__ = "construction"

    id: Mapped[intpk]
    name: Mapped[str] = mapped_column(unique=True)
    construction_type_id: Mapped[int] = mapped_column(ForeignKey('construction_type.id'))
    description: Mapped[Optional[str]]
    is_active: Mapped[is_active]

    def to_read_model(self) -> ConstructionSchema:
        return ConstructionSchema(
            id=self.id,
            name=self.name,
            construction_type_id=self.construction_type_id,
            description=self.description,
            is_active=self.is_active,
        )
