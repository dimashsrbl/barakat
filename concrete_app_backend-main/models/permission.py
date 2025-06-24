from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.db import Base, intpk
from schemas.permission import PermissionSchema


class Permission(Base):
    __tablename__ = "permission"

    id: Mapped[intpk]
    name: Mapped[str] = mapped_column(unique=True)

    roles: Mapped[list['Role']] = relationship(
        back_populates='permissions',
        secondary='role_permission'
    )

    def to_read_model(self) -> PermissionSchema:
        return PermissionSchema(
            id=self.id,
            name=self.name,
        )
