from typing import Annotated

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials
from jose import jwt

from config import settings
from exceptions import NotAuthorizedException, ForbiddenException
from services.user import UserService
from utils.auth import MyCustomHTTPBearer
from utils.unitofwork import IUnitOfWork, UnitOfWork

UOWDep = Annotated[IUnitOfWork, Depends(UnitOfWork)]

# security = HTTPBearer()
security = MyCustomHTTPBearer()


# authorization = Annotated[HTTPAuthorizationCredentials, Depends(security)],


async def get_current_user(
        uow: UOWDep,
        token: Annotated[HTTPAuthorizationCredentials, Depends(security)],
):
    try:
        payload = jwt.decode(token.credentials,
                             settings.SECRET, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise NotAuthorizedException()
    except Exception:
        raise NotAuthorizedException()
    current_user = await UserService().find_one_or_none(uow, id=int(user_id))
    if not current_user.is_active:
        raise NotAuthorizedException()
    return current_user


def check_permission(required_permission: str = None):
    def _check_permission(user=Depends(get_current_user)):
        permissions = user.role.permissions
        if required_permission is None:
            return permissions  # No specific permissions required
        elif not any(permission.name in required_permission for permission in permissions):
            raise ForbiddenException
        return permissions

    return _check_permission
