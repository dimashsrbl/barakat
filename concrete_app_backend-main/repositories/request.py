from sqlalchemy import select, func, Float

from models.request import Request
from models.weighing import Weighing
from utils.repository import SQLAlchemyRepository


class RequestRepository(SQLAlchemyRepository):
    model = Request

    # @classmethod
    # async def sync_data(self, uow, request_id):
    #     request = await uow.request.get_by_id(request_id)
    #     weighings = await uow.weighing.get_all(detail_id=request.detail_id)
    #     query = select(
    #         func.sum(Weighing.cubature).cast(Float).label("realized_cubature"),
    #     ).select_from(Weighing).filter_by(is_finished=True)
    #     realized_cubature = self.session.execute(query)
    #     res = [row[0].to_read_model() for row in realized_cubature.all()]
    #     print(res)
        # realized_cubature = Weighing.query.with_entities(
        #     func.sum(MyModel.MyColumn).label("mySum")
        # ).filter_by(
        #     MyValue=some_value
        # ).first()
        # realized_cubature = select(Weighing)
