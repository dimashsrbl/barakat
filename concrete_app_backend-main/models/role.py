from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.db import Base, intpk
from schemas.role import RoleSchema


class Role(Base):
    __tablename__ = "role"

    id: Mapped[intpk]
    name: Mapped[str] = mapped_column(unique=True)

    permissions: Mapped[list['Permission']] = relationship(
        back_populates='roles',
        secondary='role_permission'
    )

    def to_read_model(self) -> RoleSchema:
        return RoleSchema(
            id=self.id,
            name=self.name,
        )