import { useCallback, useEffect, useState } from 'react';

import { WeightIndicatorComponent } from 'ui/WeightIndicatorComponent'
import { InputComponent } from 'ui/InputComponent';
import { SelectComponent } from 'ui/SelectComponentAntd'
import { ButtonComponent } from 'ui/ButtonComponent';

import s from './index.module.scss'
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getConstructionTypesData, postAddConstructionsData } from 'store/features/apiSlice';
import { useWindowSize } from 'ui/UseWindowSizeComponent';

export const ConstructionsAddPage = () => {
    const [name, setName] = useState('');
    const [type, setType] = useState(null);
    const [description, setDescription] = useState('');
    const [isDisabled, setIsDisabled] = useState(true);
    const [responseError, setResponseError] = useState('');

    const [constructionTypeItems, setConstructionTypeItems] = useState<any>([]);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isMobile: boolean = useWindowSize();

    const getConstructionTypes = useCallback(async () => {
        const response = await dispatch(getConstructionTypesData());
        setConstructionTypeItems(response?.payload?.data);
    }, [dispatch]);

    const addHandler = async () => {
        setIsDisabled(true);
        const obj: any = {
            name: name,
            construction_type_id: constructionTypeItems.find((item: any) => item.name === type)?.id,
            description: description
        }
        const response = await dispatch(postAddConstructionsData(obj))
        if (response?.payload?.message === 'ok') {
            setIsDisabled(false);
            navigate('/main/lists/constructions')
        } else if (response?.error?.message.includes('401')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.')
            return
        } else if (response?.error?.message.includes('403')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.')
            return
        } else if (response?.error?.message.includes('404')) {
            setResponseError('Конструкция уже существует.');
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
        getConstructionTypes();
    }, [getConstructionTypes])

 return (
    <div className='main'>
        {isMobile &&
            <div className={`${s.toolbar} df fdr pa w100`}/>
        }
        {!isMobile && 
            <div className="df fdr jcsb aib">
                <span className="fz28">Справочники - Добавить конструкцию</span>
                <WeightIndicatorComponent/>
            </div>
        }
        <div className={`${s.contentBlock} df fdc`}>
            <div className={`${s.titleBlock} df fdc`}>
                <span className='fw600 fz20'>Добавить новую конструкцию</span>
                <span className='fz16'>Введите данные и нажмите кнопку “Добавить конструкцию”</span>
            </div>
            <div className={`${s.personalBlock} df fdc`}>
                <span className="fw600">Данные конструкции</span>
                <div className={`${s.inputBlock} df`}>
                    <InputComponent
                        type="default"
                        placeholder="Наименование"
                        state={name}
                        setState={setName}
                    />
                    <SelectComponent
                        placeholder={'Тип'}
                        items={constructionTypeItems}
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
                    text="Добавить конструкцию" 
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
                    onClick={(e:any) => {navigate('/main/lists/constructions')}}
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