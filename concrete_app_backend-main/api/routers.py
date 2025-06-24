from api.role import router as role_router
from api.carrier import router as carrier_router
from api.company import router as company_router
from api.concrete_mixing_plant import router as cmp_router
from api.construction import router as construction_router
from api.construction_type import router as construction_type_router
from api.cv_assist import router as cv_assist_router
from api.driver import router as driver_router
from api.material import router as material_router
from api.material_type import router as material_type_router
from api.object import router as object_router
from api.photo import router as photo_router
from api.receive_method import router as receive_method_router
from api.receive_method_type import router as receive_method_type_router
from api.request import router as request_router
from api.transport import router as transport_router
from api.user import auth_router, user_router
from api.weighing import router as weighing_router
from api.report import router as report_router
api_routers = [
    auth_router,
    user_router,
    role_router,
    # permission_router,
    carrier_router,
    company_router,
    cmp_router,
    construction_router,
    construction_type_router,
    cv_assist_router,
    driver_router,
    # detail_router,
    # dom_router,
    material_router,
    material_type_router,
    object_router,
    photo_router,
    receive_method_router,
    receive_method_type_router,
    request_router,
    transport_router,
    # video_camera_router,
    weighing_router,
    # weight_indicator_router,
    report_router,
]
