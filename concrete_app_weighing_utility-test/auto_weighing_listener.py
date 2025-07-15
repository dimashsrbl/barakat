import asyncio
import websockets
import aiohttp
import time
import os

WEBSOCKET_URL = "ws://localhost:8888"
API_URL = "http://localhost:8000/api/inert_weighing/auto_weighing"
PLATE_FILE = "/tmp/current_plate.txt"
STABILITY_THRESHOLD = 50  # кг
WAIT_AFTER_CAMERA = 10  # секунд
WAIT_BETWEEN_WEIGHTS = 5  # секунд

async def get_plate_number():
    """Ждет появления файла с номером машины и возвращает его"""
    while True:
        if os.path.exists(PLATE_FILE):
            with open(PLATE_FILE, "r") as f:
                plate = f.read().strip()
            if plate:
                return plate
        await asyncio.sleep(0.5)

async def send_weight_to_api(plate_number, weight):
    async with aiohttp.ClientSession() as session:
        payload = {"plate_number": plate_number, "weight": weight}
        async with session.post(API_URL, json=payload) as response:
            print(f"API response: {response.status} - {await response.text()}")

async def main():
    print("[auto_weighing_listener] Старт автоматического взвешивания...")
    while True:
        print("Ожидание номера машины от камеры...")
        plate_number = await get_plate_number()
        print(f"Камера зафиксировала номер: {plate_number}")
        print(f"Ждем {WAIT_AFTER_CAMERA} секунд, чтобы машина заехала на весы...")
        await asyncio.sleep(WAIT_AFTER_CAMERA)
        async with websockets.connect(WEBSOCKET_URL) as ws:
            weights = []
            while True:
                print("Берем вес...")
                msg = await ws.recv()
                try:
                    weight = int(msg)
                    weights.append(weight)
                    if len(weights) > 2:
                        weights.pop(0)
                    if len(weights) == 2:
                        print(f"Первый вес: {weights[0]}")
                        print(f"Второй вес: {weights[1]}")
                        if abs(weights[0] - weights[1]) <= STABILITY_THRESHOLD:
                            stable_weight = int((weights[0] + weights[1]) / 2)
                            print(f"Вес стабилен: {stable_weight} кг. Отправляем в API...")
                            await send_weight_to_api(plate_number, stable_weight)
                            os.remove(PLATE_FILE)
                            print("Ожидание следующей машины...")
                            break
                        else:
                            print(f"Вес нестабилен (разница {abs(weights[0] - weights[1])} кг). Пробуем снова...")
                except Exception:
                    continue

if __name__ == "__main__":
    asyncio.run(main()) 