import datetime
from typing import Optional

from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.db import Base, intpk, created_at, is_active
from schemas.request import RequestSchema, NotificationStatusEnum


class Request(Base):
    __tablename__ = "request"

    id: Mapped[intpk]
    interval: Mapped[int]
    realized_cubature: Mapped[float] = mapped_column(default=0.0)
    loading_cubature: Mapped[float] = mapped_column(default=0.0)
    purpose_cubature: Mapped[float]
    initial_purpose_cubature: Mapped[float]
    created_at: Mapped[created_at]
    finished_at: Mapped[Optional[datetime.datetime]]
    description: Mapped[Optional[str]]
    purpose_start: Mapped[datetime.datetime]
    is_finished: Mapped[bool] = mapped_column(default=False)
    is_active: Mapped[is_active]

    is_abs: Mapped[NotificationStatusEnum] = mapped_column(default=NotificationStatusEnum.initial)
    is_call: Mapped[NotificationStatusEnum] = mapped_column(default=NotificationStatusEnum.initial)
    by_call: Mapped[bool] = mapped_column(default=False)
    auto_send_telegram: Mapped[bool] = mapped_column(default=False)

    created_by: Mapped[int] = mapped_column(ForeignKey('user.id'))
    detail_id: Mapped[int] = mapped_column(ForeignKey('detail.id'))
    detail_relation: Mapped["Detail"] = relationship(back_populates="request_relation")
    receive_method_id: Mapped[Optional[int]] = mapped_column(ForeignKey('receive_method.id'))

    __table_args__ = (UniqueConstraint("detail_id"),)

    def to_read_model(self) -> RequestSchema:
        return RequestSchema(
            id=self.id,
            interval=self.interval,
            realized_cubature=self.realized_cubature,
            loading_cubature=self.loading_cubature,
            purpose_cubature=self.purpose_cubature,
            initial_purpose_cubature=self.initial_purpose_cubature,
            created_at=self.created_at,
            finished_at=self.finished_at,
            description=self.description,
            purpose_start=self.purpose_start,
            is_active=self.is_active,
            is_finished=self.is_finished,
            is_abs=self.is_abs,
            is_call=self.is_call,
            by_call=self.by_call,
            auto_send_telegram=self.auto_send_telegram,
            created_by=self.created_by,
            detail_id=self.detail_id,
            receive_method_id=self.receive_method_id,
        )
