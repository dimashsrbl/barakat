import { useState, useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { postAddCarriersData, getCurrentUserData, selectUser } from 'store/features/apiSlice';

import { WeightIndicatorComponent } from 'ui/WeightIndicatorComponent'
import { InputComponent } from 'ui/InputComponent';
import { ButtonComponent } from 'ui/ButtonComponent';

import s from './index.module.scss'
import { useWindowSize } from 'ui/UseWindowSizeComponent';

export const CarrierAddPage = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isDisabled, setIsDisabled] = useState(true);

    const [responseError, setResponseError] = useState('');

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const isMobile: boolean = useWindowSize();

    useEffect(() => {
        dispatch(getCurrentUserData());
    }, [dispatch]);

    useEffect(() => {
        if (name !== '') setIsDisabled(false);
        else setIsDisabled(true);
    }, [name]);

    const addHandler = async () => {
        if (!user || user.role?.name !== 'Поставщик') {
            setResponseError('Недостаточно прав для выполнения этого запроса.');
            return;
        }
        setIsDisabled(true);
        const obj: any = {
            name: name,
            description: description
        }
        const response = await dispatch(postAddCarriersData(obj))
        if (response?.payload?.message === 'ok') {
            setIsDisabled(false);
            navigate('/main/lists/carrier');
        } else if (response?.error?.message.includes('401')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.');
            return
        } else if (response?.error?.message.includes('403')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.');
            return
        } else if (response?.error?.message.includes('404')) {
            setResponseError('Перевозчик уже существует.');
            return
        } else if (response?.error?.message.includes('400')) {
            setResponseError('Некорректный запрос. Пожалуйста, убедитесь, что введенные данные соответствуют требованиям и повторите попытку.');
            return
        } else {
            setResponseError('Ошибка сервера');
            return
        }
    }

 return (
    <div className='main'>
        {isMobile &&
            <div className={`${s.toolbar} df fdr pa w100`}/>
        }
        {!isMobile && 
            <div className="df fdr jcsb aib">
                <span className="fz28">Справочники - Добавить перевозчика</span>
                <WeightIndicatorComponent/>
            </div>
        }

        <div className={`${s.contentBlock} df fdc`}>
            <div className={`${s.titleBlock} df fdc`}>
                <span className='fw600 fz20'>Добавить нового перевозчика</span>
                <span className='fz16'>Введите данные и нажмите кнопку “Добавить перевозчика”</span>
            </div>
            <div className={`${s.personalBlock} df fdc`}>
                <span className="fw600">Данные о перевозчике</span>
                <div className={`${s.inputBlock} df`}>
                    <InputComponent
                        type="default"
                        placeholder="Наименование"
                        state={name}
                        setState={setName}
                    />
                </div>
            </div>

            <div className={`${s.additionalBlock} df fdc`}>
                <span className="fw600">Дополнительная информация</span>
                <div className="df fdr">
                    <InputComponent
                        type="textarea"
                        placeholder="Примечание"
                        state={description}
                        setState={setDescription}
                    />
                </div>
            </div>
            <div className={`${s.actionButtons} df fdr w50`}>
                <ButtonComponent 
                    width='100%'
                    height='48px'
                    text='Добавить перевозчика' 
                    onClick={(e: any) => {
                        addHandler();
                    }}
                    disabled={isDisabled} 
                    variant='primary'
                />
                <ButtonComponent 
                    width='100%'
                    height='48px'
                    text='Вернуться назад'
                    onClick={(e:any) => {navigate('/main/lists/carrier')}}
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