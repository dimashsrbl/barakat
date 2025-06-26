from models.inert_material_request import InertMaterialRequest
from utils.repository import SQLAlchemyRepository
from sqlalchemy import select

class InertMaterialRequestRepository(SQLAlchemyRepository):
    model = InertMaterialRequest 

    async def find_all(self):
        result = await self.session.execute(select(self.model))
        return result.scalars().all() 