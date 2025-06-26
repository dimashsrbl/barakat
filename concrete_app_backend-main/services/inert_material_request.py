from schemas.inert_material_request import InertMaterialRequestCreate, InertMaterialRequestRead
from models.inert_material_request import InertMaterialRequest, InertRequestStatusEnum
from utils.unitofwork import IUnitOfWork
from datetime import datetime

class InertMaterialRequestService:
    async def create(self, uow: IUnitOfWork, data: InertMaterialRequestCreate, user_id: int) -> InertMaterialRequestRead:
        async with uow:
            # Проверка на существование активной заявки для транспорта
            existing = await uow.inert_material_request.find_one_or_none(transport_id=data.transport_id, status=InertRequestStatusEnum.active)
            if existing:
                raise Exception("У этого транспорта уже есть активная заявка!")
            obj = await uow.inert_material_request.create({
                **data.dict(),
                'created_by': user_id,
                'status': InertRequestStatusEnum.active,
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow(),
            })
            await uow.commit()
            return obj.to_read_model()

    async def finish(self, uow: IUnitOfWork, request_id: int) -> InertMaterialRequestRead:
        async with uow:
            obj = await uow.inert_material_request.find_one_or_none(id=request_id)
            if not obj:
                raise Exception("Заявка не найдена")
            obj = await uow.inert_material_request.update(request_id, {'status': InertRequestStatusEnum.finished, 'updated_at': datetime.utcnow()})
            return obj.to_read_model() 