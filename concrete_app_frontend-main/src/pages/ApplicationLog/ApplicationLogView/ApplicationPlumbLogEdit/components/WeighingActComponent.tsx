import { parseDate } from 'constDatas';

interface props {
    weighData: any
}

export const ApplicationLogWeighingAct = ({weighData}: props) => {
    return (
        <div className='df fdc' style={{gap: "30px"}}>
            <div className='firstBlock df fdr' style={{alignItems: "center"}}>
                <div className="firstBlockLeft df fdc" style={{width: "100%", gap: "10px"}}>
                    <ul className="df fdc" style={{gap: '10px', paddingLeft: 0}}>
                        <div className="df fdr" style={{gap: '6em'}}>
                            <li style={{fontSize: "18px", width: '35%'}}><strong>Акт взвешивания</strong></li>
                            <li>{weighData?.id}</li>
                        </div>
                    </ul>
                    
                    <ul className='df fdc' style={{gap: "10px", paddingLeft: 0 }}>
                        <div className='df fdr' style={{gap: '6em'}}>
                            <li style={{ width: '35%' }}>Номер и марка транспорта</li>
                            <li>{weighData?.plate_number}</li>
                        </div>
                        <div className="df fdr" style={{gap: '6em'}}>
                            <li style={{ width: '35%' }}>Брутто, тара, нетто</li>
                            <li>{weighData?.brutto || 0}кг, {weighData?.tare || 0}кг, {weighData?.netto || 0} <strong>КГ</strong></li>
                        </div>
                        <div className="df fdr" style={{gap: '6em'}}>
                            <li style={{ width: '35%' }}>1-е взвешив: оператор, дата, вес</li>
                            <li>{weighData?.first_operator}, {parseDate(weighData?.first_at)}, {weighData?.tare}кг</li>
                        </div>
                        <div className="df fdr" style={{gap: '6em'}}>
                            <li style={{ width: '35%' }}>2-е взвешив: оператор, дата, вес</li>
                            <li></li>
                        </div>
                        <div className="df fdr" style={{gap: '6em'}}>
                            <li style={{ width: '35%' }}>Номер и серия накладной</li>
                            <li>{weighData?.id}</li>
                        </div>
                        <div className="df fdr" style={{gap: '6em'}}>
                            <li style={{ width: '35%' }}>Продукт, артикул, номенкл.номер</li>
                            <li>{weighData?.material_name}</li>
                        </div>
                        <div className="df fdr" style={{gap: '6em'}}>
                            <li style={{ width: '35%' }}>Заказчик:</li>
                            <li>{weighData?.client_company_type} {weighData?.client_company} {weighData?.object_name}</li>
                        </div>
                        <div className="df fdr" style={{gap: '6em'}}>
                            <li style={{ width: '35%' }}>Перевозчик:</li>
                            <li>{weighData?.carrier_name}</li>
                        </div>
                        <div className="df fdr" style={{gap: '6em'}}>
                            <li style={{ width: '35%' }}>Кол-во бетона м3</li>
                            <li>{weighData?.cubature}</li>
                        </div>
                        <div className="df fdr" style={{gap: '6em'}}>
                            <li style={{ width: '35%' }}>Осадок конуса, конструкция</li>
                            <li>{weighData?.cone_draft}, {weighData?.construction_name}</li>
                        </div>
                        <div className="df fdr" style={{gap: '6em'}}>
                            <li style={{ width: '35%' }}>Номер БСУ</li>
                            <li>{weighData?.bsu_number}</li>
                        </div>
                    </ul>
                </div>
            </div>

            <div className='firstBlock df fdr' style={{alignItems: "center"}}>
                <div className="firstBlockLeft df fdc" style={{width: "100%", gap: "10px"}}>
                    <ul className="df fdc" style={{gap: '10px', paddingLeft: 0}}>
                        <div className="df fdr" style={{gap: '6em'}}>
                            <li style={{fontSize: "18px", width: '35%'}}><strong>Акт взвешивания</strong></li>
                            <li>{weighData?.id}</li>
                        </div>
                    </ul>
                    
                    <ul className='df fdc' style={{gap: "10px", paddingLeft: 0 }}>
                        <div className='df fdr' style={{gap: '6em'}}>
                            <li style={{ width: '35%' }}>Номер и марка транспорта</li>
                            <li>{weighData?.plate_number}</li>
                        </div>
                        <div className="df fdr" style={{gap: '6em'}}>
                            <li style={{ width: '35%' }}>Брутто, тара, нетто</li>
                            <li>{weighData?.brutto || 0}кг, {weighData?.tare || 0}кг, {weighData?.netto || 0} <strong>КГ</strong></li>
                        </div>
                        <div className="df fdr" style={{gap: '6em'}}>
                            <li style={{ width: '35%' }}>1-е взвешив: оператор, дата, вес</li>
                            <li>{weighData?.first_operator}, {parseDate(weighData?.first_at)}, {weighData?.tare}кг</li>
                        </div>
                        <div className="df fdr" style={{gap: '6em'}}>
                            <li style={{ width: '35%' }}>2-е взвешив: оператор, дата, вес</li>
                            <li></li>
                        </div>
                        <div className="df fdr" style={{gap: '6em'}}>
                            <li style={{ width: '35%' }}>Номер и серия накладной</li>
                            <li>{weighData?.id}</li>
                        </div>
                        <div className="df fdr" style={{gap: '6em'}}>
                            <li style={{ width: '35%' }}>Продукт, артикул, номенкл.номер</li>
                            <li>{weighData?.material_name}</li>
                        </div>
                        <div className="df fdr" style={{gap: '6em'}}>
                            <li style={{ width: '35%' }}>Заказчик:</li>
                            <li>{weighData?.client_company_type} {weighData?.client_company} {weighData?.object_name}</li>
                        </div>
                        <div className="df fdr" style={{gap: '6em'}}>
                            <li style={{ width: '35%' }}>Перевозчик:</li>
                            <li>{weighData?.carrier_name}</li>
                        </div>
                        <div className="df fdr" style={{gap: '6em'}}>
                            <li style={{ width: '35%' }}>Кол-во бетона м3</li>
                            <li>{weighData?.cubature}</li>
                        </div>
                        <div className="df fdr" style={{gap: '6em'}}>
                            <li style={{ width: '35%' }}>Осадок конуса, конструкция</li>
                            <li>{weighData?.cone_draft}, {weighData?.construction_name}</li>
                        </div>
                        <div className="df fdr" style={{gap: '6em'}}>
                            <li style={{ width: '35%' }}>Номер БСУ</li>
                            <li>{weighData?.bsu_number}</li>
                        </div>
                    </ul>
                </div>
            </div>
        </div>
    )
}