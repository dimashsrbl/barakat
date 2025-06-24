import enum
from typing import Optional

from pydantic import BaseModel


class CompanyTypeEnum(enum.Enum):
    TOO = "ТОО"
    IP = "ИП"
    PP = "ЧЛ"  # Private Person - Частное лицо
    AO = "АО"
    Filial = "Филиал"


class CompanyFuncEnum(enum.Enum):
    supplier = "Поставщик"
    customer = "Заказчик"
    all = "Все"
    our = "Наша"


class CompanySchema(BaseModel):
    id: int
    name: str
    company_type: CompanyTypeEnum
    company_func: CompanyFuncEnum
    contact_number: Optional[str] = None
    bin: Optional[str] = None
    is_active: bool
    is_debtor: bool
    debtor_note: Optional[str]

    class Config:
        from_attributes = True


class CompanySchemaAdd(BaseModel):
    name: str
    company_type: CompanyTypeEnum
    company_func: CompanyFuncEnum
    contact_number: Optional[str] = None
    bin: Optional[str] = None


class CompanySchemaUpdate(BaseModel):
    name: str
    company_type: CompanyTypeEnum
    company_func: CompanyFuncEnum
    contact_number: Optional[str] = None
    bin: Optional[str] = None


class CompanySchemaIsDebtor(BaseModel):
    is_debtor: bool
    debtor_note: Optional[str]


class CompanySchemaIsActive(BaseModel):
    is_active: bool
