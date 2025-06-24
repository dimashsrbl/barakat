from typing import Optional

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, relationship, mapped_column

from db.db import Base, intpk, is_active
from schemas.material import MaterialSchema
from schemas.material_type import MaterialTypeSchema


class MaterialType(Base):
    __tablename__ = "material_type"

    id: Mapped[intpk]
    name: Mapped[str] = mapped_column(unique=True)
    is_active: Mapped[is_active]

    is_for_dependent: Mapped[bool]
    is_for_independent: Mapped[bool]

    objects: Mapped[list['Object']] = relationship(
        back_populates='material_types',
        secondary='material_type_object'
    )

    def to_read_model(self) -> MaterialTypeSchema:
        return MaterialTypeSchema(
            id=self.id,
            name=self.name,
            is_active=self.is_active,
            is_for_dependent=self.is_for_dependent,
            is_for_independent=self.is_for_independent,
        )
