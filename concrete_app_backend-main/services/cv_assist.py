import datetime
from datetime import timedelta

from models.transport import Transport
from models.weighing import Weighing
from schemas.cv_assist import CVAssistPlateNumberSchema
from utils.general_utils import get_order_by
from utils.unitofwork import IUnitOfWork


class CVAssistService:
    async def plate_number_assist(self, uow: IUnitOfWork, cv_assist_data: CVAssistPlateNumberSchema):
        data_dict = cv_assist_data.model_dump()
        async with uow:
            result, _ = await uow.transport.get_all(Transport.plate_number.like(f"%{data_dict['plate_number']}%"))
            if not result:
                return None

            transport = result[0]
            if transport.driver_id:
                driver = (await uow.driver.find_one_or_none(id=transport.driver_id)).to_read_model()
            else:
                driver = None

            order_by = get_order_by([{"is_desc": True, "name": "first_at"}])

            current_time = datetime.datetime.now()
            from_time = current_time - timedelta(hours=6)
            time_filter = Weighing.first_at.between(from_time, current_time)

            weighing, _ = await uow.weighing.get_all(time_filter, order_by=order_by, is_finished=False, is_active=True,
                                                     transport_id=transport.id)

            weighing_id = None
            is_depend = None
            request_id = None

            if weighing:
                weighing = weighing[0]
                weighing_id = weighing.id
                is_depend = weighing.is_depend

                if weighing.is_depend == True:
                    request = await uow.request.find_one_or_none(detail_id=weighing.detail_id)
                    if request:
                        request_id = request.id

            return {
                'weighing_id': weighing_id,
                'is_depend': is_depend,
                'request_id': request_id,
                'transport': transport,
                'driver': driver,
            }
