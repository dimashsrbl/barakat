import { CloseIcon } from "assets/icons/Close"
import { formatAPIDateTime, numberRegex } from "constDatas"
import dayjs from "dayjs"
import { useCallback, useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import { getUsersData, putChangeMonitoringWeighingData } from "store/features/apiSlice"
import { ButtonComponent } from "ui/ButtonComponent"
import { DatePickerComponent } from "ui/DatePickerComponent"
import { InputComponent } from "ui/InputComponent"
import { SelectComponent } from "ui/SelectComponentAntd"

interface props {
    weighingID?: any
    oldTareWeight?: any
    oldBruttoWeight?: any
    oldFirstOperator?: any
    oldSecondOperator?: any
    oldFirstAt?: any
    oldSecondAt?: any
    oldDescription?: any
    oldBagDetails?: any
    popup: boolean
    setPopup: Function
    refreshData: Function
}

export const EditWeighingPopup = ({ weighingID, oldTareWeight, oldBruttoWeight, oldFirstOperator, oldSecondOperator, oldFirstAt, oldSecondAt, oldDescription, oldBagDetails, popup, setPopup, refreshData }: props) => {
    const [tareWeight, setTareWeight] = useState(oldTareWeight);
    const [bruttoWeight, setBruttoWeight] = useState(oldBruttoWeight);
    const [firstOperator, setFirstOperator] = useState(oldFirstOperator);
    const [secondOperator, setSecondOperator] = useState(oldSecondOperator);
    const [bagDetails, setBagDetails] = useState(oldBagDetails);
    const [firstAt, setFirstAt] = useState(dayjs(oldFirstAt));
    const [secondAt, setSecondAt] = useState(dayjs(oldSecondAt));
    const [responseError, setResponseError] = useState('');
    const [description, setDescription] = useState(oldDescription || '');
    const [isDisabled, setIsDisabled] = useState(true);
    
    const [userItems, setUserItems] = useState<any>([]);

    const dispatch = useDispatch();

    const getUsers = useCallback(async () => {
        const response = await dispatch(getUsersData());
        const responseData = response?.payload?.data || []
        setUserItems(responseData);
    }, [dispatch]);

    const editHandler = async () => {
        const obj: any = {
            id: weighingID,
            tare_weight: Number(tareWeight),
            brutto_weight: Number(bruttoWeight),
            first_at: formatAPIDateTime(firstAt),
            second_at: formatAPIDateTime(secondAt),
            first_operator_id: userItems.find((item: any) => item.fullname === firstOperator)?.id,
            second_operator_id: userItems.find((item: any) => item.fullname === secondOperator)?.id,
            adjust_note: description,
            bag_details: bagDetails,
        }
        const response = await dispatch(putChangeMonitoringWeighingData(obj))
        if (response?.payload?.message === 'ok') {
            setPopup(false);
            refreshData();
        } else if (response?.error?.message.includes('401')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.');
            return
        } else if (response?.error?.message.includes('403')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.');
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
        if (popup) document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, [popup]);

    useEffect(() => {
        if (bruttoWeight !== '' && tareWeight !== '' && (bruttoWeight > tareWeight) && firstAt !== null && secondAt !== null && firstOperator !== null && secondOperator !== null && description !== '') setIsDisabled(false);
        else setIsDisabled(true);
    }, [bruttoWeight, tareWeight, firstAt, secondAt, firstOperator, secondOperator, description]);

    useEffect(() => {
        getUsers();
    }, [getUsers])
    
    return (
        <div className="h100vh posf t0 l0 w100 df jcc aic" style={{ zIndex: '10', background: 'rgba(51, 51, 51, 0.55)' }}>
                <div className="df fdc w30" style={{ background: 'white', borderRadius: '32px', padding: '20px', gap: '15px'}}>
                    <div className="df fdc" style={{gap: '5px'}}>
                        <div className="df fdr jcsb aic">
                            <span className="fw700 fz20" style={{ marginRight: '30px' }}>Редактировать данные по мониторингу</span>
                            <div className="df jcc aic cp" onClick={() => setPopup(false)}><CloseIcon /></div>
                        </div>
                    </div>
                    <div className="df fdc" style={{gap: '8px'}}>
                        <InputComponent
                            type='default'
                            placeholder='Тара'
                            state={tareWeight}
                            setState={setTareWeight}
                            regex={numberRegex}
                            errortext={'Некорректное значение'}
                            onKeyDown={(e: any) => {
                                if (!numberRegex.test(e.key)) {
                                    e.preventDefault();
                                }
                            }}
                        />
                        <InputComponent
                            type='default'
                            placeholder='Брутто'
                            state={bruttoWeight}
                            setState={setBruttoWeight}
                            regex={numberRegex}
                            errortext={'Некорректное значение'}
                            onKeyDown={(e: any) => {
                                if (!numberRegex.test(e.key)) {
                                    e.preventDefault();
                                }
                            }}
                        />
                        <SelectComponent
                            placeholder={'Оператор первого взвешивания'}
                            items={userItems}
                            state={firstOperator}
                            setState={setFirstOperator}
                            height={"48px"}
                            loadingText={'Нет данных...'}
                        />
                        <SelectComponent
                            placeholder={'Оператор второго взвешивания'}
                            items={userItems}
                            state={secondOperator}
                            setState={setSecondOperator}
                            height={"48px"}
                            loadingText={'Нет данных...'}
                        />
                        <DatePickerComponent
                            placeholder='Дата-время первого взвешивания'
                            showTime
                            height={'48px'}
                            format={'DD/MM/YYYY - HH:mm'}
                            state={firstAt}
                            setState={setFirstAt}
                        />
                        <DatePickerComponent
                            placeholder='Дата-время второго взвешивания'
                            showTime
                            height={'48px'}
                            format={'DD/MM/YYYY - HH:mm'}
                            state={secondAt}
                            setState={setSecondAt}
                        />
                        {oldBagDetails !== undefined &&  
                            <InputComponent
                                type='default'
                                placeholder='Количество мешков'
                                state={bagDetails}
                                setState={setBagDetails}
                            />
                        }
                        <InputComponent
                            type='default'
                            placeholder='Примечание'
                            state={description}
                            setState={setDescription}
                        />
                    </div>
                    {responseError !== '' && <span style={{ color: '#EB5757', fontSize: '14px', marginLeft: '8px' }}>{responseError}</span>}
                    <div className="df jcsb aic fz18" style={{ gap: '10px' }}>
                        <ButtonComponent 
                            height='54px'
                            text='Подтвердить' 
                            onClick={() => {editHandler()}}
                            disabled={isDisabled}
                            variant='primary'
                        />
                        <ButtonComponent 
                            height='54px'
                            text='Отмена' 
                            onClick={() => {setPopup(false)}}
                            disabled={false}
                            variant='deactivateLogButton'
                        />
                    </div>
                </div>
        </div>
    )
}