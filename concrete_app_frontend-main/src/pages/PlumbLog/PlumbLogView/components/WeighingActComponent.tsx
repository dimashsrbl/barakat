import { parseDate } from 'constDatas';

interface props {
    weighData: any
}

export const WeighingAct = ({weighData}: props) => {
    return (
        <div className='df fdc' style={{gap: "30px"}}>
            <div className='firstBlock df fdr' style={{alignItems: "center"}}>
                <div className="firstBlockLeft df fdc" style={{width: "100%", gap: "10px"}}>
                    <span style={{fontSize: "18px"}}><strong>Акт взвешивания №{weighData?.id}</strong></span>
                    <ul className='df fdc' style={{gap: "10px"}}>
                        <li>Поставщик: {weighData?.seller_company_type} {weighData?.seller_company}</li>
                        <li>Заказчик: {weighData?.client_company_type} {weighData?.client_company}</li>
                        <li>Гос.номер: {weighData?.plate_number}</li>
                        <li>Водитель: {weighData?.driver_name}</li>
                        <li>Материал: {weighData?.material_name}</li>
                        <li>Перевозчик: {weighData?.carrier_name}</li>
                    </ul>
                </div>
            </div>
            <div className="secondBlock df fdc" style={{gap: "10px"}}>
                <div>
                    <span>Данные по весу:</span>
                </div>
                <div>
                <table className="custom-table" style={{width: "50%"}}>
                    <thead>
                        <tr>
                        <th>Брутто, кг</th>
                        <th>Тара, кг</th>
                        <th>Нетто, кг</th>
                        <th>Номер силоса</th>
                        <th>Кол-во мешков</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                        <td>{weighData?.brutto || '-'}</td>
                        <td>{weighData?.tare || '-'}</td>
                        <td>{weighData?.netto || '-'}</td>
                        <td>{weighData?.silo_number || '-'}</td>
                        <td>{weighData?.bag_details || '-'}</td>
                        </tr>
                    </tbody>
                </table>
                </div>
            </div>

            <div className="thirdBlock">
            <table className="custom-table" style={{width: "80%"}}>
                    <thead>
                        <tr>
                        <th></th>
                        <th>Первое взвешивание</th>
                        <th>Второе взвешивание</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Оператор</td>
                            <td>{weighData?.first_operator || '-'}</td>
                            <td>{weighData?.second_operator || '-'}</td>
                        </tr>
                        <tr>
                            <td>Дата и время</td>
                            <td>{parseDate(weighData?.first_at)}</td>
                            <td>{parseDate(weighData?.second_at)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className='firstBlock df fdr' style={{alignItems: "center"}}>
                <div className="firstBlockLeft df fdc" style={{width: "100%", gap: "10px"}}>
                    <span style={{fontSize: "18px"}}><strong>Акт взвешивания №{weighData?.id}</strong></span>
                    <ul className='df fdc' style={{gap: "10px"}}>
                        <li>Поставщик: {weighData?.seller_company_type} {weighData?.seller_company}</li>
                        <li>Заказчик: {weighData?.client_company_type} {weighData?.client_company}</li>
                        <li>Гос.номер: {weighData?.plate_number}</li>
                        <li>Водитель: {weighData?.driver_name}</li>
                        <li>Материал: {weighData?.material_name}</li>
                        <li>Перевозчик: {weighData?.carrier_name}</li>
                    </ul>
                </div>
            </div>
            <div className="secondBlock df fdc" style={{gap: "10px"}}>
                <div>
                    <span>Данные по весу:</span>
                </div>
                <div>
                <table className="custom-table" style={{width: "50%"}}>
                    <thead>
                        <tr>
                        <th>Брутто, кг</th>
                        <th>Тара, кг</th>
                        <th>Нетто, кг</th>
                        <th>Номер силоса</th>
                        <th>Кол-во мешков</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                        <td>{weighData?.brutto || '-'}</td>
                        <td>{weighData?.tare || '-'}</td>
                        <td>{weighData?.netto || '-'}</td>
                        <td>{weighData?.silo_number || '-'}</td>
                        <td>{weighData?.bag_details || '-'}</td>
                        </tr>
                    </tbody>
                </table>
                </div>
            </div>

            <div className="thirdBlock">
            <table className="custom-table" style={{width: "80%"}}>
                    <thead>
                        <tr>
                        <th></th>
                        <th>Первое взвешивание</th>
                        <th>Второе взвешивание</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Оператор</td>
                            <td>{weighData?.first_operator || '-'}</td>
                            <td>{weighData?.second_operator || '-'}</td>
                        </tr>
                        <tr>
                            <td>Дата и время</td>
                            <td>{parseDate(weighData?.first_at)}</td>
                            <td>{parseDate(weighData?.second_at)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}