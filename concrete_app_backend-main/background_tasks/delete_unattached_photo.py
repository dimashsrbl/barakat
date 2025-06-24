from sqlalchemy import select, desc, delete, exc

from config import settings
from db.db import db_helper
from models.photo import Photo
from utils.general_utils import delete_file, send_to_telegram


async def delete_unattached_photo():
    try:
        session = db_helper.get_scope_session()

        stmt = select(Photo).filter_by(is_attached=False).order_by(desc("id")).offset(settings.DEFAULT_PHOTO_COUNT)
        raw = await session.execute(stmt)
        results = raw.scalars().all()

        for photo in results:
            if delete_file(photo.filename):
                stmt = delete(Photo).filter_by(id=photo.id)
                await session.execute(stmt)
                await session.commit()

                message = f"Непривязанная фотография, под айди {photo.id}, с названием {photo.filename} успешно удалена"
                await send_to_telegram("138428254", message)
                # await send_to_telegram("761657130", message)
                await send_to_telegram("374293622", message)
    except exc.SQLAlchemyError as error:
        await session.rollback()
        raise
    finally:
        await session.close()
