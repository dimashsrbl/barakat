import datetime
from typing import Optional

from pydantic import BaseModel, PositiveInt, Field, NaiveDatetime
from sqlalchemy import LargeBinary

from schemas.carrier import CarrierSchema
from schemas.company import CompanySchema
from schemas.concrete_mixing_plant import ConcreteMixingPlantSchema
from schemas.construction import ConstructionSchema
from schemas.driver import DriverSchema
from schemas.material import MaterialSchema
from schemas.object import ObjectSchema
from schemas.photo import PhotoSchema
from schemas.transport import TransportSchema
from schemas.user import UserSchema


class WeighingSchema(BaseModel):
    id: int
    tare_weight: Optional[PositiveInt] = None
    old_tare_weight: Optional[PositiveInt] = None
    brutto_weight: Optional[PositiveInt] = None
    old_brutto_weight: Optional[PositiveInt] = None
    netto_weight: Optional[PositiveInt] = None
    first_at: datetime.datetime
    second_at: datetime.datetime
    first_operator_id: PositiveInt
    second_operator_id: Optional[PositiveInt] = None
    first_operator: UserSchema = None
    second_operator: Optional[UserSchema] = None

    transport_id: PositiveInt
    transport: TransportSchema = None

    driver_id: Optional[int] = None
    driver: DriverSchema = None

    detail_id: Optional[int] = None
    seller_company: CompanySchema = None
    client_company: CompanySchema = None
    material: MaterialSchema = None
    object: ObjectSchema = None

    photo_id: Optional[int] = None
    photo: PhotoSchema = None

    clean_weight: Optional[PositiveInt] = None
    weediness: Optional[int] = Field(ge=0, lt=100, default=None)
    silo_number: Optional[PositiveInt] = None
    doc_weight: Optional[PositiveInt] = None
    bag_details: Optional[str] = ""

    cubature: Optional[float] = None
    request_purpose_cubature: float = None
    request_realized_cubature: float = None
    request_loading_cubature: float = None
    request_remain_cubature: float = None

    concrete_mixing_plant_id: Optional[PositiveInt] = None
    concrete_mixing_plant: ConcreteMixingPlantSchema = None

    cone_draft: Optional[str] = None
    construction_id: Optional[PositiveInt] = None
    construction: ConstructionSchema = None
    plomba: Optional[str] = None

    is_depend: bool
    is_finished: bool
    is_active: bool
    is_return: bool
    is_adjusted: bool
    is_sent_to_cmp: bool = None
    is_sent_to_telegram: bool = None

    deactivate_note: Optional[str] = None
    return_note: Optional[str] = None
    adjust_note: Optional[str] = None

    class Config:
        from_attributes = True


class SingleIndependentWeighingSchemaRead(BaseModel):
    # все отправлять, по вторичным ключам все данные получать
    # и формировать в один запрос (по транспорту посмотреть перевозчика)
    id: int
    tare_weight: Optional[PositiveInt] = None
    brutto_weight: Optional[PositiveInt] = None
    netto_weight: Optional[PositiveInt] = None

    first_at: datetime.datetime
    second_at: datetime.datetime
    first_operator: UserSchema
    second_operator: Optional[UserSchema] = None

    # detail of independent weighing
    detail_id: Optional[int] = None
    seller_company: CompanySchema = None
    client_company: CompanySchema = None
    material: MaterialSchema = None

    transport: TransportSchema = None
    photo_id: Optional[int] = None

    clean_weight: Optional[PositiveInt] = None
    weediness: Optional[int] = Field(ge=0, lt=100, default=None)
    silo_number: Optional[PositiveInt] = None
    doc_weight: Optional[PositiveInt] = None
    bag_details: Optional[str] = ""

    is_finished: bool
    is_active: bool


class SingleDependentWeighingSchemaRead(BaseModel):
    id: int
    tare_weight: Optional[PositiveInt] = None
    brutto_weight: Optional[PositiveInt] = None
    netto_weight: Optional[PositiveInt] = None

    first_at: datetime.datetime
    second_at: datetime.datetime
    first_operator: UserSchema
    second_operator: Optional[UserSchema] = None

    # detail of dependent weighing
    detail_id: Optional[int] = None
    seller_company: CompanySchema = None
    client_company: CompanySchema = None
    material: MaterialSchema = None
    object: Optional[ObjectSchema] = None

    transport: TransportSchema = None
    carrier: CarrierSchema = None  # get from transport
    photo_id: Optional[int] = None

    cubature: float
    concrete_mixing_plant_id: Optional[PositiveInt] = None
    concrete_mixing_plant: ConcreteMixingPlantSchema = None

    construction_id: Optional[PositiveInt] = None
    construction: Optional[ConstructionSchema] = None  # weighing's construction
    cone_draft: Optional[str] = None  # weighing's construction

    plomba: Optional[str] = None

    is_finished: bool
    is_active: bool


class MultipleIndependentWeighingSchemaRead(BaseModel):
    """
        Для ПОЛУЧЕНИЯ независимых (не связанных с заявками) отвесов</br>
    """
    id: int
    tare_weight: Optional[PositiveInt] = None
    brutto_weight: Optional[PositiveInt] = None
    netto_weight: Optional[PositiveInt] = None

    # detail of independent weighing
    detail_id: Optional[int] = None
    seller_company: CompanySchema = None
    client_company: CompanySchema = None
    material: MaterialSchema = None

    bag_details: Optional[str] = ""
    transport: TransportSchema = None
    photo_id: Optional[int] = None
    first_at: datetime.datetime
    second_at: datetime.datetime
    is_finished: bool


class MultipleDependentWeighingSchemaRead(BaseModel):
    """
        Для ПОЛУЧЕНИЯ зависимых (связанных с заявками) отвесов</br>
    """
    id: int
    tare_weight: Optional[PositiveInt] = None
    brutto_weight: Optional[PositiveInt] = None
    netto_weight: Optional[PositiveInt] = None

    cubature: float
    concrete_mixing_plant_id: Optional[PositiveInt] = None
    concrete_mixing_plant: Optional[ConcreteMixingPlantSchema] = None
    transport_id: Optional[PositiveInt] = None
    photo_id: Optional[int] = None
    transport: TransportSchema

    first_at: datetime.datetime
    second_at: datetime.datetime
    is_finished: bool


class DependentWeighingSchemaAdd(BaseModel):
    """
        Для создания зависимых (связанных с заявками) отвесов</br>
    """
    tare_weight: Optional[PositiveInt] = None
    brutto_weight: Optional[PositiveInt] = None
    driver_id: Optional[int] = None

    transport_id: Optional[PositiveInt] = None
    plate_number_input: Optional[str] = None

    request_id: PositiveInt

    cubature: float
    concrete_mixing_plant_id: Optional[PositiveInt] = None
    cone_draft: str
    construction_id: PositiveInt
    plomba: Optional[str] = None

    photo_id: Optional[int] = None


class IndependentWeighingSchemaAdd(BaseModel):
    """
       Для создания независимых (несвязанных с заявками) отвесов</br>
   """
    tare_weight: Optional[PositiveInt] = None
    brutto_weight: Optional[PositiveInt] = None
    driver_id: Optional[int] = None

    transport_id: Optional[PositiveInt] = None
    plate_number_input: Optional[str] = None

    seller_company_id: PositiveInt
    client_company_id: PositiveInt
    material_id: PositiveInt

    doc_weight: Optional[PositiveInt] = None
    bag_details: Optional[str] = ""
    weediness: Optional[int] = Field(ge=0, lt=100, default=None)
    silo_number: Optional[PositiveInt] = None

    photo_id: Optional[int] = None


class DependentWeighingSchemaUpdateNotFinished(BaseModel):
    """
       is_depend = True
       Для завершения зависимых (связанных с заявками) отвесов
       Метод update()
   """
    tare_weight: PositiveInt
    brutto_weight: PositiveInt
    driver_id: Optional[int] = None

    transport_id: Optional[PositiveInt] = None
    plate_number_input: Optional[str] = None

    cubature: float
    concrete_mixing_plant_id: Optional[PositiveInt] = None
    cone_draft: str
    construction_id: PositiveInt
    plomba: Optional[str] = None

    photo_id: Optional[int] = None


class IndependentWeighingSchemaUpdateNotFinished(BaseModel):
    """
       is_depend = False
       Для завершения независимых (несвязанных с заявками) отвесов
       Метод update()
   """
    tare_weight: PositiveInt
    brutto_weight: PositiveInt
    driver_id: Optional[int] = None

    transport_id: Optional[PositiveInt] = None
    plate_number_input: Optional[str] = None

    seller_company_id: PositiveInt
    client_company_id: PositiveInt
    material_id: PositiveInt

    doc_weight: Optional[PositiveInt] = None
    bag_details: Optional[str] = ""
    weediness: Optional[int] = Field(ge=0, lt=100, default=None)
    silo_number: Optional[PositiveInt] = None
    photo_id: Optional[int] = None


class DependentWeighingSchemaUpdateFinished(BaseModel):
    """
       is_depend = True
       Для обновления зависимых (связанных с заявками) отвесов
       Метод update()
   """
    driver_id: Optional[int] = None

    transport_id: Optional[PositiveInt] = None
    plate_number_input: Optional[str] = None

    cubature: float
    concrete_mixing_plant_id: Optional[PositiveInt] = None
    cone_draft: str
    construction_id: PositiveInt
    plomba: Optional[str] = None


class IndependentWeighingSchemaUpdateFinished(BaseModel):
    """
       is_depend = False
       Для обновления независимых (несвязанных с заявками) отвесов
       Метод update()
   """
    seller_company_id: PositiveInt
    client_company_id: PositiveInt
    material_id: PositiveInt

    transport_id: Optional[PositiveInt] = None
    plate_number_input: Optional[str] = None

    driver_id: Optional[int] = None
    doc_weight: Optional[PositiveInt] = None
    bag_details: Optional[str] = ""
    weediness: Optional[int] = Field(ge=0, lt=100, default=None)
    silo_number: Optional[PositiveInt] = None
    photo_id: Optional[int] = None


class WeighingSchemaConcreteMixingPlant(BaseModel):
    concrete_mixing_plant_id: PositiveInt
    cubature: float


class WeighingSchemaIsActive(BaseModel):
    is_active: bool
    deactivate_note: str


class WeighingSchemaIsReturn(BaseModel):
    is_return: bool
    return_note: str


class WeighingSchemaChangeMonitoringData(BaseModel):
    tare_weight: PositiveInt
    brutto_weight: PositiveInt
    bag_details: Optional[str] = None
    first_at: NaiveDatetime
    second_at: NaiveDatetime
    first_operator_id: int
    second_operator_id: int
    adjust_note: str
