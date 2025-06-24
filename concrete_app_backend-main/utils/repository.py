import datetime
from abc import ABC, abstractmethod

from sqlalchemy import insert, select, update, delete, func, Float
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from models.weighing import Weighing


class AbstractRepository(ABC):
    @abstractmethod
    async def create(self, data: dict):
        raise NotImplementedError

    @abstractmethod
    async def get_all(self, limit, offset, **filter_by):
        raise NotImplementedError

    @abstractmethod
    async def find_one_or_none(self, **filter_by):
        raise NotImplementedError

    @abstractmethod
    async def update(self, id: int, data: dict):
        raise NotImplementedError

    @abstractmethod
    async def delete(self, id: int):
        raise NotImplementedError


class SQLAlchemyRepository(AbstractRepository):
    model = None

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, data: dict):
        stmt = insert(self.model).values(**data).returning(self.model)
        res = (await self.session.execute(stmt)).scalar_one_or_none()
        return res

    async def get_all(self, *filters, order_by=None, is_desc: bool = None, limit: int = None, offset: int = None,
                      **filter_by):
        # todo будет круто если начать передавать джойны в репозитории
        stmt = (
            select(self.model).
            filter(*filters).
            filter_by(**filter_by)
        )

        if order_by is not None:
            stmt = stmt.order_by(*order_by)

        count_stmt = select(func.count()).select_from(stmt.alias())
        count_result = await self.session.execute(count_stmt)
        total = count_result.scalar()

        stmt = stmt.limit(limit).offset(offset)
        res = await self.session.execute(stmt)

        res = [row[0].to_read_model() for row in res.all()]
        return res, total

    async def find_one_or_none(self, **filter_by):
        stmt = select(self.model).filter_by(**filter_by)
        res = (await self.session.execute(stmt)).scalars().one_or_none()
        return res

    async def update(self, id: int, data: dict):
        stmt = update(self.model).values(**data).filter_by(id=id).returning(self.model)
        res = (await self.session.execute(stmt)).scalar_one_or_none()
        return res.to_read_model()

    async def delete(self, **filter_by):
        stmt = delete(self.model).filter_by(**filter_by)
        await self.session.execute(stmt)

    async def sync_data(self, request_id: int):
        # TODO: подумать как вынести логику из репозитория, если не в репозитории, то проблемы с сессией, коммиты
        #  работают некорректно, нарушается паттерн проектирования Unit Of Work, мб просто оставить
        data = {}

        # Получить экземпляр заявки
        request = await self.find_one_or_none(id=request_id)

        query = select(
            func.sum(Weighing.cubature).cast(Float).label("realized_cubature"),
        ).select_from(Weighing).filter_by(is_finished=True, is_active=True, detail_id=request.detail_id)
        # Реализованная кубатура
        raw = await self.session.execute(query)
        realized_cubature = raw.scalar_one_or_none()
        data['realized_cubature'] = round(realized_cubature, 2) if realized_cubature else 0
        # print(f"Реализованная кубатура по подсчетам: {data['realized_cubature']}")

        query = select(
            func.sum(Weighing.cubature).cast(Float).label("loading_cubature"),
        ).select_from(Weighing).filter_by(is_finished=False, is_active=True, detail_id=request.detail_id)
        # Кубатура на погрузке
        raw = await self.session.execute(query)
        loading_cubature = raw.scalar_one_or_none()
        data['loading_cubature'] = round(loading_cubature, 2) if loading_cubature else 0
        # print(f"Погружаемая кубатура по подсчетам: {data['loading_cubature']}")

        if data['realized_cubature'] >= request.purpose_cubature * settings.COMPLETION_RATE:
            data['finished_at'] = datetime.datetime.now()
            data['is_finished'] = True
        else:
            data['finished_at'] = None
            data['is_finished'] = False
        # print(f"Сумма погружаемой и реализованной кубатуры по подсчетам: {data['realized_cubature'] + data['loading_cubature']}")
        # print(f"Целевая кубатура: {request.purpose_cubature}")
        return await self.update(request_id, data)
