import {useState, useCallback, useEffect} from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { postAddVehicleData, getCarrierData, getDriversData, getCurrentUserData, selectUser } from 'store/features/apiSlice';

import { WeightIndicatorComponent } from 'ui/WeightIndicatorComponent'
import { InputComponent } from 'ui/InputComponent';
import { SelectComponent } from 'ui/SelectComponentAntd'
import { ButtonComponent } from 'ui/ButtonComponent';

import s from './index.module.scss'
import { useNavigate } from 'react-router-dom';
import { numberRegex } from 'constDatas';
import { useWindowSize } from 'ui/UseWindowSizeComponent';

export const VehicleAddPage = () => {
    const [plateNumber, setPlateNumber] = useState('');
    const [tare, setTare] = useState('');
    const [admissibleError, setAdmissibleError] = useState('');
    const [driver, setDriver] = useState(null);
    const [carrier, setCarrier] = useState(null);
    const [description, setDescription] = useState('');
    const [isDisabled, setIsDisabled] = useState(true);
    const [responseError, setResponseError] = useState('');

    const [carrierItems, setCarrierItems] = useState<any>([]);
    const [driverItems, setDriverItems] = useState<any>([]);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const isMobile: boolean = useWindowSize();

    const getCarriers = useCallback(async () => {
        const request = await dispatch(getCarrierData());
        setCarrierItems(request?.payload?.data);
    }, [dispatch]);

    const getDrivers = useCallback(async () => {
        const request = await dispatch(getDriversData());
        setDriverItems(request?.payload?.data);
    }, [dispatch]);

    const addHandler = async () => {
        if (!user || user.role?.name !== 'Поставщик') {
            setResponseError('Недостаточно прав для выполнения этого запроса.');
            return;
        }
        setIsDisabled(true);
        const obj: any = {
            plate_number: plateNumber,
            driver_id: driverItems.find((item: any) => item.name === driver)?.id || null,
            admissible_error: (admissibleError !== null && Number(admissibleError) > 0) ? Number(admissibleError) : null,
            tare: (tare !== null && Number(tare) > 0) ? Number(tare) : null,
            carrier_id: carrierItems.find((item: any) => item.name === carrier)?.id || null,
            description: description
        }
        const response = await dispatch(postAddVehicleData(obj))
        if (response?.payload?.message === 'ok') {
            setIsDisabled(false);
            navigate('/main/lists/vehicle')
        } else if (response?.error?.message.includes('401')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.')
            return
        } else if (response?.error?.message.includes('403')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.')
            return
        } else if (response?.error?.message.includes('404')) {
            setResponseError('Транспорт уже существует.');
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
        dispatch(getCurrentUserData());
        getCarriers();
        getDrivers();
    }, [dispatch, getCarriers, getDrivers]);

    useEffect(() => {
        if (plateNumber !== '' && driver !== null && numberRegex.test(admissibleError) && carrier !== null && numberRegex.test(tare)) setIsDisabled(false);
        else setIsDisabled(true);
    }, [plateNumber, driver, admissibleError, carrier, tare]);

 return (
    <div className='main'>
        {isMobile &&
            <div className={`${s.toolbar} df fdr pa w100`}/>
        }
        {!isMobile && 
            <div className="df fdr jcsb aib">
                <span className="fz28">Справочники - Добавить транспорт</span>
                <WeightIndicatorComponent/>
            </div>
        }

        <div className={`${s.contentBlock} df fdc`}>
            <div className={`${s.titleBlock} df fdc`}>
                <span className='fw600 fz20'>Добавить новый транспорт</span>
                <span className='fz16'>Введите данные и нажмите кнопку "Добавить транспорт"</span>
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
                        errortext={'Некорректное значение'}
                        regex={numberRegex}
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
                    text='Добавить транспорт' 
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
                    onClick={() => {navigate('/main/lists/vehicle')}}
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