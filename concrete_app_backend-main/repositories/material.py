from models.material import Material
from utils.repository import SQLAlchemyRepository


class MaterialRepository(SQLAlchemyRepository):
    model = Material
