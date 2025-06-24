import React, { useCallback, useState, useEffect,  } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';


import { getMaterialDataById, putEditMaterialsData, getMaterialTypesData, patchIsActiveChangeMaterialData } from 'store/features/apiSlice'

import { WeightIndicatorComponent } from 'ui/WeightIndicatorComponent'
import { InputComponent } from 'ui/InputComponent';
import { SelectComponent } from 'ui/SelectComponentAntd'
import { ButtonComponent } from 'ui/ButtonComponent';

import { materialTypes } from 'constDatas';

import s from './index.module.scss'
import { useWindowSize } from 'ui/UseWindowSizeComponent';

export const MaterialsEditPage = () => {
    const { id } = useParams<{ id: string }>();
    const [name, setName] = useState('');
    const [materialType, setMaterialType] = useState(null);
    const [density, setDensity] = useState('');
    const [materialTypeItems, setMaterialTypeItems] = useState<any>([]);
    const [isActive, setIsActive] = useState(false);
    const [isDisabled, setIsDisabled] = useState(true);
    const [responseError, setResponseError] = useState('');
    const densityRegex = /^-?\d*\d*$|^Backspace$|^Delete$|^Escape$^$/;

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const isMobile = useWindowSize();

    const searchParams = new URLSearchParams(location.search);
    const queryIsActive = searchParams.get('is_active') ? searchParams.get('is_active') : true;
    const querySearchValue = searchParams.get('search_value');
    const queryCurrentPage = searchParams.get('current_page');

    const getMaterialTypes = useCallback(async () => {
        const response = await dispatch(getMaterialTypesData());
        setMaterialTypeItems(response?.payload?.data);
    }, [dispatch]);

    const getMaterial = useCallback(async () => {
        const obj = {
            material_id: id,
        }
        const request = await dispatch(getMaterialDataById(obj));
        const data = request?.payload?.data;
        setName(data?.name);
        setDensity(data?.density);
        setMaterialType(data?.material_type?.name);
        setIsActive(data?.is_active);
    }, [dispatch, id]);

    const editHandler = async () => {
        setIsDisabled(true);
        const obj: any = {
            material_id: id,
            name: name,
            material_type_id: materialTypeItems.find((item: any) => item.name === materialType)?.id,
            density: (density !== null && Number(density) > 0) ? Number(density) : null
        }
        const response = await dispatch(putEditMaterialsData(obj))
        if (response?.payload?.message === 'ok') {
            setIsDisabled(false);
            navigate(`/main/lists/materials?is_active=${queryIsActive}${querySearchValue !== 'null' ? `&search_value=${querySearchValue}` : ''}&current_page=${queryCurrentPage}`)
        } else if (response?.error?.message.includes('401')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.')
            return
        } else if (response?.error?.message.includes('403')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.')
            return
        } else {
            setResponseError('Ошибка сервера')
            return
        }
    }

    const disableEnableHandler = async (is_active: boolean) => {
        const obj: any = {
            id: id,
            is_active: is_active
        }
        const response = await dispatch(patchIsActiveChangeMaterialData(obj))
        if (response?.payload?.message === 'ok') {
            getMaterial();
        } else if (response?.error?.message.includes('401')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.');
            return
        } else if (response?.error?.message.includes('403')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.');
            return
        } else if (response?.error?.message.includes('404')) {
            setResponseError('Материал уже существует.');
            return
        }  else if (response?.error?.message.includes('400')) {
            setResponseError('Некорректный запрос. Пожалуйста, убедитесь, что введенные данные соответствуют требованиям и повторите попытку.');
            return
        } else {
            setResponseError('Ошибка сервера');
            return
        }
    }

    useEffect(() => {
        if (name !== '' && materialType !== null && density !== '' && isActive) setIsDisabled(false);
        else setIsDisabled(true);
    }, [name, materialType, density, isActive]);

    useEffect(() => {
        getMaterial();
        getMaterialTypes();
    }, [getMaterial, getMaterialTypes]);

 return (
    <div className='main'>
        {isMobile &&
            <div className={`${s.toolbar} df fdr pa w100`}/>
        }
        {!isMobile &&
            <div className="df fdr jcsb aib">
                <span className="fz28">Справочники - Редактировать материал</span>
                <WeightIndicatorComponent/>
            </div>
        }

        <div className={`${s.contentBlock} df fdc`}>
            <div className={`${s.titleBlock} df jcsb`}>
                <div className='df fdc' style={{gap: '6px'}}>
                    <span className='fw600 fz20'>Редактировать материал</span>
                    <span className='fz16'>Измените данные и нажмите кнопку “Сохранить изменения”</span>
                </div>
                {isActive ? (
                    <ButtonComponent 
                    width='200px'
                    height='48px'
                    text="Деактивировать"
                    onClick={() => {disableEnableHandler(!isActive)}}
                    disabled={false} 
                    variant='deactivateButton'
                />
                ) : (
                    <ButtonComponent 
                    width='200px'
                    height='48px'
                    text='Активировать'
                    onClick={() => {disableEnableHandler(!isActive)}}
                    disabled={false} 
                    variant='activateButton'
                />  
                )}
            </div>

            <div className={`${s.personalBlock} df fdc`}>
                <span className="fw600">Данные материала</span>
                <div className={`${s.inputBlock} df`}>
                    <InputComponent
                        type='default'
                        placeholder='Наименование'
                        state={name}
                        setState={setName}
                    />
                    <SelectComponent
                        placeholder={'Тип'}
                        items={materialTypes}
                        state={materialType}
                        height={'50px'}
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
                    text="Сохранить изменения" 
                    onClick={(e: any) => {
                        editHandler();
                    }}
                    disabled={isDisabled}
                    variant='primary'
                />
                <ButtonComponent 
                    width='100%'
                    height='48px'
                    text="Вернуться назад" 
                    onClick={(e:any) => {navigate(`/main/lists/materials?is_active=${queryIsActive}${querySearchValue !== 'null' ? `&search_value=${querySearchValue}` : ''}&current_page=${queryCurrentPage}`)}}
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