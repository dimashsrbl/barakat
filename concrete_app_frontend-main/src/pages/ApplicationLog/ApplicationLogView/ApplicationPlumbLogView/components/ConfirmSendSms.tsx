import { CloseIcon } from "assets/icons/Close"
import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import { sendTelegramMessageData } from "store/features/apiSlice"
import { ButtonComponent } from "ui/ButtonComponent"

interface props {
    weighingID: any
    popup: boolean
    setPopup: Function
    refreshData: Function
}

export const ConfirmSendSMS = ({ weighingID, popup, setPopup, refreshData }: props) => {
    const [responseError, setResponseError] = useState('');

    const dispatch = useDispatch();

    const confirmSendSMS = async () => {
        const obj = {
            weighing_id: weighingID,
        }
        const response = await dispatch(sendTelegramMessageData(obj))
        if (response?.payload?.message === 'ok' || response?.payload?.statusCode === 200) {
            setPopup(false);
            refreshData();
        } else {
            setResponseError(response?.payload?.error?.message || 'Ошибка сервера');
            return
        }
    }

    useEffect(() => {
        if (popup) document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, [popup]);

    return (
        <div className="h100vh posf t0 l0 w100 df jcc aic" style={{ zIndex: '10', background: 'rgba(51, 51, 51, 0.55)' }}>
            <div className="df fdc w40" style={{ background: 'white', borderRadius: '32px', padding: '20px', gap: '15px' }}>
                <div className="df fdc" style={{ gap: '5px' }}>
                    <div className="df fdr jcsb aic">
                        <span className="fw700 fz20" style={{ marginRight: '30px' }}>Подтвердите отправку СМС</span>
                        <div className="df jcc aic cp" onClick={() => setPopup(false)}><CloseIcon /></div>
                    </div>
                </div>
                {responseError !== '' && <span style={{ color: '#EB5757', fontSize: '14px', marginLeft: '8px' }}>{responseError}</span>}
                <div className="df jcsb aic fz18" style={{ gap: '10px' }}>
                    <ButtonComponent
                        height='48px'
                        text='Подтвердить'
                        onClick={() => { confirmSendSMS() }}
                        disabled={false}
                        variant='primary'
                    />
                    <ButtonComponent
                        height='48px'
                        text='Отмена'
                        onClick={() => { setPopup(false) }}
                        disabled={false}
                        variant='deactivateLogButton'
                    />
                </div>
            </div>
        </div>
    )
}