from models.transport import Transport
from utils.repository import SQLAlchemyRepository


class TransportRepository(SQLAlchemyRepository):
    model = Transport
