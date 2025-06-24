import datetime
from datetime import timedelta
from typing import Optional, Tuple, List, Any

from fastapi import HTTPException
from jose import jwt
from starlette import status

from config import settings
from exceptions import InvalidTokenException, AlreadyExistException, NotFoundException, BadRequestException
from models.user import User
from schemas.user import UserSchema, UserSchemaCreate, UserSchemaUpdate, UserSchemaIsActive
from utils.general_utils import get_order_by, validate_sort_column
from utils.pass_render import get_password_hash, is_valid_password
from utils.unitofwork import IUnitOfWork, UnitOfWork


class UserService:
    async def authenticate_user(self, uow: UnitOfWork, login: str, password: str) -> Optional[UserSchema]:
        async with uow:
            user = await uow.user.find_one_or_none(login=login)
            if user and is_valid_password(password, user.hashed_password):
                return user.to_read_model()
            raise InvalidTokenException()

    async def create_token(cls, uow: IUnitOfWork, user_id: int):
        to_encode = {
            "sub": str(user_id),
            "exp": datetime.datetime.utcnow() + timedelta(
                minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        }
        encoded_jwt = jwt.encode(
            to_encode, settings.SECRET, algorithm=settings.ALGORITHM)
        result = {'access_token': encoded_jwt, 'token_type': 'Bearer'}
        return result

    async def create(self, uow: IUnitOfWork, user: UserSchemaCreate) -> UserSchema or dict:
        data_dict = user.model_dump()
        data_dict['hashed_password'] = get_password_hash(data_dict.pop('password'))
        async with uow:
            user = await uow.user.find_one_or_none(login=data_dict['login'])
            if user:
                raise AlreadyExistException("Пользователь")

            role = await uow.role.find_one_or_none(id=data_dict['role_id'])
            if not role:
                raise BadRequestException("invalid role id")

            role = role.to_read_model()
            result = await uow.user.create(data_dict)
            result.role = role
            await uow.commit()
            return result

    async def get_all(self, uow: IUnitOfWork, is_desc: bool, order_attribute: str, limit: int, offset: int, **filter_by) -> tuple[Any, Any]:
        validate_sort_column(order_attribute, User)
        order_by = get_order_by([{"is_desc": is_desc, "name": order_attribute}])

        async with uow:
            results, total = await uow.user.get_all(order_by=order_by, limit=limit, offset=offset, **filter_by)
            for res in results:
                role = await uow.role.find_one_or_none(id=res.role_id)
                res.role = role.to_read_model()
            return results, total

    async def find_one_or_none(self, uow: IUnitOfWork, **filter_by) -> User:
        async with uow:
            result = await uow.user.find_one_or_none(**filter_by)
            if not result:
                raise NotFoundException("Пользователь")
            result = result.to_read_model()

            role = await uow.role.find_one_or_none(id=result.role_id)
            result.role = role.to_read_model()

            role_permissions, _ = await uow.role_permission.get_all(role_id=result.role_id)

            for role_permission in role_permissions:
                permission = await uow.permission.find_one_or_none(id=role_permission.permission_id)
                result.role.permissions.append(permission.to_read_model())

            return result

    async def update(self, uow: IUnitOfWork, id: int, new_data: UserSchemaUpdate) -> UserSchema:
        updated_data = new_data.model_dump()
        updated_data['hashed_password'] = get_password_hash(updated_data.pop('password'))
        async with uow:
            user = await uow.user.find_one_or_none(id=id)
            if not user:
                raise NotFoundException("Пользователь")

            role = await uow.role.find_one_or_none(id=updated_data['role_id'])
            if not role:
                raise NotFoundException("Роль")
            result = await uow.user.update(id, updated_data)
            result.role = role
            await uow.commit()
            return result

    async def change_is_active(self, uow, id: int, new_data: UserSchemaIsActive) -> UserSchema:
        updated_data = new_data.model_dump()
        async with uow:
            result = await uow.user.find_one_or_none(id=id)
            if not result:
                raise NotFoundException("Пользователь")

            result = await uow.user.update(id, updated_data)
            role = await uow.role.find_one_or_none(id=result.role_id)
            result.role = role.to_read_model()
            await uow.commit()
            return result
