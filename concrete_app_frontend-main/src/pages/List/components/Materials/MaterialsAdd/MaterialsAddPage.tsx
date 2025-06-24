import React, {useState, useCallback, useEffect} from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { postAddmaterialsData, getMaterialTypesData } from 'store/features/apiSlice'

import { WeightIndicatorComponent } from 'ui/WeightIndicatorComponent'
import { InputComponent } from 'ui/InputComponent';
import { SelectComponent } from 'ui/SelectComponentAntd'
import { ButtonComponent } from 'ui/ButtonComponent';

import s from './index.module.scss'
import { useWindowSize } from 'ui/UseWindowSizeComponent';

export const MaterialsAddPage = () => {
    const [name, setName] = useState('');
    const [materialType, setMaterialType] = useState(null);
    const [density, setDensity] = useState('');
    const [materialTypeItems, setMaterialTypeItems] = useState<any>([]);
    const [isDisabled, setIsDisabled] = useState(true);
    const [responseError, setResponseError] = useState('');
    const densityRegex = /^-?\d*\d*$|^Backspace$|^Delete$|^Escape$^$/;

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isMobile: boolean = useWindowSize();

    const getMaterialTypes = useCallback(async () => {
        const response = await dispatch(getMaterialTypesData());
        setMaterialTypeItems(response?.payload?.data);
    }, [dispatch]);

    const addHandler = async () => {
        setIsDisabled(true);
        const obj: any = {
            name: name,
            material_type_id: materialTypeItems.find((item: any) => item.name === materialType)?.id,
            density: (density !== null && Number(density) > 0) ? Number(density) : null
        }
        const response = await dispatch(postAddmaterialsData(obj))
        if (response?.payload?.message === 'ok') {
            setIsDisabled(false);
            navigate('/main/lists/materials')
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
        if (name !== '' && materialType !== null && densityRegex.test(density)) setIsDisabled(false);
        else setIsDisabled(true);
    }, [name, materialType, density]);

    useEffect(() => {
        getMaterialTypes();
    }, [getMaterialTypes]);

 return (
    <div className='main'>
        {isMobile &&
            <div className={`${s.toolbar} df fdr pa w100`}/>
        }
        {!isMobile && 
            <div className="df fdr jcsb aib">
                <span className="fz28">Справочники - Добавить материал</span>
                <WeightIndicatorComponent/>
            </div>
        }

        <div className={`${s.contentBlock} df fdc`}>
            <div className={`${s.titleBlock} df fdc`}>
                <span className='fw600 fz20'>Добавить новый материал</span>
                <span className='fz16'>Введите данные и нажмите кнопку “Добавить материал”</span>
            </div>
            <div className={`${s.personalBlock} df fdc`}>
                <span className="fw600">Данные материала</span>
                <div className={`${s.inputBlock} df`}>
                    <InputComponent
                        type="default"
                        placeholder="Наименование"
                        state={name}
                        setState={setName}
                    />
                    <SelectComponent
                        placeholder={'Тип'}
                        items={materialTypeItems}
                        state={materialType}
                        height={"50px"}
                        setState={setMaterialType}
                        loadingText={'Нет данных...'}
                    />
                    <InputComponent
                        type='default'
                        regex={densityRegex}
                        errortext={'Некорректное значение'}
                        placeholder='Удельный вес, кг/м3'
                        state={density}
                        setState={setDensity}
                        onKeyDown={(e: any) => {
                            if (!densityRegex.test(e.key)) {
                                e.preventDefault();
                            }
                        }}
                    />
                </div>
            </div>
            <div className={`${s.actionButtons} df fdr w50`}>
                <ButtonComponent 
                    width='100%'
                    height='48px'
                    text='Добавить материал' 
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
                    onClick={(e:any) => {navigate('/main/lists/materials')}}
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