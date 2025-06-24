from typing import Optional

from fastapi import APIRouter, Depends, UploadFile, File

from api.dependencies import UOWDep, get_current_user
from config import settings
from models.user import User
from schemas.photo import PhotoSchemaAdd, PhotoSchema
from services.photo import PhotoService
from utils.response_formatting import format_response

router = APIRouter(
    prefix="/photo",
    tags=["Фото"],
)


@router.post("/create", description='Создать новое фото')
async def create_photo(
        photo: PhotoSchemaAdd,
        uow: UOWDep,
        # current_user: User = Depends(get_current_user),
) -> dict:
    photo = await PhotoService().create(uow, photo)
    return format_response(photo)


@router.post("/upload", description='Загрузить новое фото')
async def create_photo(
        uow: UOWDep,
        file: UploadFile = File(...),
        # current_user: User = Depends(get_current_user),
) -> dict:
    photo = await PhotoService().upload(uow, file)
    return format_response(photo)


@router.get("/get", description='Получить все значения')
async def get_all_photos(
        uow: UOWDep,
        limit: int = settings.DEFAULT_PHOTO_COUNT,
        offset: int = None,
        is_attached: bool = False,
        is_desc: bool = True,
        order_attribute: Optional[str] = "id",
        current_user: User = Depends(get_current_user),
) -> dict:
    photos, total = await PhotoService().get_all(uow, is_desc, order_attribute, limit, offset, is_attached=is_attached)
    return format_response(photos, total)


@router.get(path="/get/{photo_id}", description='Получить значение по id')
async def get_photo_by_id(
        uow: UOWDep, photo_id: int,
        current_user: User = Depends(get_current_user),
) -> dict:
    photo = await PhotoService().find_one_or_none(uow, id=photo_id)
    return format_response(photo)


# @router.put(path="/update/{photo_id}", description='Обновить значение')
# async def update_photo_by_id(
#         uow: UOWDep,
#         photo_id: int,
#         photo_update: PhotoSchemaUpdate,
#         current_user: User = Depends(get_current_user),
# ) -> dict:
#     photo = await PhotoService().update(uow, photo_id, photo_update)
#     return format_response(photo)
#
#
@router.delete(path="/delete/{photo_id}", description='Удаление фото из бд и из сервера')
async def delete_photo(
        uow: UOWDep,
        photo_id: int,
        current_user: User = Depends(get_current_user),
) -> dict:
    photo = await PhotoService().delete(uow, photo_id)
    return format_response(photo)
