import {useState, useEffect} from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { postAddDriverData } from 'store/features/apiSlice'

import { WeightIndicatorComponent } from 'ui/WeightIndicatorComponent'
import { InputComponent } from 'ui/InputComponent';
import { ButtonComponent } from 'ui/ButtonComponent';

import s from './index.module.scss'
import { useWindowSize } from 'ui/UseWindowSizeComponent';

export const DriverAddPage = () => {
    const [name, setName] = useState('');
    const [isDisabled, setIsDisabled] = useState(true);
    const [responseError, setResponseError] = useState('');

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isMobile: boolean = useWindowSize();

    const addHandler = async () => {
        setIsDisabled(true);
        const obj: any = {
            name: name,
        }
        const response = await dispatch(postAddDriverData(obj))
        if (response?.payload?.message === 'ok') {
            setIsDisabled(false);
            navigate('/main/lists/drivers')
        } else if (response?.error?.message.includes('401')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.')
            return
        } else if (response?.error?.message.includes('403')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.')
            return
        } else if (response?.error?.message.includes('404')) {
            setResponseError('Материал уже существует.');
            return
        } else if (response?.error?.message.includes('400')) {
            setResponseError('Некорректный запрос. Пожалуйста, убедитесь, что введенные данные соответствуют требованиям и повторите попытку.');
            return
        } else {
            setResponseError('Ошибка сервера')
            return
        }
    }

    useEffect(() => {
        if (name !== '') setIsDisabled(false);
        else setIsDisabled(true);
    }, [name]);

 return (
    <div className='main'>
        {isMobile &&
            <div className={`${s.toolbar} df fdr pa w100`}/>
        }
        {!isMobile && 
            <div className="df fdr jcsb aib">
                <span className="fz28">Справочники - Добавить водителя</span>
                <WeightIndicatorComponent/>
            </div>
        }

        <div className={`${s.contentBlock} df fdc`}>
            <div className={`${s.titleBlock} df fdc`}>
                <span className='fw600 fz20'>Добавить нового водителя</span>
                <span className='fz16'>Введите данные и нажмите кнопку “Добавить водителя</span>
            </div>
            <div className={`${s.personalBlock} df fdc`}>
                <span className="fw600">Данные водителя</span>
                <div className={`${s.inputBlock} df fdr`}>
                    <InputComponent
                        type="default"
                        placeholder="ФИО"
                        state={name}
                        setState={setName}
                    />
                </div>
            </div>
            <div className={`${s.actionButtons} df fdr w50`}>
                <ButtonComponent 
                    width='100%'
                    height='48px'
                    text='Добавить водителя' 
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
                    onClick={(e:any) => {navigate('/main/lists/drivers')}}
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