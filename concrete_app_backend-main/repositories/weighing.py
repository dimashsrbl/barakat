from models.weighing import Weighing
from utils.repository import SQLAlchemyRepository


class WeighingRepository(SQLAlchemyRepository):
    model = Weighing
