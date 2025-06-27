from sqlalchemy import insert, select, delete
from sqlalchemy.exc import IntegrityError

from config import settings
from db.db import db_helper
from models.concrete_mixing_plant import ConcreteMixingPlant
from models.construction_type import ConstructionType
from models.material_type import MaterialType
from models.permission import Permission
from models.receive_method_type import ReceiveMethodType
from models.role import Role
from models.role_permission import RolePermission
from models.user import User
from utils.pass_render import get_password_hash


async def db_data_seed():
    user_dict = {
        'login': settings.FIRST_USER_LOGIN,
        'hashed_password': get_password_hash(settings.FIRST_USER_PASSWORD),
        'role_name': 'Администратор',
        'fullname': 'admin'
    }
    material_types = [
        {'name': 'Раствор', "is_for_independent": False, "is_for_dependent": True},
        {'name': 'Керамзитобетон', "is_for_independent": False, "is_for_dependent": True},
        {'name': 'Бетон', "is_for_independent": False, "is_for_dependent": True},
        {'name': 'Пескобетон', "is_for_independent": False, "is_for_dependent": True},
        {'name': 'Высокомарочный бетон', "is_for_independent": False, "is_for_dependent": True},
        {'name': 'ЖБИ Бетон', "is_for_independent": False, "is_for_dependent": True},
        {'name': 'Прочее', "is_for_independent": True, "is_for_dependent": False},
    ]
    cmps = [
        {'name': '1'},
        {'name': '2'},
        {'name': '3'},
    ]
    construction_types = [
        {'name': 'Вертикальная', 'key_name': 'ВК'},
        {'name': 'Плита', 'key_name': 'ПМ'},
        {'name': 'Ростверк', 'key_name': 'РВК'},
        {'name': 'ЖБИ', 'key_name': 'ЖБИ'},
        {'name': 'Плашка', 'key_name': 'ПЛ'},
        {'name': 'Стяжка', 'key_name': 'СТ'},
        {'name': 'Пусковой', 'key_name': 'ПС'},
    ]
    receive_method_types = [
        {'name': 'АБН', 'key_name': 'АБН'},
        {'name': 'Бадья', 'key_name': 'Б'},
        {'name': 'Прямой слив', 'key_name': 'П'},
        {'name': 'СБН', 'key_name': 'СБН'},
    ]
    roles = [
        {'name': 'Администратор'},
        {'name': 'Директор завода'},
        {'name': 'Операционный директор'},
        {'name': 'Руководитель отдела продаж'},
        {'name': 'Менеджер отдела продаж'},
        {'name': 'Логист'},
        {'name': 'Лаборант'},
        {'name': 'Диспетчер весовой'},
        {'name': 'Учредитель'},
        {'name': 'Бухгалтер'},
        {'name': 'Мастер БСУ'},
    ]
    permissions = [
        {"name": "create_user"},
        {"name": "edit_user"},
        {"name": "deactivate_user"},
        {"name": "create_handbook"},
        {"name": "edit_handbook"},
        {"name": "deactivate_handbook"},
        {"name": "create_independent"},
        {"name": "finish_independent"},
        {"name": "edit_independent"},
        {"name": "create_dependent"},
        {"name": "finish_dependent"},
        {"name": "edit_dependent"},
        {"name": "edit_monitoring_data"},
        {"name": "deactivate_weighing"},
        {"name": "reconnect_weighing"},
        {"name": "change_cmp_cubature_weighing"},
        {"name": "create_request"},
        {"name": "edit_request"},
        {"name": "close_request"},
        {"name": "deactivate_request"},
    ]
    role_permissions = [
        {'role_name': 'Администратор', 'permission_name': 'create_user'},
        {'role_name': 'Администратор', 'permission_name': 'edit_user'},
        {'role_name': 'Администратор', 'permission_name': 'deactivate_user'},

        {'role_name': 'Администратор', 'permission_name': 'create_handbook'},
        {'role_name': 'Администратор', 'permission_name': 'edit_handbook'},
        {'role_name': 'Администратор', 'permission_name': 'deactivate_handbook'},

        {'role_name': 'Администратор', 'permission_name': 'create_independent'},
        {'role_name': 'Администратор', 'permission_name': 'finish_independent'},
        {'role_name': 'Администратор', 'permission_name': 'edit_independent'},

        {'role_name': 'Администратор', 'permission_name': 'create_dependent'},
        {'role_name': 'Администратор', 'permission_name': 'finish_dependent'},
        {'role_name': 'Администратор', 'permission_name': 'edit_dependent'},

        {'role_name': 'Администратор', 'permission_name': 'edit_monitoring_data'},
        {'role_name': 'Администратор', 'permission_name': 'deactivate_weighing'},
        {'role_name': 'Администратор', 'permission_name': 'reconnect_weighing'},
        {'role_name': 'Администратор', 'permission_name': 'change_cmp_cubature_weighing'},

        {'role_name': 'Администратор', 'permission_name': 'create_request'},
        {'role_name': 'Администратор', 'permission_name': 'edit_request'},
        {'role_name': 'Администратор', 'permission_name': 'close_request'},
        {'role_name': 'Администратор', 'permission_name': 'deactivate_request'},

        {'role_name': 'Директор завода', 'permission_name': 'create_handbook'},
        {'role_name': 'Директор завода', 'permission_name': 'edit_handbook'},
        {'role_name': 'Директор завода', 'permission_name': 'deactivate_handbook'},

        {'role_name': 'Диспетчер весовой', 'permission_name': 'create_handbook'},
        {'role_name': 'Диспетчер весовой', 'permission_name': 'edit_handbook'},
        {'role_name': 'Диспетчер весовой', 'permission_name': 'deactivate_handbook'},

        {'role_name': 'Диспетчер весовой', 'permission_name': 'create_independent'},
        {'role_name': 'Диспетчер весовой', 'permission_name': 'finish_independent'},
        {'role_name': 'Диспетчер весовой', 'permission_name': 'edit_independent'},

        {'role_name': 'Диспетчер весовой', 'permission_name': 'create_dependent'},
        {'role_name': 'Диспетчер весовой', 'permission_name': 'finish_dependent'},
        {'role_name': 'Диспетчер весовой', 'permission_name': 'edit_dependent'},

        {'role_name': 'Диспетчер весовой', 'permission_name': 'edit_monitoring_data'},
        {'role_name': 'Диспетчер весовой', 'permission_name': 'deactivate_weighing'},
        {'role_name': 'Диспетчер весовой', 'permission_name': 'reconnect_weighing'},
        {'role_name': 'Диспетчер весовой', 'permission_name': 'change_cmp_cubature_weighing'},

        {'role_name': 'Диспетчер весовой', 'permission_name': 'create_request'},
        {'role_name': 'Диспетчер весовой', 'permission_name': 'edit_request'},
        {'role_name': 'Диспетчер весовой', 'permission_name': 'close_request'},
        {'role_name': 'Диспетчер весовой', 'permission_name': 'deactivate_request'},

        {'role_name': 'Логист', 'permission_name': 'create_handbook'},
        {'role_name': 'Логист', 'permission_name': 'edit_handbook'},
        {'role_name': 'Логист', 'permission_name': 'deactivate_handbook'},

        {'role_name': 'Логист', 'permission_name': 'create_independent'},
        {'role_name': 'Логист', 'permission_name': 'finish_independent'},
        {'role_name': 'Логист', 'permission_name': 'edit_independent'},

        {'role_name': 'Логист', 'permission_name': 'create_dependent'},
        {'role_name': 'Логист', 'permission_name': 'finish_dependent'},
        {'role_name': 'Логист', 'permission_name': 'edit_dependent'},

        {'role_name': 'Логист', 'permission_name': 'edit_monitoring_data'},
        {'role_name': 'Логист', 'permission_name': 'deactivate_weighing'},
        {'role_name': 'Логист', 'permission_name': 'reconnect_weighing'},
        {'role_name': 'Логист', 'permission_name': 'change_cmp_cubature_weighing'},

        {'role_name': 'Логист', 'permission_name': 'create_request'},
        {'role_name': 'Логист', 'permission_name': 'edit_request'},
        {'role_name': 'Логист', 'permission_name': 'close_request'},
        {'role_name': 'Логист', 'permission_name': 'deactivate_request'},

        {'role_name': 'Лаборант', 'permission_name': 'edit_independent'},
        {'role_name': 'Мастер БСУ', 'permission_name': 'edit_independent'},
        {'role_name': 'Технолог', 'permission_name': 'edit_independent'},
        {'role_name': 'Водитель цементовоза', 'permission_name': 'edit_independent'},
    ]
    async with db_helper.get_db_session() as session:
        for role in roles:
            try:
                stmt = insert(Role).values(**role)
                await session.execute(stmt)
            except IntegrityError:
                print('role has already been created')
                await session.rollback()
            finally:
                await session.commit()
                continue
        print('roles have been successfully created')

    async with db_helper.get_db_session() as session:
        for material_type in material_types:
            try:
                stmt = insert(MaterialType).values(**material_type)
                await session.execute(stmt)
            except IntegrityError:
                print('material type has already been created')
                await session.rollback()
            finally:
                await session.commit()
                continue
        print('material types have been successfully created')

    try:
        async with db_helper.get_db_session() as session:
            user_dict['role_id'] = (
                await session.execute(select(Role.id).filter_by(name=user_dict.pop('role_name')))).scalar()
            stmt = insert(User).values(**user_dict)
            await session.execute(stmt)
            await session.commit()
            print('users have been successfully created')
    except IntegrityError:
        print('users has already been created')

    async with db_helper.get_db_session() as session:
        for cmp in cmps:
            try:
                stmt = insert(ConcreteMixingPlant).values(**cmp)
                await session.execute(stmt)
            except IntegrityError:
                print('concrete mixing plant has already been created')
                await session.rollback()
            finally:
                await session.commit()
                continue
        print('concrete mixing plants have been successfully created')

    async with db_helper.get_db_session() as session:
        for construction_type in construction_types:
            try:
                stmt = insert(ConstructionType).values(**construction_type)
                await session.execute(stmt)
            except IntegrityError:
                print('construction type has already been created')
                await session.rollback()
            finally:
                await session.commit()
                continue
        print('construction types have been successfully created')

    async with db_helper.get_db_session() as session:
        for receive_method_type in receive_method_types:
            try:
                stmt = insert(ReceiveMethodType).values(**receive_method_type)
                await session.execute(stmt)
            except IntegrityError:
                print('receive method type has already been created')
                await session.rollback()
            finally:
                await session.commit()
                continue
        print('receive method types have been successfully created')

    async with db_helper.get_db_session() as session:
        for permission in permissions:
            try:
                stmt = insert(Permission).values(**permission)
                await session.execute(stmt)
            except IntegrityError:
                print('permission has already been created')
                await session.rollback()
            finally:
                await session.commit()
                continue
        print(f'Всего прав доступа: {len(permissions)}')
        print('permissions have been successfully created')

    async with db_helper.get_db_session() as session:
        for permission in permissions:
            try:
                stmt = delete(RolePermission)
                await session.execute(stmt)

                for role_permission in role_permissions:
                    stmt = select(Role.id).filter_by(name=role_permission['role_name'])
                    raw = await session.execute(stmt)
                    role_id = raw.scalar_one_or_none()

                    stmt = select(Permission.id).filter_by(name=role_permission['permission_name'])
                    raw = await session.execute(stmt)
                    permission_id = raw.scalar_one_or_none()

                    stmt = insert(RolePermission).values(role_id=role_id, permission_id=permission_id)
                    await session.execute(stmt)
            except IntegrityError:
                print('role_permission has already been created')
                await session.rollback()
            finally:
                await session.commit()
                continue
        print(f'Всего связей ролей и прав доступа: {len(role_permissions)}')
        print('role_permissions have been successfully created')

    # --- Массовое создание пользователей для всех ролей ---
    users = [
        {"login": "admin", "fullname": "Әлихан Төлегенұлы", "description": "Администратор", "role_name": "Администратор"},
        {"login": "director", "fullname": "Мақсат Бекенов", "description": "Директор завода", "role_name": "Директор завода"},
        {"login": "opdirector", "fullname": "Данияр Қуанышев", "description": "Операционный директор", "role_name": "Операционный директор"},
        {"login": "saleshead", "fullname": "Айгүл Серікқызы", "description": "Руководитель отдела продаж", "role_name": "Руководитель отдела продаж"},
        {"login": "salesmanager", "fullname": "Нұржан Әбдірахманов", "description": "Менеджер отдела продаж", "role_name": "Менеджер отдела продаж"},
        {"login": "logistic", "fullname": "Аружан Мұратова", "description": "Логист", "role_name": "Логист"},
        {"login": "laborant", "fullname": "Еркебұлан Сейітов", "description": "Лаборант", "role_name": "Лаборант"},
        {"login": "dispatcher", "fullname": "Гүлнұр Жақсыбаева", "description": "Диспетчер весовой", "role_name": "Диспетчер весовой"},
        {"login": "founder", "fullname": "Бауыржан Сұлтанов", "description": "Учредитель", "role_name": "Учредитель"},
        {"login": "accountant", "fullname": "Әсемгүл Оразбаева", "description": "Бухгалтер", "role_name": "Бухгалтер"},
        {"login": "bsumaster", "fullname": "Қанат Әлібеков", "description": "Мастер БСУ", "role_name": "Мастер БСУ"},
    ]
    async with db_helper.get_db_session() as session:
        for user in users:
            try:
                user_data = user.copy()
                user_data['hashed_password'] = get_password_hash('test123')
                user_data['role_id'] = (await session.execute(select(Role.id).filter_by(name=user_data.pop('role_name')))).scalar()
                stmt = insert(User).values(**user_data)
                await session.execute(stmt)
            except IntegrityError:
                print(f"user {user['login']} has already been created")
                await session.rollback()
            finally:
                await session.commit()
                continue
        print('Массовое создание пользователей завершено успешно')
    # --- Конец массового создания пользователей ---

    # --- Тестовый поставщик ---
    supplier_user = {
        "login": "supplier1",
        "fullname": "Айдархан Жумабеков",
        "description": "Поставщик (тест)",
        "role_name": "Поставщик",
        "password": "test123"
    }
    # Проверка, есть ли уже такой пользователь
    async with db_helper.get_db_session() as session:
        existing = await session.execute(select(User).filter_by(login=supplier_user["login"]))
        if not existing.scalar_one_or_none():
            role_result = await session.execute(select(Role.id).filter_by(name=supplier_user["role_name"]))
            role_id = role_result.scalar_one_or_none()
            if role_id:
                await session.execute(insert(User).values(
                    login=supplier_user["login"],
                    fullname=supplier_user["fullname"],
                    description=supplier_user["description"],
                    role_id=role_id,
                    hashed_password=get_password_hash(supplier_user["password"]),
                    is_active=True
                ))
                await session.commit()
                print(f"Тестовый поставщик {supplier_user['login']} создан успешно")
            else:
                print(f"Роль '{supplier_user['role_name']}' не найдена")
        else:
            print(f"Пользователь {supplier_user['login']} уже существует")

    print('all data seed was successfully')
