import asyncio
import json
import logging
import os
import random
import aiohttp
from datetime import datetime
from collections import deque
import time

import serial
import websockets
from serial import SerialException

from com_port_utils import close_ports, free_com_port

connected_clients = set()

# Глобальные переменные для автоматического взвешивания
weight_history = deque(maxlen=10)  # История весов для проверки стабильности
last_stable_weight = 0
stability_timer = 0
is_stable = False
auto_weighing_config = None

def setup_logging():
    log_dir = 'logs'
    # Создаем директорию для логов, если она не существует
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)

    # Удаляем старые файлы логов, которые не относятся к текущему дню
    today = datetime.now().strftime('%d-%m')
    for filename in os.listdir(log_dir):
        if not filename.startswith(today):
            os.remove(os.path.join(log_dir, filename))

    # Настройка логгера
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)

    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')

    file_handler = logging.FileHandler(os.path.join(log_dir, f'{today}_log.txt'))
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)

    stream_handler = logging.StreamHandler()
    stream_handler.setFormatter(formatter)
    logger.addHandler(stream_handler)


async def handle_websocket(websocket, path):
    connected_clients.add(websocket)
    try:
        async for message in websocket:
            ...
    except websockets.ConnectionClosed:
        pass
    finally:
        # Удаляем клиента из списка при отключении
        connected_clients.remove(websocket)


async def broadcast_message(message):
    # Отправляем сообщение всем подключенным клиентам
    for client in connected_clients:
        try:
            await client.send(message)
        except websockets.ConnectionClosed as cc:
            logging.info(f'Связь с вебсокетом оборвалась: {cc}')
            pass
        except Exception as e:
            logging.info(f'Произошла непредвиденная ошибка: {e}')
            pass


async def send_weight_to_api(weight: int):
    """
    Отправляет вес в API для автоматического создания отвеса
    """
    global auto_weighing_config
    
    if not auto_weighing_config or not auto_weighing_config.get('enabled', False):
        return None
        
    try:
        async with aiohttp.ClientSession() as session:
            payload = {
                "plate_number": auto_weighing_config.get('default_plate_number', 'A123BC45'),
                "weight": weight
            }
            
            api_url = auto_weighing_config.get('api_url', 'http://localhost:8000/api/inert_weighing/auto_weighing')
            
            async with session.post(api_url, json=payload) as response:
                if response.status == 200:
                    result = await response.json()
                    logging.info(f'Автоматическое взвешивание успешно: {result}')
                    return result
                else:
                    logging.error(f'Ошибка API: {response.status} - {await response.text()}')
                    return None
    except Exception as e:
        logging.error(f'Ошибка отправки в API: {e}')
        return None


async def check_weight_stability_4_5s(get_weight_func):
    STABILITY_TIME = 4.5  # секунды
    STABILITY_THRESHOLD = 50  # кг
    min_weight = auto_weighing_config.get('min_weight', 2000)

    while True:
        weights = []
        start_time = time.time()
        while time.time() - start_time < STABILITY_TIME:
            weight = get_weight_func()
            if weight is not None and weight >= min_weight:
                weights.append(weight)
            await asyncio.sleep(0.1)
        if weights:
            max_w = max(weights)
            min_w = min(weights)
            if max_w - min_w <= STABILITY_THRESHOLD:
                stable_weight = int(sum(weights) / len(weights))
                logging.info(f"Вес стабилен: {stable_weight} кг (отправляю в API)")
                await send_weight_to_api(stable_weight)
                await asyncio.sleep(5)  # чтобы не отправлять дубли подряд
            else:
                logging.info(f"Вес нестабилен: {min_w} - {max_w} кг")
        else:
            logging.info("Нет данных с индикатора")
        await asyncio.sleep(1)


async def start_server():
    global auto_weighing_config
    
    setup_logging()

    with open('data.json', 'r') as file:
        data = json.load(file)
    baudrate = data['baudrate']
    port = f"COM{data['port']}"
    auto_weighing_config = data.get('auto_weighing', {})

    logging.info('Запуск Весовой Утилиты с автоматическим взвешиванием')
    if auto_weighing_config.get('enabled', False):
        logging.info(f'Автоматическое взвешивание включено: API={auto_weighing_config.get("api_url")}')

    while True:
        try:
            logging.info('Закрытие портов используя serial...')
            close_ports()  # Попытка закрыть порты

            logging.info('Закрытие портов используя powershell...')
            free_com_port(port)
            with serial.Serial(baudrate=baudrate, port=port) as indicator:
                logging.info('Установка соединения с весовым индикатором прошла успешно')

                async with websockets.serve(handle_websocket, "localhost", 8888):
                    finalWeightValue = 0
                    def get_weight():
                        try:
                            indicator.flushInput()
                            y = indicator.in_waiting
                            if y >= 9:
                                weightValue = indicator.readline(9)
                                value = (weightValue[6] - 48) * 100000 + (weightValue[5] - 48) * 10000 + (
                                        weightValue[4] - 48) * 1000 + (
                                               weightValue[3] - 48) * 100 + (weightValue[2] - 48) * 10 + (
                                                       weightValue[1] - 48) * 1
                                if value < 0:
                                    value = value * -1
                                return value
                        except Exception:
                            return None
                    await check_weight_stability_4_5s(get_weight)
        except SerialException as se:
            connected_clients.clear()
            logging.info(f'Не удалось установить соединение или соединение с весовым индикатором оборвалось: {se}')
            await asyncio.sleep(data['connect_interval'])
            continue
        except Exception as e:
            logging.info(f'Произошла непредвиденная ошибка: {e}')
            await asyncio.sleep(data['connect_interval'])
            continue


asyncio.get_event_loop().run_until_complete(start_server())
