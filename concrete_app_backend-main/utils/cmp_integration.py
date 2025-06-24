import asyncio

import aiohttp
from pydantic import BaseModel
from sqlalchemy import select

from db.db import db_helper
from models.construction_type import ConstructionType
from models.material import Material
from models.receive_method import ReceiveMethod
from models.receive_method_type import ReceiveMethodType
from utils.general_utils import get_data_from_json


class ProductionSchemaAdd(BaseModel):
    receipt: str
    construction_site: str  # santiye
    plate_number: str

    cone_draft: str  # driver (surucu)
    cubature: float


async def process_recipe(material_id: int, construction_type_id: int = None, receive_method_id: int = None):
    async with db_helper.get_db_session() as session:
        stmt = select(Material.name).filter_by(id=material_id)
        raw = await session.execute(stmt)
        material_name = raw.scalars().one_or_none()

        if construction_type_id:
            stmt = select(ConstructionType.key_name).filter_by(id=construction_type_id)
            raw = await session.execute(stmt)
            construction_type = raw.scalars().one_or_none()
        else:
            construction_type = None

        if receive_method_id:
            stmt = select(ReceiveMethod.receive_method_type_id).filter_by(id=receive_method_id)
            raw = await session.execute(stmt)
            receive_method_type_id = raw.scalars().one_or_none()

            if receive_method_type_id:
                stmt = select(ReceiveMethodType.key_name).filter_by(id=receive_method_type_id)
                raw = await session.execute(stmt)
                receive_method_type = raw.scalars().one_or_none()
            else:
                receive_method_type = None


        else:
            receive_method_type = None

        material_class = ""
        if "(" in material_name and ")" in material_name:
            material_class = material_name[:material_name.find("(")]
            material_name = material_name[material_name.find("(") + 1:material_name.find(")")]

        material_lst = material_name.split("-")

        independent_of_the_construction_materials = get_data_from_json("exceptional_materials.json", "independent_of_the_construction")
        for material in independent_of_the_construction_materials:
            if material_name == material['material_name']:
                if construction_type not in material['construction_type_key_names']:
                    construction_type = None
                receive_method_type = None

        independent_of_the_receive_method_materials = get_data_from_json("exceptional_materials.json", "independent_of_the_receive_method")
        for material in independent_of_the_receive_method_materials:
            if material_name == material['material_name']:
                if construction_type == material['construction_type_key_name']:
                    if receive_method_type in material['receive_method_type_key_names']:
                        receive_method_type = material['receive_method_type_value']

        if construction_type:
            material_lst.extend([construction_type])
        if receive_method_type:
            material_lst.extend([receive_method_type])

        if "СС" in material_lst:
            material_lst.remove("СС")
            is_sulfate_resistant = True
        else:
            is_sulfate_resistant = False

        if is_sulfate_resistant:
            material_lst.append("СС")

        receipt = "-".join(material_lst)
        # if material_class:
        #     receipt = f"{material_class}({receipt})"
        return receipt


async def create_new_production(production_add_data: dict, cmp_ip_address):
    try:
        async with aiohttp.ClientSession(cmp_ip_address) as session:
            async with session.post(url='/create_new_production',
                                    json=production_add_data, timeout=1) as response:
                if await response.json():
                    return True
    except Exception:
        return False


async def get_data_for_materials_report(cmp_ip_address, date_data):
    address = f"http://{cmp_ip_address}:8001"
    try:
        async with aiohttp.ClientSession(address) as session:
            async with session.post(url='/get_data_for_dependent_by_materials_invoice',
                                    params=date_data, timeout=0.5) as response:
                return await response.json()
    except asyncio.exceptions.TimeoutError:
        return None
