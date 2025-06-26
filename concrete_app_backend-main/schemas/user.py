from typing import Optional

from pydantic import BaseModel, PositiveInt

from schemas.role import RoleSchema


class LoginSchema(BaseModel):
    username: str
    password: str


class UserSchema(BaseModel):
    id: int
    login: str
    fullname: str
    description: Optional[str] = ""
    role_id: PositiveInt
    role: RoleSchema = None
    is_active: bool
    company_id: Optional[int] = None

    class Config:
        from_attributes = True


class UserSchemaCreate(BaseModel):
    login: str
    fullname: str
    description: Optional[str] = None
    role_id: PositiveInt
    password: str
    company_id: Optional[int] = None


class UserSchemaUpdate(BaseModel):
    fullname: str
    description: Optional[str] = None
    role_id: PositiveInt
    password: str
    company_id: Optional[int] = None


class UserSchemaIsActive(BaseModel):
    is_active: bool
