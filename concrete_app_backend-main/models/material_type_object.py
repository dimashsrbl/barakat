from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from db.db import Base
from schemas.material_type_object import MaterialTypeObjectSchema


class MaterialTypeObject(Base):
    __tablename__ = "material_type_object"

    material_type_id: Mapped[int] = mapped_column(
        ForeignKey('material_type.id'),
        primary_key=True
    )
    object_id: Mapped[int] = mapped_column(
        ForeignKey('object.id'),
        primary_key=True
    )

    def to_read_model(self) -> MaterialTypeObjectSchema:
        return MaterialTypeObjectSchema(
            object_id=self.object_id,
            material_type_id=self.material_type_id,
        )
