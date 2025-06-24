from typing import Optional

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, relationship, mapped_column

from db.db import Base, intpk, is_active
from schemas.material import MaterialSchema


class Material(Base):
    __tablename__ = "material"

    id: Mapped[intpk]
    name: Mapped[str] = mapped_column(unique=True)
    density: Mapped[Optional[int]]
    is_active: Mapped[is_active]

    material_type_id: Mapped[int] = mapped_column(ForeignKey('material_type.id'))

    def to_read_model(self) -> MaterialSchema:
        return MaterialSchema(
            id=self.id,
            name=self.name,
            material_type_id=self.material_type_id,
            density=self.density,
            is_active=self.is_active,
        )
