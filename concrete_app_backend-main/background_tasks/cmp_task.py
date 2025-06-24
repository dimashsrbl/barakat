# import datetime
# import json
# from datetime import timedelta
#
# from sqlalchemy import select
#
# from db.db import async_session_maker
# from models.company import Company
# from models.concrete_mixing_plant import ConcreteMixingPlant
# from models.construction import Construction
# from models.construction_type import ConstructionType
# from models.detail import Detail
# from models.material import Material
# from models.object import Object
# from models.receive_method import ReceiveMethod
# from models.receive_method_type import ReceiveMethodType
# from models.request import Request
# from models.transport import Transport
# from models.weighing import Weighing
# from websocket.websocket_manager import cmp_manager
#
#
# async def send_production_to_cmp():
#     async with async_session_maker() as session:
#         stmt = (
#             select(ConcreteMixingPlant)
#         )
#         raw = await session.execute(stmt)
#         cmp_names = raw.scalars().all()
#         # print(cmp_names)
#
#         now = datetime.datetime.now()
#         from_date = now - timedelta(days=1)
#
#         for cmp in cmp_names:
#             stmt = (
#                 select(Weighing)
#                 .filter_by(
#                     is_active=True,
#                     is_read_by_cmp=False,
#                     concrete_mixing_plant_id=cmp.id,
#                     is_depend=True,
#                 )
#                 .filter(
#                     Weighing.second_at.between(from_date, now)
#                 )
#             )
#             raw = await session.execute(stmt)
#             results = raw.scalars().all()
#
#             productions = []
#             for result in results:
#                 stmt = select(Detail).filter_by(id=result.detail_id)
#                 raw = await session.execute(stmt)
#                 detail = raw.scalar_one_or_none()
#
#                 stmt = select(Material).filter_by(id=detail.material_id)
#                 raw = await session.execute(stmt)
#                 material = raw.scalar_one_or_none()
#                 material_name = material.name.split('-')
#                 receipt = material_name[0]
#
#                 stmt = select(Construction).filter_by(id=result.construction_id)
#                 raw = await session.execute(stmt)
#                 construction = raw.scalar_one_or_none()
#
#                 stmt = select(ConstructionType).filter_by(id=construction.construction_type_id)
#                 raw = await session.execute(stmt)
#                 construction_type = raw.scalar_one_or_none()
#
#                 if construction_type.key_name:
#                     receipt += f"-{construction_type.key_name}"
#
#                 stmt = select(Object).filter_by(id=detail.object_id)
#                 raw = await session.execute(stmt)
#                 object = raw.scalar_one_or_none()
#
#                 stmt = select(Request).filter_by(detail_id=detail.id)
#                 raw = await session.execute(stmt)
#                 request = raw.scalar_one_or_none()
#
#                 stmt = select(ReceiveMethod).filter_by(id=request.receive_method_id)
#                 raw = await session.execute(stmt)
#                 receive_method = raw.scalar_one_or_none()
#
#                 stmt = select(ReceiveMethodType).filter_by(id=receive_method.receive_method_type_id)
#                 raw = await session.execute(stmt)
#                 receive_method_type = raw.scalar_one_or_none()
#
#                 if receive_method_type.key_name:
#                     receipt += f"-{receive_method_type.key_name}"
#
#                 if 'СС' in material_name:
#                     receipt += f"-СС"
#
#                 stmt = select(Company).filter_by(id=detail.client_company_id)
#                 raw = await session.execute(stmt)
#                 client_company = raw.scalar_one_or_none()
#
#                 construction_site = f"{client_company.company_type.value} {client_company.name}"
#                 if object:
#                     construction_site += f" ({object.name})"
#
#                 stmt = select(Transport).filter_by(id=result.transport_id)
#                 raw = await session.execute(stmt)
#                 transport = raw.scalar_one_or_none()
#
#                 production_add_data = {
#                     'receipt': receipt,
#                     'construction_site': construction_site,
#                     'plate_number': transport.plate_number,
#                     'cone_draft': result.cone_draft,
#                     'cubature': result.cubature,
#                 }
#                 productions.append(production_add_data)
#
#             print(f"{cmp.name}: {productions}")
#
#             data_to_broadcast = {
#                 'cmp': cmp.name,
#                 'action': 1,
#                 'productions': productions
#             }
#             await cmp_manager.broadcast(json.dumps(data_to_broadcast))
#             # await websocket.