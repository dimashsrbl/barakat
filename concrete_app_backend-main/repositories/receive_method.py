from models.receive_method import ReceiveMethod
from utils.repository import SQLAlchemyRepository


class ReceiveMethodRepository(SQLAlchemyRepository):
    model = ReceiveMethod
