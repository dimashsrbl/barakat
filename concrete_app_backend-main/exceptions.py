from typing import Optional

from alembic.util import status
from starlette import status


class MyBaseException(Exception):
    def __init__(
            self,
            status_code: int,
            code: int,
            message: str
    ):
        self.status_code = status_code,
        self.code = code,
        self.message = message

    def get_content(self):
        return {
            "code": self.code[0],
            "message": self.message,
        }


class NotAuthorizedException(MyBaseException):
    def __init__(self):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, code=1, message="Вы не авторизованы.")


class ForbiddenException(MyBaseException):
    def __init__(self):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, code=1,
                         message="You don't have permission to access this resource.")


class InvalidTokenException(MyBaseException):
    def __init__(self):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, code=1, message="Неверный логин или пароль.")


class NotFoundException(MyBaseException):
    def __init__(self, item: str):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, code=1, message=f"{item} не найден(-а).")


class AlreadyExistException(MyBaseException):
    def __init__(self, item: str):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, code=1, message=f"{item} уже существует.")


class BadRequestException(MyBaseException):
    def __init__(self, message: str):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, code=1, message=message)


class ServerSideException(MyBaseException):
    def __init__(self, message: str):
        super().__init__(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, code=1, message="Server error")
