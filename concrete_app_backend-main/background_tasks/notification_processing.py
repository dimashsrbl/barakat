import datetime
from datetime import timedelta

from sqlalchemy import select, or_, and_, desc, update, exc

from config import settings
from db.db import db_helper
from models.detail import Detail
from models.request import Request
from models.weighing import Weighing
from schemas.request import NotificationStatusEnum
from utils.general_utils import request_finished


async def check_call_clients():
    try:
        session = db_helper.get_scope_session()

        today_start = datetime.datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        tomorrow_start = (datetime.datetime.now().replace(hour=0, minute=0, second=0, microsecond=0) +
                          datetime.timedelta(days=1))

        date_filter = (
            or_(
                and_(
                    Request.is_finished == False,
                    Request.purpose_start < today_start
                ),
                and_(
                    Request.purpose_start >= today_start,
                    Request.purpose_start < tomorrow_start,
                )
            )
        )
        stmt = (
            select(Request).
            filter(date_filter).
            filter_by(is_active=True)
        )
        raw = await session.execute(stmt)
        requests = raw.scalars().all()
        now = datetime.datetime.now()

        for request in requests:
            if request.by_call:
                continue
            if request.is_finished == False and request.is_active == True:
                if request.purpose_start - now <= datetime.timedelta(
                        minutes=settings.HOW_MUCH_EARLIER_CALL) and request.is_call != NotificationStatusEnum.read:
                    stmt = update(Request).filter_by(id=request.id).values(is_call=NotificationStatusEnum.not_read)
                    await session.execute(stmt)
                    await session.commit()

                # Abs notification block
                stmt = (
                    select(Weighing)
                    .filter(Detail.id == request.detail_id)
                    .join(Detail, Weighing.detail_id == Detail.id)
                    .order_by(desc('id'))
                    .limit(1)
                )
                raw = await session.execute(stmt)
                last_weighing = raw.scalar_one_or_none()

                if not last_weighing or request_finished(request):
                    continue

                notify_interval = request.interval - settings.HOW_MUCH_EARLIER_ABS
                on_abs_time = last_weighing.first_at + timedelta(minutes=notify_interval)

                if on_abs_time <= now:
                    stmt = update(Request).filter_by(id=request.id).values(is_abs=NotificationStatusEnum.not_read)
                    await session.execute(stmt)
                    await session.commit()
            else:
                stmt = update(Request).filter_by(id=request.id).values(is_call=NotificationStatusEnum.read,
                                                                       is_abs=NotificationStatusEnum.read)

                await session.execute(stmt)
                await session.commit()
    except exc.SQLAlchemyError as error:
        await session.rollback()
        raise
    finally:
        await session.close()
