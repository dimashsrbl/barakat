from schemas.inert_material_request import InertMaterialRequestCreate, InertMaterialRequestRead
from models.inert_material_request import InertMaterialRequest, InertRequestStatusEnum
from utils.unitofwork import IUnitOfWork
from datetime import datetime, timedelta

class InertMaterialRequestService:
    async def create(self, uow: IUnitOfWork, data: InertMaterialRequestCreate, user_id: int) -> InertMaterialRequestRead:
        async with uow:
            # Проверка на существование активной заявки для транспорта
            existing = await uow.inert_material_request.find_one_or_none(transport_id=data.transport_id, status=InertRequestStatusEnum.active)
            if existing:
                # Проверяем, есть ли по заявке отвесы
                weighing = await uow.weighing.find_one_or_none(inert_request_id=existing.id)
                # Если нет отвесов и прошло больше 12 часов — меняем статус на not_arrived
                if not weighing and (datetime.utcnow() - existing.created_at) > timedelta(hours=12):
                    await uow.inert_material_request.update(existing.id, {'status': InertRequestStatusEnum.not_arrived})
                    await uow.commit()
                else:
                    raise Exception("У этого транспорта уже есть активная заявка!")
            # Получаем пользователя и его компанию
            user = await uow.user.find_one_or_none(id=user_id)
            if not user or not user.company_id:
                raise Exception("У пользователя не указана компания!")
            # Создаём detail
            detail = await uow.detail.create({
                'seller_company_id': user.company_id,
                'client_company_id': 2,  # id компании 'Баракат'
                'material_id': data.material_id,
                'construction_id': None,
                'object_id': None,
                'cone_draft_default': None,
            })
            # Создаём заявку с detail_id
            obj = await uow.inert_material_request.create({
                **data.dict(),
                'created_by': user_id,
                'status': InertRequestStatusEnum.active,
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow(),
                'detail_id': detail.id,
            })
            await uow.commit()
            return obj.to_read_model()

    async def finish(self, uow: IUnitOfWork, request_id: int) -> InertMaterialRequestRead:
        print(f"[DEBUG] InertMaterialRequestService.finish: request_id={request_id}")
        async with uow:
            obj = await uow.inert_material_request.find_one_or_none(id=request_id)
            if not obj:
                raise Exception("Заявка не найдена")
            await uow.inert_material_request.update(request_id, {'status': InertRequestStatusEnum.finished, 'updated_at': datetime.utcnow()})
            await uow.commit()
            # Получаем свежий объект
            obj = await uow.inert_material_request.find_one_or_none(id=request_id)
            print(f"[DEBUG] После update: obj.status={getattr(obj, 'status', None)}")
            return obj.to_read_model() 