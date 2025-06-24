import base64
import io
from typing import Any

from fastapi import UploadFile

from exceptions import NotFoundException, BadRequestException
from models.photo import Photo
from schemas.photo import PhotoSchemaAdd, PhotoSchema
from utils.general_utils import get_order_by, save_file_and_get_filename, validate_sort_column
from utils.unitofwork import IUnitOfWork


class PhotoService:
    async def create(self, uow: IUnitOfWork, data: PhotoSchemaAdd) -> PhotoSchema:
        data_dict = data.model_dump()
        async with uow:
            data_dict['filename'] = save_file_and_get_filename(data_dict.pop('photo_bytes'))
            data_dict['is_attached'] = False

            result = await uow.photo.create(data_dict)
            await uow.commit()
            return result

    async def upload(self, uow: IUnitOfWork, file: UploadFile) -> PhotoSchema:
        if file.content_type != "image/png":
            raise BadRequestException(f"Необходимо загрузить изображение формата png или jpg (jpeg). Ваш формат: '{file.content_type}'")
        content = await file.read()
        base64_string = base64.b64encode(content).decode('utf-8')
        async with uow:
            data_dict = {
                'filename': save_file_and_get_filename(base64_string),
                'is_attached': False
            }
            result = await uow.photo.create(data_dict)
            await uow.commit()
            return result

    async def get_all(self, uow: IUnitOfWork, is_desc: bool, order_attribute: str, limit: int, offset: int,
                      **filter_by) -> tuple[Any, Any]:
        validate_sort_column(order_attribute, Photo)
        order_by = get_order_by([{"is_desc": is_desc, "name": order_attribute}])

        async with uow:
            results, total = await uow.photo.get_all(order_by=order_by, limit=limit, offset=offset, **filter_by)
            return results, total

    async def find_one_or_none(self, uow: IUnitOfWork, **filter_by) -> PhotoSchema:
        async with uow:
            result = await uow.photo.find_one_or_none(**filter_by)
            if not result:
                raise NotFoundException("Фото")
            result = result.to_read_model()
            return result

    async def update(self, uow: IUnitOfWork, id: int, new_data: dict) -> PhotoSchema:
        async with uow:
            result = await uow.photo.update(id, new_data)
            await uow.commit()
            return result

    # async def delete(self, uow: IUnitOfWork, id: int) -> bool:
    #     async with uow:
    #         photo_to_delete = await uow.photo.find_one_or_none(id=id)
    #         if not photo_to_delete:
    #             raise NotFoundException("Фото")
    #
    #         is_deleted = delete_file(photo_to_delete.filename)
    #         await uow.photo.delete(id=id)
    #         await uow.commit()
    #         return is_deleted
