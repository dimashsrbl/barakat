import base64
import datetime
import os
import random
from datetime import timedelta
from typing import Tuple, List, Any

from fastapi import HTTPException
from sqlalchemy import or_, and_, select
from starlette import status
from PIL import Image
from io import BytesIO

from db.db import db_helper
from exceptions import AlreadyExistException, NotFoundException
from models.detail import Detail
from models.request import Request
from models.transport import Transport
from models.weighing import Weighing
from schemas.transport import TransportSchemaAdd, TransportSchema, TransportSchemaUpdate, TransportSchemaIsActive
from utils.general_utils import get_order_by, get_media_path, validate_sort_column
from utils.unitofwork import IUnitOfWork


class TransportService:
    async def create(self, uow: IUnitOfWork, data: TransportSchemaAdd, user_id: int) -> TransportSchema:
        data_dict = data.model_dump()
        data_dict['created_by'] = user_id
        async with uow:
            result = await uow.transport.find_one_or_none(plate_number=data_dict['plate_number'])
            if result:
                if result.is_active:
                    raise AlreadyExistException("Транспорт")
                else:
                    data_dict["is_active"] = True
                    transport = await uow.transport.update(result.id, data_dict)
                    await uow.commit()
                    return transport

            carrier = None
            if data_dict['carrier_id']:
                carrier = await uow.carrier.find_one_or_none(id=data_dict['carrier_id'])
                if not carrier:
                    raise NotFoundException("Перевозчик")
                carrier = carrier.to_read_model()

            driver = None
            if data_dict['driver_id']:
                driver = await uow.driver.find_one_or_none(id=data_dict['driver_id'])
                if not driver:
                    raise NotFoundException("Водитель")
                driver = driver.to_read_model()

            result = await uow.transport.create(data_dict)
            result.carrier = carrier
            result.driver = driver
            await uow.commit()
            return result

    async def get_all(self, uow: IUnitOfWork, is_desc: bool, order_attribute: str, plate_number: str, limit: int, offset: int,
                      is_for_requests, **filter_by) -> tuple[Any, Any]:
        validate_sort_column(order_attribute, Transport)
        order_by = get_order_by([{"is_desc": is_desc, "name": order_attribute}])

        plate_number_contain_filter = True
        if plate_number:
            plate_number_contain_filter = Transport.plate_number.ilike(f'%{plate_number}%')

        if is_for_requests:
            today_start = datetime.datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
            tomorrow_start = (datetime.datetime.now().replace(hour=0, minute=0, second=0, microsecond=0) +
                              timedelta(days=1))

            date_filter = (
                or_(
                    and_(
                        Request.is_finished == False,
                        Request.purpose_start < today_start,
                        Request.is_active == True,
                    ),
                    and_(
                        Request.purpose_start >= today_start,
                        Request.purpose_start < tomorrow_start,
                        Request.is_active == True,
                    )
                )
            )

            async with db_helper.get_db_session() as session:
                stmt = (
                    select(
                        Transport
                    )
                    .distinct(Transport.id)
                    .join(Weighing, Weighing.transport_id == Transport.id)
                    .join(Detail, Detail.id == Weighing.detail_id)
                    .join(Request, Request.detail_id == Detail.id)
                    .filter(date_filter)
                )
                raw = await session.execute(stmt)
                res = [row[0].to_read_model() for row in raw.all()]
            return res, len(res)

        async with uow:
            results, total = await uow.transport.get_all(plate_number_contain_filter, order_by=order_by, limit=limit, offset=offset, **filter_by)
            for res in results:
                carrier = await uow.carrier.find_one_or_none(id=res.carrier_id)
                if carrier:
                    res.carrier = carrier.to_read_model()

                driver = await uow.driver.find_one_or_none(id=res.driver_id)
                if driver:
                    res.driver = driver.to_read_model()
            return results, total

    async def find_one_or_none(self, uow: IUnitOfWork, **filter_by) -> TransportSchema:
        async with uow:
            result = await uow.transport.find_one_or_none(**filter_by)
            if not result:
                raise NotFoundException("Транспорт")
            result = result.to_read_model()

            carrier = await uow.carrier.find_one_or_none(id=result.carrier_id)
            if carrier:
                result.carrier = carrier.to_read_model()

            driver = await uow.driver.find_one_or_none(id=result.driver_id)
            if driver:
                result.driver = driver.to_read_model()
            return result

    async def update(self, uow: IUnitOfWork, id: int, new_data: TransportSchemaUpdate) -> TransportSchema:
        updated_data = new_data.model_dump()
        async with uow:
            result = await uow.transport.find_one_or_none(id=id)
            if not result:
                raise NotFoundException("Транспорт")

            if result.to_read_model().plate_number != updated_data['plate_number']:
                result = await uow.transport.find_one_or_none(plate_number=updated_data['plate_number'])
                if result:
                    result = result.to_read_model()
                    if result.plate_number == updated_data['plate_number']:
                        raise AlreadyExistException("Транспорт")

            carrier = None
            if updated_data['carrier_id']:
                carrier = await uow.carrier.find_one_or_none(id=updated_data['carrier_id'])
                if not carrier:
                    raise NotFoundException("Перевозчик")
                carrier = carrier.to_read_model()

            driver = None
            if updated_data['driver_id']:
                driver = await uow.driver.find_one_or_none(id=updated_data['driver_id'])
                if not driver:
                    raise NotFoundException("Водитель")
                driver = driver.to_read_model()

            result = await uow.transport.update(id, updated_data)
            result.carrier = carrier
            result.driver = driver
            await uow.commit()
            return result

    async def change_is_active(self, uow: IUnitOfWork, id: int, new_data: TransportSchemaIsActive) -> TransportSchema:
        updated_data = new_data.model_dump()
        async with uow:
            result = await uow.transport.find_one_or_none(id=id)
            if not result:
                raise NotFoundException("Транспорт")

            result = await uow.transport.update(id, updated_data)
            carrier = await uow.carrier.find_one_or_none(id=result.carrier_id)
            if carrier:
                result.carrier = carrier.to_read_model()

            driver = await uow.driver.find_one_or_none(id=result.driver_id)
            if driver:
                result.driver = driver.to_read_model()

            await uow.commit()
            return result
