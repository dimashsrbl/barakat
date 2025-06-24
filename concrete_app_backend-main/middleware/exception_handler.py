from fastapi import Request
from starlette.responses import JSONResponse

from exceptions import *


async def middleware(request: Request, call_next):
    try:
        response = await call_next(request)
    except NotAuthorizedException as e:
        return JSONResponse(status_code=e.status_code[0], content=e.get_content())
    except ForbiddenException as e:
        return JSONResponse(status_code=e.status_code[0], content=e.get_content())
    except InvalidTokenException as e:
        return JSONResponse(status_code=e.status_code[0], content=e.get_content())
    except NotFoundException as e:
        return JSONResponse(status_code=e.status_code[0], content=e.get_content())
    except AlreadyExistException as e:
        return JSONResponse(status_code=e.status_code[0], content=e.get_content())
    except BadRequestException as e:
        return JSONResponse(status_code=e.status_code[0], content=e.get_content())
    # except Exception as e:
    #     return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    #                         content={"code": 2, "message": "Server Error"})
    return response
