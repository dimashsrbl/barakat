import asyncio
import random

from websockets.server import serve


async def main():
    async def echo(websocket):
        finalWeightValue = 0
        index = 0
        while True:
            index = index + 1
            if index % 15 <= 3:
                await websocket.send(str(10))
                await asyncio.sleep(1)
            elif index % 15 <= 6:
                await websocket.send(str( 50 * round((random.randint(0, 10000))/50) ))
                await asyncio.sleep(1)
            elif index % 15 <= 10:
                await websocket.send(str( 50 * round((random.randint(10000, 20000))/50) ))
                await asyncio.sleep(1)
            elif index % 15 <= 15:
                await websocket.send(str( 50 * round((random.randint(20000, 30000))/50) ))
                await asyncio.sleep(1)
    async with serve(echo, "localhost", 8888):
        await asyncio.Future()


asyncio.get_event_loop().run_until_complete(main())