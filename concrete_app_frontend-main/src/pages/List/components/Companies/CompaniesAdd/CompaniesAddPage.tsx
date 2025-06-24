import React, {useState, useEffect} from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { postAddCompaniesData } from 'store/features/apiSlice';
import { companyFunctionConst, companyTypes } from 'constDatas';

import { WeightIndicatorComponent } from 'ui/WeightIndicatorComponent'
import { InputComponent } from 'ui/InputComponent';
import { SelectComponent } from 'ui/SelectComponentAntd'
import { ButtonComponent } from 'ui/ButtonComponent';

import s from './index.module.scss'
import { useWindowSize } from 'ui/UseWindowSizeComponent';


export const CompaniesAddPage = () => {
    const [name, setName] = useState('');
    const [companyType, setCompanyType] = useState(null);
    const [companyFunction, setCompanyFunction] = useState(null);
    const [number, setNumber] = useState('');
    const [bin, setBin] = useState('');
    const [isDisabled, setIsDisabled] = useState(true);

    const [responseError, setResponseError] = useState('');

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isMobile: boolean = useWindowSize();

    const addHandler = async () => {
        setIsDisabled(true);
        const obj: any = {
            name: name,
            company_type: companyType,
            bin: bin,
            company_func: companyFunction,
            contact_number: number,
        }
        const response = await dispatch(postAddCompaniesData(obj));
        if (response?.payload?.message === 'ok') {
            setIsDisabled(false);
            navigate('/main/lists')
        } else if (response?.error?.message.includes('401')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.')
            return
        } else if (response?.error?.message.includes('403')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.')
            return
        } else if (response?.error?.message.includes('404')) {
            setResponseError('Компания уже существует.');
            return
        }  else if (response?.error?.message.includes('400')) {
            setResponseError('Некорректный запрос. Пожалуйста, убедитесь, что введенные данные соответствуют требованиям и повторите попытку.');
            return
        } else {
            setResponseError('Ошибка сервера.')
            return
        }
    }

    useEffect(() => {
        if (name !== '' && companyType !== null && companyFunction !== null && number !== '') setIsDisabled(false);
        else setIsDisabled(true);
    }, [name, companyType, companyFunction, number]);

 return (
    <div className='main'>
        {isMobile &&
            <div className={`${s.toolbar} df fdr pa w100`}/>
        }
        {!isMobile && 
            <div className="df fdr jcsb aib">
               <span className="fz28">Справочники - Добавить компанию</span>
               <WeightIndicatorComponent/>
           </div> 
        }

        <div className={`${s.contentBlock} df fdc`}>
            <div className={`${s.titleBlock} df fdc`}>
                <span className='fw600 fz20'>Добавить новую компанию</span>
                <span className='fz16'>Введите данные и нажмите кнопку “Добавить компанию”</span>
            </div>
            <div className={`${s.personalBlock} df fdc`}>
                <span className="fw600">Данные компании</span>
                <div className={`${s.inputBlock} df`}>
                    <InputComponent
                        type="default"
                        placeholder="Наименование"
                        state={name}
                        width='100%'
                        setState={setName}
                        onKeyDown={(e: React.KeyboardEvent) => ""}
                    />
                    <InputComponent
                        type="default"
                        placeholder="БИН"
                        state={bin}
                        width='100%'
                        setState={setBin}
                        onKeyDown={(e: React.KeyboardEvent) => ""}
                    />
                    <SelectComponent
                        placeholder={'Тип'}
                        items={companyTypes}
                        state={companyType}
                        height={"50px"}
                        setState={setCompanyType}
                        loadingText={'Нет данных...'}
                    />
                </div>
                <div className={`${s.inputBlock} df`}>
                    <SelectComponent
                        placeholder={'Функция'}
                        items={companyFunctionConst}
                        state={companyFunction}
                        height={"50px"}
                        setState={setCompanyFunction}
                        loadingText={'Нет данных...'}
                    />
                    <InputComponent
                        type='phone'
                        width='100%'
                        placeholder="Номер контактного лица"
                        state={number}
                        setState={setNumber}
                    />
                </div>
            </div>

            <div className={`${s.actionButtons} df fdr w50`}>
                <ButtonComponent 
                    width='100%'
                    height='48px'
                    text="Добавить компанию" 
                    onClick={(e: any) => {
                        addHandler();
                    }}
                    disabled={isDisabled} 
                    variant='primary'
                />
                <ButtonComponent 
                    width='100%'
                    height='48px'
                    text="Вернуться назад" 
                    onClick={() => {navigate('/main/lists')}}
                    disabled={false} 
                    variant='secondary'
                />
            </div>
            {responseError !== '' && (
                <span style={{ color: '#EB5757', fontSize: '14px', margin: '10px 0 0 12px' }}>{responseError}</span>
            )}
        </div>
    </div>
 )
}