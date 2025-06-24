from models.detail import Detail
from utils.repository import SQLAlchemyRepository


class DetailRepository(SQLAlchemyRepository):
    model = Detail
