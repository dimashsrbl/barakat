from typing import Optional

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from db.db import Base, is_active
from schemas.user import UserSchema


class User(Base):
    __tablename__ = 'user'

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    login: Mapped[str] = mapped_column(unique=True, index=True)
    hashed_password: Mapped[str]
    fullname: Mapped[str]
    description: Mapped[Optional[str]]
    is_active: Mapped[is_active]

    role_id: Mapped[int] = mapped_column(
        ForeignKey('role.id')
    )

    def to_read_model(self) -> UserSchema:
        return UserSchema(
            id=self.id,
            login=self.login,
            fullname=self.fullname,
            description=self.description,
            is_active=self.is_active,
            role_id=self.role_id,
        )