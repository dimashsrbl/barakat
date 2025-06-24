import asyncio
import datetime
from asyncio import current_task
from contextlib import asynccontextmanager
import asyncpg.pgproto.pgproto
from typing import Annotated

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    create_async_engine,
    async_sessionmaker,
    async_scoped_session
)
from sqlalchemy.orm import DeclarativeBase, mapped_column

from config import settings


class Base(DeclarativeBase):
    pass


intpk = Annotated[int, mapped_column(primary_key=True)]
created_at = Annotated[datetime.datetime, mapped_column(default=datetime.datetime.now)]
is_active = Annotated[bool, mapped_column(default=True)]


class DatabaseHelper:
    def __init__(self, url: str, echo: bool = False):
        self.engine = create_async_engine(url=url, echo=echo, pool_size=20, max_overflow=5, pool_recycle=10)
        # self.engine = create_async_engine(url=url, echo=echo, pool_size=5, max_overflow=0)

        self.session_factory = async_sessionmaker(
            bind=self.engine,
            autoflush=False,
            autocommit=False,
            expire_on_commit=False
        )

    def get_scope_session(self):
        return async_scoped_session(
            session_factory=self.session_factory,
            scopefunc=current_task
        )

    @asynccontextmanager
    async def get_db_session(self):
        from sqlalchemy import exc

        session: AsyncSession = self.session_factory()
        try:
            yield session
        except exc.SQLAlchemyError as error:
            await session.rollback()
            raise
        finally:
            await asyncio.shield(session.close())


db_helper = DatabaseHelper(settings.DATABASE_URL_asyncpg)
