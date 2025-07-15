from utils.unitofwork import IUnitOfWork
from models.inert_material_request import InertRequestStatusEnum
from models.weighing import Weighing
from models.transport import Transport
from models.detail import Detail
from datetime import datetime
import os
from openpyxl import Workbook
from openpyxl.styles import Alignment, Font

class InertMaterialWeighingService:
    async def process_weighing(self, uow: IUnitOfWork, plate_number: str, weight: int, operator_id: int):
        async with uow:
            # Найти транспорт по номеру
            transport = await uow.transport.find_one_or_none(plate_number=plate_number)
            if not transport:
                raise Exception("Транспорт с таким номером не найден")
            
            # Получить пользователя для определения его компании
            user = await uow.user.find_one_or_none(id=operator_id)
            if not user or not user.company_id:
                raise Exception("У пользователя не указана компания!")

            # --- ДОБАВЛЕНО: ищем активную заявку от поставщика по plate_number ---
            inert_request = await uow.inert_material_request.find_one_or_none(transport_id=transport.id, status=InertRequestStatusEnum.active)
            
            # Проверить, есть ли уже отвес по этой машине (НЕ по заявке!)
            weighing = await uow.weighing.find_one_or_none(transport_id=transport.id, is_depend=False, is_finished=False)
            if not weighing:
                if inert_request:
                    # Используем detail и все id из заявки
                    detail_id = inert_request.detail_id
                    seller_company_id = user.company_id
                    client_company_id = 2  # Баракат
                    material_id = inert_request.material_id
                    print(f"[DEBUG] Создаём отвес: detail_id={detail_id}, inert_request_id={inert_request.id}, transport_id={transport.id}")
                    # Первый взвес — создаём независимый отвес с detail_id и inert_request_id
                    weighing = await uow.weighing.create({
                        'transport_id': transport.id,
                        'detail_id': detail_id,
                        'tare_weight': weight,  # Только tare_weight, brutto пустой
                        'brutto_weight': None,  # Явно None, чтобы не было ошибок валидации
                        'first_at': datetime.utcnow(),
                        'first_operator_id': operator_id,
                        'is_depend': False,
                        'is_finished': False,
                        'is_active': True,
                        'inert_request_id': inert_request.id,
                    })
                else:
                    # Первый взвес — создаём detail для независимого отвеса (старое поведение)
                    detail = await uow.detail.create({
                        'seller_company_id': user.company_id,
                        'client_company_id': 2,  # id компании 'Баракат'
                        'material_id': 1,  # заглушка, можно доработать
                        'construction_id': None,
                        'object_id': None,
                        'cone_draft_default': None,
                    })
                    weighing = await uow.weighing.create({
                        'transport_id': transport.id,
                        'detail_id': detail.id,
                        'tare_weight': weight,  # Только tare_weight, brutto пустой
                        'brutto_weight': None,  # Явно None, чтобы не было ошибок валидации
                        'first_at': datetime.utcnow(),
                        'first_operator_id': operator_id,
                        'is_depend': False,
                        'is_finished': False,
                        'is_active': True,
                    })
                await uow.commit()
                return {"message": "Первый взвес (тара) записан", "weighing_id": weighing.id}
            else:
                # Второй взвес — обновляем запись, фиксируем брутто
                if weighing.brutto_weight:
                    raise Exception("Уже есть второй взвес для этой машины!")
                print(f"[DEBUG] Второй взвес: weighing_id={weighing.id}, inert_request_id={getattr(weighing, 'inert_request_id', None)}")
                weighing = await uow.weighing.update(weighing.id, {
                    'brutto_weight': weight,
                    'second_at': datetime.utcnow(),
                    'second_operator_id': operator_id,
                    'is_finished': True,
                    'inert_request_id': getattr(weighing, 'inert_request_id', None),
                })
                # Генерация накладной
                file_path = await self.generate_invoice(uow, weighing.id)
                # --- ДОБАВЛЕНО: если есть заявка и лабораторные поля заполнены, меняем статус заявки на finished ---
                if getattr(weighing, 'inert_request_id', None):
                    # Получаем актуальный отвес после обновления
                    updated_weighing = await uow.weighing.find_one_or_none(id=weighing.id)
                    if updated_weighing and updated_weighing.weediness is not None and updated_weighing.silo_number is not None:
                        from services.inert_material_request import InertMaterialRequestService
                        await InertMaterialRequestService().finish(uow, updated_weighing.inert_request_id)
                        await uow.commit()
                # --- КОНЕЦ ДОБАВЛЕНИЯ ---
                await uow.commit()
                return {
                    "message": "Второй взвес (брутто) записан, отвес завершён", 
                    "weighing_id": weighing.id, 
                    "invoice_path": file_path
                } 