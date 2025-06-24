from sqlalchemy.orm import Mapped, mapped_column

from db.db import Base, intpk
from schemas.photo import PhotoSchema


class Photo(Base):
    __tablename__ = "photo"

    id: Mapped[intpk]
    filename: Mapped[str] = mapped_column(unique=True)
    is_attached: Mapped[bool] = mapped_column(default=False)

    def to_read_model(self) -> PhotoSchema:
        return PhotoSchema(
            id=self.id,
            filename=self.filename,
            is_attached=self.is_attached,
        )
