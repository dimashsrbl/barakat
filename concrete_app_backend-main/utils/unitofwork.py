from abc import abstractmethod, ABC
from typing import Type

from db.db import db_helper
from repositories.carrier import CarrierRepository
from repositories.company import CompanyRepository
from repositories.concrete_mixing_plant import ConcreteMixingPlantRepository
from repositories.construction import ConstructionRepository
from repositories.construction_type import ConstructionTypeRepository
from repositories.detail import DetailRepository
from repositories.driver import DriverRepository
# from repositories.discrete_output_module import DiscreteOutputModuleRepository
from repositories.material import MaterialRepository
from repositories.material_type import MaterialTypeRepository
from repositories.material_type_object import MaterialTypeObjectRepository
# from repositories.material_object import MaterialObjectRepository
from repositories.object import ObjectRepository
from repositories.permission import PermissionRepository
from repositories.photo import PhotoRepository
from repositories.receive_method import ReceiveMethodRepository
from repositories.receive_method_type import ReceiveMethodTypeRepository
from repositories.request import RequestRepository
from repositories.role import RoleRepository
from repositories.role_permission import RolePermissionRepository
from repositories.transport import TransportRepository
from repositories.user import UserRepository
# from repositories.video_camera import VideoCameraRepository
from repositories.weighing import WeighingRepository
from repositories.inert_material_request import InertMaterialRequestRepository


# from repositories.weight_indicator import WeightIndicatorRepository


class IUnitOfWork(ABC):
    carrier: Type[CarrierRepository]
    company: Type[CompanyRepository]
    concrete_mixing_plant: Type[ConcreteMixingPlantRepository]
    construction: Type[ConstructionRepository]
    construction_type: Type[ConstructionTypeRepository]
    driver: Type[DriverRepository]
    detail: Type[DetailRepository]
    # discrete_output_module: Type[DiscreteOutputModuleRepository]
    material: Type[MaterialRepository]
    material_type: Type[MaterialTypeRepository]
    material_type_object: Type[MaterialTypeObjectRepository]
    object: Type[ObjectRepository]
    permission: Type[PermissionRepository]
    receive_method: Type[ReceiveMethodRepository]
    receive_method_type: Type[ReceiveMethodTypeRepository]
    request: Type[RequestRepository]
    role: Type[RoleRepository]
    role_permission: Type[RolePermissionRepository]
    transport: Type[TransportRepository]
    user: Type[UserRepository]
    # user: Type[UserRepository]
    # video_camera: Type[VideoCameraRepository]
    weighing: Type[WeighingRepository]
    photo: Type[PhotoRepository]
    inert_material_request: Type[InertMaterialRequestRepository]
    # weight_indicator: Type[WeightIndicatorRepository]

    @abstractmethod
    def __init__(self):
        ...

    @abstractmethod
    async def __aenter__(self):
        ...

    @abstractmethod
    async def __aexit__(self, *args):
        ...

    @abstractmethod
    async def commit(self):
        ...

    @abstractmethod
    async def rollback(self):
        ...


class UnitOfWork:
    def __init__(self):
        # self.session_factory = db_helper.get_db_session
        self.get_db_session = db_helper.get_db_session

    async def __aenter__(self):
        self.ctx = self.get_db_session()
        self.session = await self.ctx.__aenter__()
        self.carrier = CarrierRepository(self.session)
        self.company = CompanyRepository(self.session)
        self.concrete_mixing_plant = ConcreteMixingPlantRepository(self.session)
        self.construction = ConstructionRepository(self.session)
        self.construction_type = ConstructionTypeRepository(self.session)
        self.driver = DriverRepository(self.session)
        self.detail = DetailRepository(self.session)
        # self.discrete_output_module = DiscreteOutputModuleRepository(self.session)
        self.material = MaterialRepository(self.session)
        self.material_type = MaterialTypeRepository(self.session)
        self.material_type_object = MaterialTypeObjectRepository(self.session)
        self.object = ObjectRepository(self.session)
        self.permission = PermissionRepository(self.session)
        self.receive_method = ReceiveMethodRepository(self.session)
        self.receive_method_type = ReceiveMethodTypeRepository(self.session)
        self.request = RequestRepository(self.session)
        self.role = RoleRepository(self.session)
        self.role_permission = RolePermissionRepository(self.session)
        self.transport = TransportRepository(self.session)
        self.user = UserRepository(self.session)
        # self.video_camera = VideoCameraRepository(self.session)
        self.weighing = WeighingRepository(self.session)
        self.photo = PhotoRepository(self.session)
        self.inert_material_request = InertMaterialRequestRepository(self.session)
        # self.weight_indicator = WeightIndicatorRepository(self.session)
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        try:
            if exc_type is not None:
                await self.rollback()
            await self.ctx.__aexit__(exc_type, exc_val, exc_tb)
        except Exception:
            pass

    async def commit(self):
        await self.session.commit()

    async def rollback(self):
        await self.session.rollback()
