import { CloseIcon } from "assets/icons/Close"
import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import { putReconnectWeighingToRequestData } from "store/features/apiSlice"
import { ButtonComponent } from "ui/ButtonComponent"

interface props {
    requestID: any
    newRequestID: any
    popup: boolean
    setPopup: Function
    changeWeighingPopup: any
    refreshData: Function
    clientCompanyName: string
    objectName: string
    materialName: string
    cubature: any
}

export const ConfirmChangeWeighingPopup = ({ requestID, newRequestID, popup, setPopup, changeWeighingPopup, refreshData, clientCompanyName, objectName, materialName, cubature }: props) => {
    const [responseError, setResponseError] = useState('');

    const dispatch = useDispatch();

    const reconnectWeighingHandler = async () => {
        const obj = {
            id: requestID,
            new_request_id: newRequestID,
        }
        const response = await dispatch(putReconnectWeighingToRequestData(obj))
        if (response?.payload?.message === 'ok' || response?.payload?.statusCode === 200) {
            changeWeighingPopup(false);
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
                        <span className="fw700 fz20" style={{ marginRight: '30px' }}>Подтвердите перепривязку</span>
                        <div className="df jcc aic cp" onClick={() => setPopup(false)}><CloseIcon /></div>
                    </div>
                    <span>Перепривязка отвеса к заявке:<br /> <strong>Заказчик:</strong> {clientCompanyName || '-'} <br /><strong>Объект:</strong> {objectName || '-'} <br /><strong>МБ:</strong> {materialName || '-'} <br /><strong>Кубатура:</strong> {cubature || 0}</span>
                </div>
                {responseError !== '' && <span style={{ color: '#EB5757', fontSize: '14px', marginLeft: '8px' }}>{responseError}</span>}
                <div className="df jcsb aic fz18" style={{ gap: '10px' }}>
                    <ButtonComponent
                        height='54px'
                        text='Подтвердить'
                        onClick={() => { reconnectWeighingHandler() }}
                        disabled={false}
                        variant='primary'
                    />
                    <ButtonComponent
                        height='54px'
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