import { CloseIcon } from "assets/icons/Close"
import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import { patchIsActiveChangeRequestData } from "store/features/apiSlice"
import { ButtonComponent } from "ui/ButtonComponent"

interface props {
    requestID?: any
    popup: boolean
    setPopup: Function
    refreshData: Function
}

export const DisableWeighingPopup = ({ requestID, popup, setPopup, refreshData }: props) => {
    const [responseError, setResponseError] = useState('');

    const dispatch = useDispatch();

    const disableHandler = async () => {
        console.log(requestID)
        setResponseError('');
        const obj: any = {
            id: requestID,
            is_active: false
        }
        const response = await dispatch(patchIsActiveChangeRequestData(obj))
        if (response?.payload?.message === 'ok' || response?.payload?.statusCode === 200) {
            setPopup(false);
            refreshData();
        } else {
            setResponseError(response.payload.error.message || 'Ошибка сервера');
            return
        }
    }

    useEffect(() => {
        if (popup) document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, [popup]);
    
    return (
        <div className="h100vh posf t0 l0 w100 df jcc aic" style={{ zIndex: '10', background: 'rgba(51, 51, 51, 0.55)' }}>
                <div className="df fdc w30" style={{ background: 'white', borderRadius: '32px', padding: '20px', gap: '15px'}}>
                    <div className="df fdc" style={{gap: '5px'}}>
                        <div className="df fdr jcsb aic">
                            <span className="fw700 fz20" style={{ marginRight: '30px' }}>Подтвердите деактивацию</span>
                            <div className="df jcc aic cp" onClick={() => setPopup(false)}><CloseIcon /></div>
                        </div>
                        <div className="df fdc">
                            <span className="fz16">Выполняемое действие невозвратимо</span>
                        </div>
                    </div>
                    {responseError !== '' && <span style={{ color: '#EB5757', fontSize: '14px', marginLeft: '8px' }}>{responseError}</span>}
                    <div className="df jcsb aic fz18" style={{ gap: '10px' }}>
                        <ButtonComponent 
                            height='54px'
                            text='Да, деактивировать' 
                            onClick={() => {disableHandler()}}
                            disabled={false}
                            variant='deactivateButton'
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