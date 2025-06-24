from models.carrier import Carrier
from utils.repository import SQLAlchemyRepository


class CarrierRepository(SQLAlchemyRepository):
    model = Carrier
