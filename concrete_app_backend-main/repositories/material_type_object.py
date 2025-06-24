from models.material_type_object import MaterialTypeObject
from utils.repository import SQLAlchemyRepository


class MaterialTypeObjectRepository(SQLAlchemyRepository):
    model = MaterialTypeObject
