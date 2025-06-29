import asyncio
import json
import logging
import os
import random
from datetime import datetime

import websockets
from serial import SerialException

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
    except websockets.ConnectionClosedError:
        pass
    except websockets.ConnectionClosedOK:
        pass
    finally:
        # Удаляем клиента из списка при отключении
        connected_clients.remove(websocket)


async def broadcast_message(message):
    # Отправляем сообщение всем подключенным клиентам
    for client in connected_clients:
        try:
            await client.send(message)
        except websockets.ConnectionClosedError:
            pass
        except websockets.ConnectionClosedOK:
            pass


async def start_server():
    setup_logging()
    logging.info('Запуск симуляции весов с задержками')
    
    while True:
        async with websockets.serve(handle_websocket, "localhost", 8888):
            cycle_count = 0
            
            while True:
                cycle_count += 1
                
                # Генерируем случайный вес от 12000 до 25000
                weight = random.randint(12000, 25000)
                
                logging.info(f'Цикл {cycle_count}: отправляем вес {weight}')
                await broadcast_message(str(weight))
                
                # Определяем время задержки в зависимости от цикла
                if cycle_count <= 2:
                    # Первые 2 раза держим вес 3 секунды
                    delay = 3
                    logging.info(f'Цикл {cycle_count}: держим вес {delay} секунды')
                else:
                    # 3-й раз и далее держим вес 7 секунд
                    delay = 7
                    logging.info(f'Цикл {cycle_count}: держим вес {delay} секунд')
                
                await asyncio.sleep(delay)
                
                # Сбрасываем счётчик каждые 5 циклов для повторения паттерна
                if cycle_count >= 5:
                    cycle_count = 0
                    logging.info('Сброс цикла, начинаем заново')


if __name__ == "__main__":
    asyncio.get_event_loop().run_until_complete(start_server()) 