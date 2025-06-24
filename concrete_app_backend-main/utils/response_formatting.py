from certifi import contents
from fastapi.encoders import jsonable_encoder
from starlette import status
from starlette.responses import JSONResponse


def format_response(data, total: int = None):
    result = {'code': 0, 'message': 'ok', 'data': jsonable_encoder(data)}
    if total:
        result['total'] = total
    return JSONResponse(status_code=status.HTTP_200_OK, content=result)
