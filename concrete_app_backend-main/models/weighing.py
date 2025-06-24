import datetime
from typing import Optional

from sqlalchemy import ForeignKey, LargeBinary, String
from sqlalchemy.orm import Mapped, mapped_column

from db.db import Base, intpk, is_active, created_at
from schemas.weighing import WeighingSchema


class Weighing(Base):
    __tablename__ = "weighing"

    id: Mapped[intpk]

    # core
    tare_weight: Mapped[Optional[int]]
    old_tare_weight: Mapped[Optional[int]]
    brutto_weight: Mapped[Optional[int]]
    old_brutto_weight: Mapped[Optional[int]]
    netto_weight: Mapped[Optional[int]]
    first_at: Mapped[created_at]
    second_at: Mapped[created_at]
    first_operator_id: Mapped[int] = mapped_column(ForeignKey('user.id'))
    second_operator_id: Mapped[Optional[int]] = mapped_column(ForeignKey('user.id'))
    transport_id: Mapped[int] = mapped_column(ForeignKey('transport.id'))
    driver_id: Mapped[Optional[int]] = mapped_column(ForeignKey("driver.id"))
    detail_id: Mapped[int] = mapped_column(ForeignKey('detail.id'))
    photo_id: Mapped[Optional[int]] = mapped_column(ForeignKey('photo.id'))

    # without request
    clean_weight: Mapped[Optional[int]]
    weediness: Mapped[Optional[int]] = mapped_column(default=0)
    silo_number: Mapped[Optional[int]]
    doc_weight: Mapped[Optional[int]]
    bag_details: Mapped[Optional[str]] = mapped_column(String(32), nullable=True, default="")
    old_bag_details: Mapped[Optional[str]]

    # with request
    cubature: Mapped[Optional[float]]
    concrete_mixing_plant_id: Mapped[Optional[int]] = mapped_column(ForeignKey('concrete_mixing_plant.id'))
    cone_draft: Mapped[Optional[str]]
    construction_id: Mapped[Optional[int]] = mapped_column(ForeignKey('construction.id'))
    plomba: Mapped[Optional[str]]

    # statuses
    is_depend: Mapped[bool]
    is_finished: Mapped[bool] = mapped_column(default=False)
    is_active: Mapped[is_active]
    is_return: Mapped[bool] = mapped_column(default=False)
    is_adjusted: Mapped[bool] = mapped_column(default=False)

    deactivate_note: Mapped[Optional[str]]
    return_note: Mapped[Optional[str]]
    adjust_note: Mapped[Optional[str]]

    def to_read_model(self) -> WeighingSchema:
        return WeighingSchema(
            id=self.id,
            # core
            tare_weight=self.tare_weight,
            old_tare_weight=self.tare_weight,
            brutto_weight=self.brutto_weight,
            old_brutto_weight=self.brutto_weight,
            netto_weight=self.netto_weight,
            first_at=self.first_at,
            second_at=self.second_at,
            first_operator_id=self.first_operator_id,
            second_operator_id=self.second_operator_id,
            transport_id=self.transport_id,
            driver_id=self.driver_id,
            detail_id=self.detail_id,
            photo_id=self.photo_id,
            # without request
            clean_weight=self.clean_weight,
            weediness=self.weediness,
            silo_number=self.silo_number,
            doc_weight=self.doc_weight,
            bag_details=self.bag_details,
            # with request
            cubature=self.cubature,
            concrete_mixing_plant_id=self.concrete_mixing_plant_id,
            cone_draft=self.cone_draft,
            construction_id=self.construction_id,
            plomba=self.plomba,
            # statuses
            is_depend=self.is_depend,
            is_finished=self.is_finished,
            is_active=self.is_active,
            is_return=self.is_return,
            is_adjusted=self.is_adjusted,
            # notes
            deactivate_note=self.deactivate_note,
            return_note=self.return_note,
            adjust_note=self.adjust_note,
        )
