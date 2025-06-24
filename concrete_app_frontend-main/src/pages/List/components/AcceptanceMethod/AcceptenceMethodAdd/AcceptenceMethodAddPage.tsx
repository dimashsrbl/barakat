import { useCallback, useEffect, useState } from 'react';

import { WeightIndicatorComponent } from 'ui/WeightIndicatorComponent'
import { InputComponent } from 'ui/InputComponent';
import { ButtonComponent } from 'ui/ButtonComponent';

import s from './index.module.scss'
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getReceiveMethodTypesData, postAddAcceptanceMethodData } from 'store/features/apiSlice';
import { SelectComponent } from 'ui/SelectComponentAntd';
import { useWindowSize } from 'ui/UseWindowSizeComponent';

export const AcceptenceMethodAddPage = () => {
    const [name, setName] = useState('');
    const [type, setType] = useState(null);
    const [description, setDescription] = useState('');
    const [isDisabled, setIsDisabled] = useState(true);
    const [responseError, setResponseError] = useState('');

    const [receiveMethodItems, setReceiveMethodTypeItems] = useState<any>([]);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isMobile: boolean = useWindowSize();

    const getReceiveMethodTypes = useCallback(async () => {
        const response = await dispatch(getReceiveMethodTypesData());
        setReceiveMethodTypeItems(response?.payload?.data);
    }, [dispatch]);

    const addHandler = async () => {
        setIsDisabled(true);
        const obj: any = {
            name: name,
            receive_method_type_id: receiveMethodItems.find((item: any) => item.name === type)?.id,
            description: description
        }
        const response = await dispatch(postAddAcceptanceMethodData(obj))
        if (response?.payload?.message === 'ok') {
            setIsDisabled(false);
            navigate('/main/lists/acceptance-method')
        } else if (response?.error?.message.includes('401')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.')
            return
        } else if (response?.error?.message.includes('403')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.')
            return
        } else if (response?.error?.message.includes('404')) {
            setResponseError('Способ приемки уже существует.');
            return
        } else if (response?.error?.message.includes('400')) {
            setResponseError('Некорректный запрос. Пожалуйста, убедитесь, что введенные данные соответствуют требованиям и повторите попытку.');
            return
        } else {
            setResponseError('Ошибка сервера');
            return
        }
    }

    useEffect(() => {
        if (name !== '' && type !== null) setIsDisabled(false);
        else setIsDisabled(true);
    }, [name, type]);

    useEffect(() => {
        getReceiveMethodTypes();
    }, [getReceiveMethodTypes])

 return (
    <div className='main'>
        {isMobile && 
            <div className={`${s.toolbar} df fdr pa w100`}/>
        }
        {!isMobile && 
            <div className="df fdr jcsb aib">
                <span className="fz28">Справочники - Добавить способ приемки</span>
                <WeightIndicatorComponent/>
            </div>
        }

        <div className={`${s.contentBlock} df fdc`}>
            <div className={`${s.titleBlock} df fdc`}>
                <span className='fw600 fz20'>Добавить новый способ приемки</span>
                <span className='fz16'>Введите данные и нажмите кнопку “Добавить способ приемки”</span>
            </div>
            <div className={`${s.personalBlock} df fdc`}>
                <span className="fw600">Данные о способе приемки</span>
                <div className={`${s.inputBlock} df`}>
                    <InputComponent
                        type="default"
                        placeholder="Наименование"
                        state={name}
                        setState={setName}
                    />
                    <SelectComponent
                        placeholder={'Тип'}
                        items={receiveMethodItems}
                        state={type}
                        height={"50px"}
                        setState={setType}
                        loadingText={'Нет данных...'}
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
                    text="Добавить способ приемки" 
                    onClick={(e:any) => {
                        addHandler();
                    }}
                    disabled={isDisabled} 
                    variant='primary'
                />
                <ButtonComponent 
                    width='100%'
                    height='48px'
                    text="Вернуться назад" 
                    onClick={(e:any) => {navigate('/main/lists/acceptance-method')}}
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