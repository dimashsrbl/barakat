from typing import Optional

from sqlalchemy import ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column
import enum
from db.db import Base, intpk, is_active
from schemas.company import CompanySchema, CompanyTypeEnum, CompanyFuncEnum


class Company(Base):
    __tablename__ = "company"

    id: Mapped[intpk]
    name: Mapped[str] = mapped_column(unique=True)
    company_type: Mapped[CompanyTypeEnum]
    company_func: Mapped[CompanyFuncEnum]
    contact_number: Mapped[Optional[str]]
    bin: Mapped[Optional[str]]

    is_active: Mapped[is_active]
    is_debtor: Mapped[bool] = mapped_column(default=False)

    debtor_note: Mapped[Optional[str]]

    def to_read_model(self) -> CompanySchema:
        return CompanySchema(
            id=self.id,
            name=self.name,
            company_type=self.company_type,
            company_func=self.company_func,
            contact_number=self.contact_number,
            bin=self.bin,
            is_active=self.is_active,
            is_debtor=self.is_debtor,
            debtor_note=self.debtor_note,
        )
