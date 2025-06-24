from models.receive_method_type import ReceiveMethodType
from utils.repository import SQLAlchemyRepository


class ReceiveMethodTypeRepository(SQLAlchemyRepository):
    model = ReceiveMethodType
