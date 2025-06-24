import datetime
from datetime import timedelta
from typing import Any

from sqlalchemy import select, func

from config import settings
from db.db import db_helper
from exceptions import NotFoundException
from models.concrete_mixing_plant import ConcreteMixingPlant
from models.detail import Detail
from models.object import Object
from models.request import Request
from models.transport import Transport
from models.weighing import Weighing
from schemas.concrete_mixing_plant import ConcreteMixingPlantSchemaAdd, ConcreteMixingPlantSchema, \
    ConcreteMixingPlantSchemaUpdate, ConcreteMixingPlantSchemaIsActive
from utils.general_utils import get_order_by, validate_sort_column
from utils.unitofwork import IUnitOfWork


class ConcreteMixingPlantService:
    async def create(self, uow: IUnitOfWork, data: ConcreteMixingPlantSchemaAdd) -> ConcreteMixingPlantSchema:
        data_dict = data.model_dump()
        async with uow:
            result = await uow.concrete_mixing_plant.create(data_dict)
            await uow.commit()
            return result

    async def get_all(self, uow: IUnitOfWork, is_desc: bool, order_attribute: str, limit: int, offset: int,
                      **filter_by) -> tuple[Any, Any]:
        validate_sort_column(order_attribute, ConcreteMixingPlant)
        order_by = get_order_by([{"is_desc": is_desc, "name": order_attribute}])

        async with uow:
            results, total = await uow.concrete_mixing_plant.get_all(order_by=order_by, limit=limit, offset=offset,
                                                                     **filter_by)
            return results, total

    async def get_all_cmp_statistics(self, uow: IUnitOfWork) -> tuple[Any, Any]:
        result = []

        now = datetime.datetime.now()
        from_date = now - timedelta(hours=settings.GET_CMP_STATISTIC_FOR_THE_LAST_N_HOURS)
        date_filter = Weighing.second_at.between(from_date, now)

        async with db_helper.get_db_session() as session:
            stmt = select(ConcreteMixingPlant).order_by("id")
            raw = await session.execute(stmt)
            cmps = raw.scalars().all()

            stmt = select(func.count(ConcreteMixingPlant.id))
            raw = await session.execute(stmt)
            total = raw.scalar()

            for cmp in cmps:
                statistics = []
                stmt = (
                    select(Weighing).filter(date_filter, Request.is_active == True)
                    .filter_by(
                        concrete_mixing_plant_id=cmp.id,
                        is_finished=False,
                        is_depend=True,
                        is_active=True)
                    .join(
                        Request, Request.detail_id == Weighing.detail_id
                    )
                )
                raw = await session.execute(stmt)
                weighings = raw.scalars().all()

                for weighing in weighings:
                    statistic = {}

                    statistic['cubature'] = weighing.cubature
                    statistic['first_at'] = weighing.first_at

                    # transport = await uow.transport.find_one_or_none(id=weighing.transport_id)
                    stmt = select(Transport).filter_by(id=weighing.transport_id)
                    raw = await session.execute(stmt)
                    transport = raw.scalars().one_or_none()
                    statistic['plate_number'] = transport.plate_number

                    # detail = await uow.detail.find_one_or_none(id=weighing.detail_id)
                    stmt = select(Detail).filter_by(id=weighing.detail_id)
                    raw = await session.execute(stmt)
                    detail = raw.scalars().one_or_none()

                    # object = await uow.object.find_one_or_none(id=detail.object_id)
                    stmt = select(Object).filter_by(id=detail.object_id)
                    raw = await session.execute(stmt)
                    object = raw.scalars().one_or_none()
                    if object:
                        statistic['object_name'] = object.name

                    statistics.append(statistic)

                data = {
                    "concrete_mixing_plant": cmp,
                    "statistics": statistics,
                    "total": len(weighings)
                }
                result.append(data)
            return result, total

    async def find_one_or_none(self, uow: IUnitOfWork, id: int) -> ConcreteMixingPlantSchema:
        async with uow:
            result = await uow.concrete_mixing_plant.find_one_or_none(id=id)
            if not result:
                raise NotFoundException("БСУ")
            result = result.to_read_model()
            return result

    async def update(self, uow: IUnitOfWork, id: int,
                     new_data: ConcreteMixingPlantSchemaUpdate) -> ConcreteMixingPlantSchema:
        updated_data = new_data.model_dump()
        async with uow:
            result = await uow.concrete_mixing_plant.update(id, updated_data)
            await uow.commit()
            return result

    async def change_is_active(self, uow, id: int,
                               new_data: ConcreteMixingPlantSchemaIsActive) -> ConcreteMixingPlantSchema:
        updated_data = new_data.model_dump()
        async with uow:
            result = await uow.concrete_mixing_plant.update(id, updated_data)
            await uow.commit()
            return result
