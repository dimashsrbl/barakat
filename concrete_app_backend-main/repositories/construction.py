from models.construction import Construction
from utils.repository import SQLAlchemyRepository


class ConstructionRepository(SQLAlchemyRepository):
    model = Construction
