from models.object import Object
from utils.repository import SQLAlchemyRepository


class ObjectRepository(SQLAlchemyRepository):
    model = Object
