import { CloseIcon } from "assets/icons/Close";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { putEditCompanyIsDebtorData } from "store/features/apiSlice";
import { ButtonComponent } from "ui/ButtonComponent";

interface props {
    companyID?: any
    popup: boolean
    setPopup: Function
    refreshData: Function
}

export const ShipmentResumptionPopup = ({ companyID, popup, setPopup, refreshData }: props) => {
    const [responseError, setResponseError] = useState('');

    const dispatch = useDispatch();

    const disableEnableHandler = async () => {
        const obj: any = {
            company_id: companyID,
            is_debtor: false,
            debtor_note: ''
        }
        const response = await dispatch(putEditCompanyIsDebtorData(obj))
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
    
    return (
        <div className="h100vh posf t0 l0 w100 df jcc aic" style={{ zIndex: '10', background: 'rgba(51, 51, 51, 0.55)' }}>
        <div className="df fdc w30" style={{ background: 'white', borderRadius: '32px', padding: '20px', gap: '15px'}}>
            <div className="df fdc" style={{gap: '5px'}}>
                <div className="df fdr jcsb aic">
                    <span className="fw700 fz20" style={{ marginRight: '30px' }}>Возобновление отгрузки</span>
                    <div className="df jcc aic cp" onClick={() => setPopup(false)}><CloseIcon /></div>
                </div>
                <div className="df fdc">
                    <span className="fz16">Вы действительно хотите возобновить отгрузку?</span>
                </div>
            </div>
            {responseError !== '' && <span style={{ color: '#EB5757', fontSize: '14px', marginLeft: '8px' }}>{responseError}</span>}
            <div className="df jcsb aic fz18" style={{ gap: '10px' }}>
                <ButtonComponent 
                    height='54px'
                    text='Подтвердить' 
                    onClick={() => {disableEnableHandler()}}
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