import asyncio
import json
import logging
import os
import random
from datetime import datetime

import serial
import websockets
from serial import SerialException

from com_port_utils import close_ports, free_com_port

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

    """logging.info('Закрытие портов используя serial...')
    close_ports()  # Попытка закрыть порты

    logging.info('Закрытие портов используя powershell...')
    free_com_port(port)"""

    logging.info('Запуск Весовой Утилиты')

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
                    while True:
                        # rand_value = str(random.randint(1, 10))
                        # print(rand_value)
                        # await asyncio.sleep(1)
                        # await broadcast_message(rand_value)
                        if not indicator:
                            await broadcast_message("-1")
                            raise SerialException

                        indicator.flushInput()
                        await asyncio.sleep(0.35)
                        try:
                            y = indicator.in_waiting
                        except:
                            await broadcast_message("-1")
                            logging.info('Индикатор не подключен: нет очереди')
                            # code -1 - 'Индикатор не подключен: нет очереди'
                        if y >= 9:
                            weightValue = indicator.readline(9)
                            finalWeightValue = (weightValue[6] - 48) * 100000 + (weightValue[5] - 48) * 10000 + (
                                    weightValue[4] - 48) * 1000 + \
                                               (weightValue[3] - 48) * 100 + (weightValue[2] - 48) * 10 + (
                                                       weightValue[1] - 48) * 1
                            if finalWeightValue < 0:
                                finalWeightValue = finalWeightValue * -1
                            print(finalWeightValue)
                            await broadcast_message(str(finalWeightValue))
                        else:
                            await broadcast_message(str(finalWeightValue))
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
