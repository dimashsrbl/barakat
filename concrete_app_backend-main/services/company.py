from typing import Any

from exceptions import AlreadyExistException, NotFoundException
from models.company import Company
from schemas.company import CompanySchemaAdd, CompanySchema, CompanySchemaUpdate, CompanySchemaIsActive, \
    CompanyFuncEnum, CompanySchemaIsDebtor
from utils.general_utils import get_order_by, validate_sort_column
from utils.unitofwork import IUnitOfWork


class CompanyService:
    async def create(self, uow: IUnitOfWork, data: CompanySchemaAdd) -> CompanySchema:
        data_dict = data.model_dump()
        async with uow:
            company = await uow.company.find_one_or_none(name=data_dict['name'])
            if company:
                raise AlreadyExistException("Компания")
            result = await uow.company.create(data_dict)
            await uow.commit()
            return result

    async def get_all(self, uow: IUnitOfWork, is_desc: bool, order_attribute: str, name: str, limit: int, offset: int, company_function, **filter_by) \
            -> tuple[Any, Any]:
        name_contain_filter = True
        if name:
            name_contain_filter = Company.name.ilike(f'%{name}%')

        company_function_filter = [CompanyFuncEnum.our, CompanyFuncEnum.all]
        if company_function == CompanyFuncEnum.customer:
            company_function_filter.append(CompanyFuncEnum.customer)
        elif company_function == CompanyFuncEnum.supplier:
            company_function_filter.append(CompanyFuncEnum.supplier)
        elif company_function == CompanyFuncEnum.our:
            company_function_filter = [CompanyFuncEnum.our]
        elif company_function == CompanyFuncEnum.all:
            company_function_filter = [CompanyFuncEnum.all]
        function_filter = Company.company_func.in_(company_function_filter)

        if not company_function:
            function_filter = True

        validate_sort_column(order_attribute, Company)
        order_by = get_order_by([{"is_desc": is_desc, "name": order_attribute}])

        async with uow:

            results, total = await uow.company.get_all(name_contain_filter, function_filter, order_by=order_by, limit=limit, offset=offset,
                                                       **filter_by)

            return results, total

    async def find_one_or_none(self, uow: IUnitOfWork, **filter_by) -> CompanySchema:
        async with uow:
            result = await uow.company.find_one_or_none(**filter_by)
            if not result:
                raise NotFoundException("Компания")
            result = result.to_read_model()
            return result

    async def update(self, uow: IUnitOfWork, id: int, new_data: CompanySchemaUpdate) -> CompanySchema:
        updated_data = new_data.model_dump()
        async with uow:
            result = await uow.company.find_one_or_none(id=id)
            if not result:
                raise NotFoundException("Компания")

            if result.to_read_model().name != updated_data['name']:
                result = await uow.company.find_one_or_none(name=updated_data['name'])
                if result:
                    result = result.to_read_model()
                    if result.name == updated_data['name']:
                        raise AlreadyExistException("Компания")

            result = await uow.company.update(id, updated_data)
            await uow.commit()
            return result

    async def change_is_debtor(self, uow: IUnitOfWork, id: int, new_data: CompanySchemaIsDebtor) -> CompanySchema:
        updated_data = new_data.model_dump()
        async with uow:
            result = await uow.company.find_one_or_none(id=id)
            if not result:
                raise NotFoundException("Компания")

            result = await uow.company.update(id, updated_data)
            await uow.commit()
            return result

    async def change_is_active(self, uow: IUnitOfWork, id: int, new_data: CompanySchemaIsActive) -> CompanySchema:
        updated_data = new_data.model_dump()
        async with uow:
            result = await uow.company.find_one_or_none(id=id)
            if not result:
                raise NotFoundException("Компания")

            result = await uow.company.update(id, updated_data)
            await uow.commit()
            return result
