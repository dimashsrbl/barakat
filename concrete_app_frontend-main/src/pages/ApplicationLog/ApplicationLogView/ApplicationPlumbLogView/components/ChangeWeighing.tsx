import { CloseIcon } from "assets/icons/Close"
import { useCallback, useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import { getApplicationsData } from "store/features/apiSlice"

import s from '../index.module.scss';
import { ConfirmChangeWeighingPopup } from "./ConfirmChangeWeighingPopup"

interface props {
    requestID?: any
    popup: boolean
    setPopup: Function
    refreshData: Function
}

export const ChangeWeighingPopup = ({ requestID, popup, setPopup, refreshData }: props) => {
    const [data, setData] = useState<any>([]);
    const [newRequestID, setNewRequestID] = useState('');
    const [clientCompanyName, setClientCompanyName] = useState('');
    const [objectName, setObjectName] = useState('');
    const [materialName, setMaterialName] = useState('');
    const [cubature, setCubature] = useState('');

    const [viewConfirmChangeWeighingPopup, setViewConfirmChangeWeighingPopup] = useState(false);

    const dispatch = useDispatch();

    const getRequests = useCallback(async () => {
        const response = await dispatch(getApplicationsData({ limit: 200 }));
        const responseData = response?.payload?.data?.requests || [];
        setData(responseData);
    }, [dispatch]);

    useEffect(() => {
        if (popup) document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, [popup]);

    useEffect(() => {
        getRequests();
    }, [getRequests])

    return (
        <div className="h100vh posf t0 l0 w100 df jcc aic" style={{ zIndex: '10', background: 'rgba(51, 51, 51, 0.55)' }}>
            {viewConfirmChangeWeighingPopup &&
                <ConfirmChangeWeighingPopup
                    requestID={requestID}
                    newRequestID={newRequestID}
                    popup={viewConfirmChangeWeighingPopup}
                    setPopup={setViewConfirmChangeWeighingPopup}
                    changeWeighingPopup={setPopup}
                    refreshData={refreshData}
                    clientCompanyName={clientCompanyName || ''}
                    objectName={objectName || ''}
                    materialName={materialName || ''}
                    cubature={cubature}
                />
            }
            <div className="df fdc w50" style={{ background: 'white', borderRadius: '32px', padding: '20px', gap: '20px' }}>
                <div className="df fdc">
                    <div className="df fdr jcsb aic">
                        <span className="fw700 fz20" style={{ marginRight: '30px' }}>Изменить привязку</span>
                        <div className="df jcc aic cp" onClick={() => setPopup(false)}><CloseIcon /></div>
                    </div>

                    <span className="fz14 cg">Выберите заявку к которому хотите привязать отвес</span>
                </div>

                <div className="df fdc">

                    <div className={`${s.row} df jcsb aic fz18 fw500`}>
                        <span className='w10'>ID</span>
                        <span className='w25'>Заказчик</span>
                        <span className='w25'>Объект</span>
                        <span className='w20'>МБ</span>
                        <span className='w20'>Куб.</span>
                    </div>
                    
                    <div className={`${s.changeWeighingRow} oa`}>
                        {data && data?.map((item: any, index: any) => (
                            <div className={`${s.secondrow} cp df jcsb aic fz16`}
                                onClick={() => { setNewRequestID(item?.id); setClientCompanyName(item?.client_company?.name); setObjectName(item?.object?.name); setMaterialName(item?.material?.name); setCubature(item?.purpose_cubature); setViewConfirmChangeWeighingPopup(true); }}
                                key={index}>
                                <span className='w10'>{item?.id}</span>
                                <span className='w25'>{item?.client_company?.company_type} {item?.client_company?.name}</span>
                                <span className='w25'>{item?.object?.name || '-'}</span>
                                <span className='w20'>{item?.material?.name || '-'}</span>
                                <span className='w20'>{item?.purpose_cubature || '-'}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}