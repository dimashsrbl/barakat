import React, {useState, useCallback, useEffect} from 'react';

import { useDispatch } from 'react-redux';

import { WeightIndicatorComponent } from 'ui/WeightIndicatorComponent'
import { InputComponent } from 'ui/InputComponent';
import { SelectComponent } from 'ui/SelectComponentAntd'
import { ButtonComponent } from 'ui/ButtonComponent';

import { getVehicleDataById, putEditVehicleData, getCarrierData, patchIsActiveChangeVehicleData, getDriversData } from 'store/features/apiSlice';

import s from './index.module.scss'
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { numberRegex } from 'constDatas';
import { useWindowSize } from 'ui/UseWindowSizeComponent';

export const VehicleEditPage = () => {
    const { id } = useParams<{ id: string }>();
    const [plateNumber, setPlateNumber] = useState('');
    const [tare, setTare] = useState('');
    const [admissibleError, setAdmissibleError] = useState('');
    const [driver, setDriver] = useState(null);
    const [carrier, setCarrier] = useState(null);
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState(false);
    const [isDisabled, setIsDisabled] = useState(true);
    const [responseError, setResponseError] = useState('');

    const [carrierItems, setCarrierItems] = useState<any>([]);
    const [driverItems, setDriverItems] = useState<any>([]);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const isMobile = useWindowSize();

    const searchParams = new URLSearchParams(location.search);
    const queryIsActive = searchParams.get('is_active') ? searchParams.get('is_active') : true;
    const querySearchValue = searchParams.get('search_value');
    const queryCurrentPage = searchParams.get('current_page');

    const getDrivers = useCallback(async () => {
        const request = await dispatch(getDriversData());
        setDriverItems(request?.payload?.data);
    }, [dispatch]);

    const getCarriers = useCallback(async () => {
        const request = await dispatch(getCarrierData());
        setCarrierItems(request?.payload?.data);
    }, [dispatch]);

    const getVehicle = useCallback(async () => {
        const obj = {
            transport_id: id,
          }
        const request = await dispatch(getVehicleDataById(obj));
        const data = request?.payload?.data;
        setPlateNumber(data?.plate_number);
        setTare(data?.tare || '');
        setAdmissibleError(data?.admissible_error || '');
        setDriver(data?.driver?.name || null);
        setCarrier(data?.carrier?.name || null);
        setIsActive(data?.is_active);
    }, [dispatch, id]);


    const editHandler = async () => {
        setIsDisabled(true);
        const obj: any = {
            id: id,
            plate_number: plateNumber,
            driver_id: driverItems.find((item: any) => item.name === driver)?.id || null,
            admissible_error: (admissibleError !== null && Number(admissibleError) > 0) ? Number(admissibleError) : null,
            tare: (tare !== null && Number(tare) > 0) ? Number(tare) : null,
            carrier_id: carrierItems.find((item: any) => item.name === carrier)?.id || null,
            description: description
        }
        const response = await dispatch(putEditVehicleData(obj))
        if (response?.payload?.message === 'ok') {
            setIsDisabled(false);
            navigate(`/main/lists/vehicle?is_active=${queryIsActive}${querySearchValue !== 'null' ? `&search_value=${querySearchValue}` : ''}&current_page=${queryCurrentPage}`)
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
        const response = await dispatch(patchIsActiveChangeVehicleData(obj))
        if (response?.payload?.message === 'ok') {
            getVehicle();
        } else if (response?.error?.message.includes('401')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.');
            return
        } else if (response?.error?.message.includes('403')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.');
            return
        } else if (response?.error?.message.includes('404')) {
            setResponseError('Транспорт уже существует.');
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
        if (plateNumber !== '' && driver !== null && numberRegex.test(admissibleError) && carrier !== null && numberRegex.test(tare) && isActive) setIsDisabled(false);
        else setIsDisabled(true);
    }, [plateNumber, driver, admissibleError, carrier, tare, isActive]);

    useEffect(() => {
        getVehicle();
        getCarriers();
        getDrivers();
    }, [getVehicle, getCarriers, getDrivers]);

 return (
    <div className='main'>
        {isMobile &&
            <div className={`${s.toolbar} df fdr pa w100`}/>
        }
        {!isMobile &&
            <div className="df fdr jcsb aib">
                <span className="fz28">Справочники - Редактировать транспорт</span>
                <WeightIndicatorComponent/>
            </div>
        }

        <div className={`${s.contentBlock} df fdc`}>
            <div className={`${s.titleBlock} df jcsb`}>
                <div className='df fdc' style={{gap: '6px'}}>
                    <span className='fw600 fz20'>Редактировать транспорт</span>
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
                <span className="fw600">Данные о транспорте</span>
                <div className={`${s.inputBlock} df`}>
                    <InputComponent
                        type="default"
                        placeholder="Гос.номер"
                        state={plateNumber}
                        setState={setPlateNumber}
                    />
                    <InputComponent
                        type="default"
                        placeholder="Тара"
                        state={tare}
                        setState={setTare}
                        regex={numberRegex}
                        errortext={'Некорректное значение'}
                        onKeyDown={(e: any) => {
                            if (!numberRegex.test(e.key)) {
                                e.preventDefault();
                            }
                        }}
                    />
                    <InputComponent
                        type="default"
                        placeholder="Погрешность. %"
                        state={admissibleError}
                        setState={setAdmissibleError}
                        regex={numberRegex}
                        errortext={'Некорректное значение'}
                        onKeyDown={(e: any) => {
                            if (!numberRegex.test(e.key)) {
                                e.preventDefault();
                            }
                        }}
                    />
                </div>
            </div>

            <div className={`${s.vehicleDriverBlock} df fdc`}>
                <span className="fw600">Данные о водителе</span>
                <div className={`${s.inputBlock}  df`}>
                    <SelectComponent
                        placeholder={'Водитель'}
                        items={driverItems}
                        state={driver}
                        height={"50px"}
                        setState={setDriver}
                        loadingText={'Нет данных...'}
                    />
                    <SelectComponent
                        placeholder={'Перевозчик'}
                        items={carrierItems}
                        state={carrier}
                        height={"50px"}
                        setState={setCarrier}
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
                    text='Сохранить изменения' 
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
                    onClick={(e:any) => {navigate(`/main/lists/vehicle?is_active=${queryIsActive}${querySearchValue !== 'null' ? `&search_value=${querySearchValue}` : ''}&current_page=${queryCurrentPage}`)}}
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