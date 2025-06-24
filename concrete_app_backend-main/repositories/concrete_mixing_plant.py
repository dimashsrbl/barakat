from models.concrete_mixing_plant import ConcreteMixingPlant
from utils.repository import SQLAlchemyRepository


class ConcreteMixingPlantRepository(SQLAlchemyRepository):
    model = ConcreteMixingPlant
