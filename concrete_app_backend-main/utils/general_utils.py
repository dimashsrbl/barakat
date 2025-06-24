import base64
import datetime
import json
import os
import random
from io import BytesIO

import aiohttp
from PIL import Image
from sqlalchemy import text, inspect

from config import settings
from exceptions import BadRequestException
from schemas.request import RequestSchema


def get_data_from_json(filename: str, key: str):
    file_path = f"app_configs/{filename}"
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            data = json.load(file)
            return data.get(key)
    except FileNotFoundError:
        print(f"Файл '{file_path}' не найден.")
        return None
    except json.JSONDecodeError:
        print(f"Ошибка декодирования JSON данных из файла '{file_path}'.")
        return None


def validate_sort_column(attribute: str, table):
    columns = [column.name for column in inspect(table).c]
    if attribute not in columns:
        raise BadRequestException("Указан неверный атрибут для сортировки")
    return True


def get_order_by(attributes: list[dict]):
    order_by = []
    for attribute in attributes:
        if attribute['is_desc']:
            sort_order = 'desc'
        else:
            sort_order = 'asc'
        order_by.append(text(f"{attribute['name']} {sort_order}"))
    return order_by


def request_will_be_finished(request: RequestSchema, new_weighing_cubature, old_cubature=0):
    if request.realized_cubature + request.loading_cubature + new_weighing_cubature - old_cubature > request.purpose_cubature:
        return True
    return False


def request_finished(request: RequestSchema):
    if request.realized_cubature + request.loading_cubature >= request.purpose_cubature * settings.COMPLETION_RATE:
        return True
    return False


def get_media_path():
    current_directory = os.getcwd()
    media_package = os.path.join(current_directory, "media")
    return media_package


def save_file_and_get_filename(image_base64: str, file_format: str = "png") -> str:
    now = datetime.datetime.now()

    media_package = get_media_path()

    rand = random.randint(1, 999999)
    filename = f"{now.hour}-{now.minute}_{now.day}-{now.month}-{now.year}_{rand}.{file_format}"
    filepath = os.path.join(media_package, filename)

    decoded_photo = base64.b64decode(image_base64)
    image = Image.open(BytesIO(decoded_photo))
    image.save(filepath)
    return filename


def delete_file(filename: str) -> bool:
    try:
        media_package = get_media_path()
        filepath = os.path.join(media_package, filename)
        os.remove(filepath)
        return True
    except Exception:
        return False


async def send_to_telegram(chat_id: str, message: str) -> bool:
    token = settings.BOT_TOKEN
    url = f"https://api.telegram.org"
    text = message.replace('\n', '%0A')
    try:
        async with aiohttp.ClientSession(url) as session:
            async with session.get(url=f"/bot{token}/sendMessage?chat_id={chat_id}&text={text}") as response:
                result = await response.json()
                if result['ok']:
                    return True
                else:
                    return False
    except Exception:
        return False
