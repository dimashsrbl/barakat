import { parseDateWithoutTime, parseTimeWithoutSecond } from 'constDatas';

interface props {
    applicationData: any
}

export const ApplicationPlanReport = ({ applicationData }: props) => {
    return (
        <div className='df fdc' style={{ gap: "30px" }}>
            <div className="secondBlock df fdc" style={{ gap: "10px" }}>
                <div>
                    <span>Дата: {parseDateWithoutTime(applicationData?.application_plan_date)} </span>
                </div>
                <div>
                    <table className="custom-table" style={{ width: "100%" }}>
                        <thead>
                            <tr>
                                <th>Время</th>
                                <th>Заказчик</th>
                                <th>Объект</th>
                                <th>Марка</th>
                                <th>Кубатура</th>
                                <th>Осадка конуса</th>
                                <th>Конструкция</th>
                                <th>Способ приемки</th>
                                <th>Интервал</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applicationData?.data?.requests ? (applicationData?.data?.requests?.map((item: any, index: any) => (
                                item?.is_active ? (
                                    <tr key={index}>
                                        <td>{parseTimeWithoutSecond(item.purpose_start) || '-'}</td>
                                        <td>{item?.client_company?.company_type} {item?.client_company?.name || '-'}</td>
                                        <td>{item?.object?.name || '-'}</td>
                                        <td>{item?.material?.name || '-'}</td>
                                        <td>{item?.purpose_cubature || '-'}</td>
                                        <td>{item.cone_draft_default || '-'}</td>
                                        <td>{item.construction?.name || '-'}</td>
                                        <td>{item.receive_method?.name || '-'}</td>
                                        <td>{item.interval || '-'}</td>
                                    </tr>
                                ) : (
                                    <tr key={index} className='greyBackground'>
                                        <td>{parseTimeWithoutSecond(item.purpose_start) || '-'}</td>
                                        <td>{item?.client_company?.company_type} {item?.client_company?.name || '-'}</td>
                                        <td>{item?.object?.name || '-'}</td>
                                        <td>{item?.material?.name || '-'}</td>
                                        <td>{item?.purpose_cubature || '-'}</td>
                                        <td>{item.cone_draft_default || '-'}</td>
                                        <td>{item.construction?.name || '-'}</td>
                                        <td>{item.receive_method?.name || '-'}</td>
                                        <td>{item.interval || '-'}</td>
                                    </tr>
                                )

                            ))
                            ) : (
                                <tr>
                                    <td>-</td>
                                    <td>-</td>
                                    <td>-</td>
                                    <td>-</td>
                                    <td>-</td>
                                    <td>-</td>
                                    <td>-</td>
                                    <td>-</td>
                                    <td>-</td>
                                </tr>
                            )}
                            <tr>
                                <td>Итого</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td>{applicationData?.data?.purpose_cubature || 0}</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>

                </div>
            </div>
        </div>
    )
}