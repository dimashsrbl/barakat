from typing import Annotated, Optional

from fastapi.openapi.models import HTTPBearer as HTTPBearerModel
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.security.utils import get_authorization_scheme_param
from starlette.requests import Request
from starlette.responses import JSONResponse
from typing_extensions import Annotated, Doc

from exceptions import NotAuthorizedException


class MyCustomHTTPBearer(HTTPBearer):
    def __init__(
            self,
            *,
            bearerFormat: Annotated[Optional[str], Doc("Bearer token format.")] = None,
            scheme_name: Annotated[
                Optional[str],
                Doc(
                    """
                    Security scheme name.
    
                    It will be included in the generated OpenAPI (e.g. visible at `/docs`).
                    """
                ),
            ] = None,
            description: Annotated[
                Optional[str],
                Doc(
                    """
                    Security scheme description.
    
                    It will be included in the generated OpenAPI (e.g. visible at `/docs`).
                    """
                ),
            ] = None,
            auto_error: Annotated[
                bool,
                Doc(
                    """
                    By default, if the HTTP Bearer token not provided (in an
                    `Authorization` header), `HTTPBearer` will automatically cancel the
                    request and send the client an error.
    
                    If `auto_error` is set to `False`, when the HTTP Bearer token
                    is not available, instead of erroring out, the dependency result will
                    be `None`.
    
                    This is useful when you want to have optional authentication.
    
                    It is also useful when you want to have authentication that can be
                    provided in one of multiple optional ways (for example, in an HTTP
                    Bearer token or in a cookie).
                    """
                ),
            ] = True,
    ):
        self.model = HTTPBearerModel(bearerFormat=bearerFormat, description=description)
        self.scheme_name = scheme_name or self.__class__.__name__
        self.auto_error = auto_error

    async def __call__(
            self, request: Request
    ) -> HTTPAuthorizationCredentials:
        authorization = request.headers.get("Authorization")
        scheme, credentials = get_authorization_scheme_param(authorization)
        if not (authorization and scheme and credentials):
            if self.auto_error:
                raise NotAuthorizedException()
            else:
                return None
        if scheme.lower() != "bearer":
            if self.auto_error:
                raise NotAuthorizedException()
            else:
                return None
        return HTTPAuthorizationCredentials(scheme=scheme, credentials=credentials)
