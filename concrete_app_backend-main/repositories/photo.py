from models.photo import Photo
from utils.repository import SQLAlchemyRepository


class PhotoRepository(SQLAlchemyRepository):
    model = Photo
