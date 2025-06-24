import asyncio
import json
import logging
import os
from datetime import datetime

import websockets

from indicators.drivers import driver_dict

connected_clients = set()


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
    # except websockets.ConnectionClosedOK:
    #     pass
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


async def start_server():
    setup_logging()

    with open('data.json', 'r') as file:
        data = json.load(file)
    baudrate = data['baudrate']
    port = f"COM{data['port']}"
    connect_interval = data['connect_interval']
    driver = data['driver']
    """logging.info('Закрытие портов используя serial...')
    close_ports()  # Попытка закрыть порты

    logging.info('Закрытие портов используя powershell...')
    free_com_port(port)"""

    logging.info('Запуск Весовой Утилиты')

    WeightIndicator = driver_dict[driver]
    indicator = WeightIndicator(baudrate=baudrate, port=port, connect_interval=connect_interval)
    indicator.start()
    while True:
        try:
            async with websockets.serve(handle_websocket, "localhost", 8888):
                while True:
                    await broadcast_message(indicator.actual_weight_value)
                    await asyncio.sleep(0.5)
        except Exception as e:
            logging.info(f'Произошла непредвиденная ошибка: {e}')
            await asyncio.sleep(1)
            continue


asyncio.get_event_loop().run_until_complete(start_server())
