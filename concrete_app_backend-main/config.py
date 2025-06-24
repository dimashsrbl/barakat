import os

from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    DB_HOST: str
    DB_PORT: int
    DB_NAME: str
    DB_USER: str
    DB_PASS: str

    POSTGRES_DB: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str

    SECRET: str

    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60*24
    # ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    FIRST_USER_LOGIN: str
    FIRST_USER_PASSWORD: str

    BOT_TOKEN: str
    TELEGRAM_GROUP_CHAT_ID: str
    NOT_FINISHED_DEPENDENT_WEIGHING_URL: str
    FINISHED_DEPENDENT_WEIGHING_URL: str

    COMPLETION_RATE: int
    HOW_MUCH_EARLIER_ABS: int
    HOW_MUCH_EARLIER_CALL: int
    CHECK_REQUESTS_FOR_NOTIFICATIONS_RATE: int

    GET_CMP_STATISTIC_FOR_THE_LAST_N_HOURS: int
    DEFAULT_PHOTO_COUNT: int
    DEFAULT_OBJECT_NAME_FOR_PRIVATE_PERSON: str

    CORS_HEADERS: str
    CORS_ORIGINS: str
    CORS_METHODS: str
    @property
    def DATABASE_URL_asyncpg(self):
        # postgresql+asyncpg://postgres:postgres@localhost:5432/sa
        return f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASS}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    @property
    def DATABASE_URL_psycopg(self):
        # DSN
        # postgresql+psycopg://postgres:postgres@localhost:5432/sa
        return f"postgresql+psycopg://{self.DB_USER}:{self.DB_PASS}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
