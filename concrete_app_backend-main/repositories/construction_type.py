from models.construction_type import ConstructionType
from utils.repository import SQLAlchemyRepository


class ConstructionTypeRepository(SQLAlchemyRepository):
    model = ConstructionType
