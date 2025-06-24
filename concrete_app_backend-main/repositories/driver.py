from models.driver import Driver
from utils.repository import SQLAlchemyRepository


class DriverRepository(SQLAlchemyRepository):
    model = Driver
