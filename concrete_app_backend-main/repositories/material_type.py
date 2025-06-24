from models.material_type import MaterialType
from utils.repository import SQLAlchemyRepository


class MaterialTypeRepository(SQLAlchemyRepository):
    model = MaterialType
