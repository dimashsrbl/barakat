from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.db import Base, intpk
from schemas.role_permission import RolePermissionSchema


class RolePermission(Base):
    __tablename__ = "role_permission"

    role_id: Mapped[int] = mapped_column(
        ForeignKey('role.id'),
        primary_key=True
    )
    permission_id: Mapped[int] = mapped_column(
        ForeignKey('permission.id'),
        primary_key=True
    )

    def to_read_model(self) -> RolePermissionSchema:
        return RolePermissionSchema(
            role_id=self.role_id,
            permission_id=self.permission_id,
        )
