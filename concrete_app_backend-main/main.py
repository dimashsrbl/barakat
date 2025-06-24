import logging
from contextlib import asynccontextmanager

import uvicorn
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles

from api.routers import api_routers
from background_tasks.delete_unattached_photo import delete_unattached_photo
from background_tasks.notification_processing import check_call_clients
# from background_tasks.cmp_task import send_production_to_cmp
from exception_handlers import validation_exception_handler
from middleware.middlewares import middleware_list
from utils.dataseed import db_data_seed
from websocket.routers import ws_routers

logger = logging.getLogger("gunicorn")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await db_data_seed()
    scheduler = AsyncIOScheduler()
    scheduler.add_job(check_call_clients, 'interval', seconds=45)
    scheduler.add_job(delete_unattached_photo, 'interval', minutes=10)
    scheduler.start()
    yield


app = FastAPI(
    title="FastAPI",
    lifespan=lifespan
)

app.mount("/media", StaticFiles(directory="media"), name="media")

# PROTECTED = [Depends(get_current_user)]
for router in api_routers:
    app.include_router(prefix='/api', router=router)

for router in ws_routers:
    app.include_router(router=router)

for middleware in middleware_list:
    app.add_middleware(BaseHTTPMiddleware, dispatch=middleware)

app.add_exception_handler(RequestValidationError, validation_exception_handler)

app.add_middleware(
    # todo: настроить корс, сейчас слишком открытый
    CORSMiddleware,
    # allow_origins=settings.CORS_ORIGINS,
    allow_origins=["*"],
    allow_credentials=True,
    # allow_methods=settings.CORS_METHODS,
    allow_methods=["*"],
    # allow_headers=settings.CORS_HEADERS,
    allow_headers=["*"],
)

if __name__ == "__main__":
    uvicorn.run(app="main:app", reload=True)
