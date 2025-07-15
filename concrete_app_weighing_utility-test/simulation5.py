import asyncio
import logging
import os
import random
from datetime import datetime

import websockets

connected_clients = set()

def setup_logging():
    log_dir = 'logs'
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)
    today = datetime.now().strftime('%d-%m')
    for filename in os.listdir(log_dir):
        if not filename.startswith(today):
            os.remove(os.path.join(log_dir, filename))
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
    logging.info('connection open')
    try:
        async for message in websocket:
            pass
    except websockets.ConnectionClosedError:
        pass
    except websockets.ConnectionClosedOK:
        pass
    finally:
        connected_clients.remove(websocket)
        logging.info('connection closed')

async def broadcast_message(message):
    for client in connected_clients:
        try:
            await client.send(message)
        except websockets.ConnectionClosedError:
            pass
        except websockets.ConnectionClosedOK:
            pass

async def weight_generator():
    weight = 12000
    while True:
        logging.info(f'Тест: отправляем стабильный вес {weight} (20 сек)')
        for _ in range(20):  # отправляем один и тот же вес 20 секунд подряд
            await broadcast_message(str(weight))
            await asyncio.sleep(1)
        weight += 500
        if weight > 25000:
            weight = 12000


async def start_server():
    setup_logging()
    logging.info('Запуск симуляции стабильных весов (20 сек каждый, +500 кг)')
    
    # Запускаем WebSocket сервер
    server = await websockets.serve(handle_websocket, "localhost", 8888)
    
    # Запускаем генератор весов
    await weight_generator()

if __name__ == "__main__":
    asyncio.run(start_server())