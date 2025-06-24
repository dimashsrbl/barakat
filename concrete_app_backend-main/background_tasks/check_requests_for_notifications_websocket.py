# import datetime
#
# from sqlalchemy import select, or_, and_, desc
#
# from config import settings
# from db.db import AsyncScopedSession
# from models.request import Request
# from models.weighing import Weighing
# from schemas.request import NotificationStatusEnum
# from utils.general_utils import request_finished
# from websocket.websocket_manager import notifications_manager
#
#
# async def check_call_clients():
#     async_session = AsyncScopedSession()
#
#     try:
#         async with async_session as session:
#             today_start = datetime.datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
#             tomorrow_start = (datetime.datetime.now().replace(hour=0, minute=0, second=0, microsecond=0) +
#                               datetime.timedelta(days=1))
#
#             date_filter = (
#                 or_(
#                     and_(
#                         Request.is_finished == False,
#                         Request.purpose_start < today_start
#                     ),
#                     and_(
#                         Request.purpose_start >= today_start,
#                         Request.purpose_start < tomorrow_start,
#                     )
#                 )
#             )
#             stmt = (
#                 select(Request).
#                 filter(date_filter).
#                 filter_by(is_active=True)
#             )
#             raw = await session.execute(stmt)
#             requests = raw.scalars().all()
#             now = datetime.datetime.now()
#
#             call = False
#             abs = False
#
#             for request in requests:
#                 if request.is_finished == True or request.is_active == False:
#                     continue
#
#                 # call check
#                 if call != True:
#                     if request.purpose_start - now <= datetime.timedelta(
#                             minutes=settings.HOW_MUCH_EARLIER_CALL) and request.is_call != NotificationStatusEnum.read:
#                         call = True
#
#                 # abs check
#                 if abs != True:
#                     stmt = (
#                         select(
#                             Weighing.first_at
#                         ).
#                         filter_by(
#                             detail_id=request.detail_id,
#                             is_active=True,
#                         ).
#                         order_by(
#                             desc("id")
#                         ).limit(1)
#                     )
#                     raw = await session.execute(stmt)
#                     last_weighing_date = raw.scalar_one_or_none()
#
#                     if not last_weighing_date or request_finished(request):
#                         continue
#
#                     notify_interval = request.interval - settings.HOW_MUCH_EARLIER_ABS
#                     on_abs_time = last_weighing_date + datetime.timedelta(minutes=notify_interval)
#
#                     if on_abs_time <= now:
#                         abs = True
#
#             if call or abs:
#                 await notifications_manager.broadcast("Проверьте \"Журнал заявок\"")
#     except Exception as e:
#         print(e)
#     finally:
#         await AsyncScopedSession.remove()
