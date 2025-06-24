import { CloseIcon } from "assets/icons/Close"
import { useCallback, useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import { getConcreteMixingPlantData, putChangeCmpAndCubatureData } from "store/features/apiSlice"
import { ButtonComponent } from "ui/ButtonComponent"
import { InputComponent } from "ui/InputComponent"
import { SelectComponent } from "ui/SelectComponentAntd"

interface props {
    selected?: any
    popup: boolean
    setPopup: Function
    refreshData: Function
    weighingID?: any
    oldCubature?: any
    oldBSUNumber?: any
}

export const ChangeBSUCubaturePopup = ({ weighingID, oldCubature, oldBSUNumber, popup, setPopup, refreshData }: props) => {
    const [bsuNumber, setBsuNumber] = useState(oldBSUNumber);
    const [cubature, setCubature] = useState(oldCubature);
    const [isDisabled, setIsDisabled] = useState(true);
    const [responseError, setResponseError] = useState('');

    const [bsuItems, setBsuItems] = useState<any>([]);

    const dispatch = useDispatch();

    async function changeBsuHandler() {
        const obj = {
            id: weighingID,
            concrete_mixing_plant_id: bsuItems.find((item: any) => item.name === bsuNumber)?.id,
            cubature: cubature ? cubature.toString().replace(/,/g, '.') : cubature
        }
        const response = await dispatch(putChangeCmpAndCubatureData(obj))
        if (response?.payload?.message === 'ok') {
            refreshData();
            setPopup(false);
        } else if (response?.error?.message.includes('400')) {
            setResponseError('Некорректный запрос. Пожалуйста, убедитесь, что введенные данные соответствуют требованиям и повторите попытку.')
            return
        } else if (response?.error?.message.includes('403')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.')
            return
        } else if (response?.error?.message.includes('401')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.')
            return
        } else {
            setResponseError('Ошибка сервера')
            return
        }
    }

    const getBSU = useCallback(async () => {
        const request = await dispatch(getConcreteMixingPlantData());
        setBsuItems(request?.payload?.data);
    }, [dispatch]);


    useEffect(() => {
        if (popup) document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, [popup]);

    useEffect(() => {
        if (bsuNumber !== null && cubature !== '') {
            setIsDisabled(false)
        } else setIsDisabled(true)
    }, [bsuNumber, cubature]);

    useEffect(() => {
        getBSU();
    }, [getBSU])
    
    return (
        <div className="h100vh posf t0 l0 w100 df jcc aic" style={{ zIndex: '10', background: 'rgba(51, 51, 51, 0.55)' }}>
                <div className="df fdc w30" style={{ background: 'white', borderRadius: '32px', padding: '20px', gap: '15px' }}>
                    <div className="df jcsb aic">
                        <span className="fw700 fz20" style={{ marginRight: '30px' }}>Изменить БСУ и Куб.</span>
                        <div className="df jcc aic cp" onClick={() => setPopup(false)}><CloseIcon /></div>
                    </div>
                    <div className="df fdc" style={{gap: '10px'}}>
                        <SelectComponent
                            placeholder={'Номер БСУ'}
                            items={bsuItems}
                            state={bsuNumber}
                            height={'50px'}
                            setState={setBsuNumber}
                            loadingText={'Нет данных...'}
                        />
                        <InputComponent
                            type='default'
                            placeholder='Кубатура'
                            state={cubature}
                            setState={setCubature}
                        />
                        {responseError !== '' && <span style={{ color: '#EB5757', fontSize: '14px', marginLeft: '8px' }}>{responseError}</span>}
                    </div>
                    <div className="df jcsb aic fz18" style={{ gap: '10px' }}>
                        <ButtonComponent 
                            height='54px'
                            text='Сохранить' 
                            onClick={() => {changeBsuHandler()}}
                            disabled={isDisabled}
                            variant='primary'
                        />
                        <ButtonComponent 
                            height='54px'
                            text='Отменить' 
                            onClick={() => {setPopup(false)}}
                            disabled={false}
                            variant='deactivateLogButton'
                        />
                    </div>
                </div>
        </div>
    )
}