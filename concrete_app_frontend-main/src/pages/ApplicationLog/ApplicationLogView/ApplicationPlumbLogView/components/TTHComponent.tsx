import { parseDate, parseTime } from 'constDatas';

interface props {
    weighData: any
}

export const TTHComponent = ({weighData}: props) => {
    return (
        <div className='df fdc' style={{gap: '3px'}}>
            <div className='df fdr jcsb'>
                <div className='df fdc'>
                    <span>1-й экз - грузоотправителю</span>
                    <span>2-й экз - грузополучателю</span>
                    <span>3-й и 4-й экз - автопредприятию</span>
                </div>
                <div className='df fdr aic' style={{gap: '30px'}}>
                    <div>
                        <span>Коды</span>
                    </div>
                    <div>
                        <table className="custom-table" style={{width: "50%"}}>
                        <thead>
                            <tr>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th></th>
                            </tr>

                            <tr>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>

                        </tbody>
                        </table>
                    </div>
                </div>
                <div className='df fdc'>
                    <span>Типовая междуведомственная форма №1-т</span>
                    <hr />
                    <span><strong>ТОВАРНО-ТРАНСПОРТНАЯ НАКЛАДНАЯ №{weighData?.id}</strong></span>
                    <span className='underline-extended' style={{marginTop: '10px'}}><strong>{parseDate(weighData?.second_at)}</strong></span>
                </div>
            </div>
            <div className='df fdc' style={{gap: '5px'}}>
                <div className='df fdr' style={{gap: '10px', alignSelf: 'center', marginTop: '10px', marginBottom: '5px'}}>
                    <span>Автомобиль</span>
                    <span className='underline-extended'><strong>{weighData?.plate_number}</strong></span>
                </div>
                
                <div className='df fdr jcsb'>
                    <div className='leftMainBlock df fdc' style={{gap: '5px', width: '80%'}}>
                        <div className='df fdr jcsb'>
                            <div className='df fdr' style={{gap: '10px'}}>
                                <span>Автопредприятие</span>
                                {weighData?.client_company_type === 'ЧЛ' ? (
                                    <span className='underline-extended-third'><strong>{weighData?.logistic_type ? 'САМОВЫВОЗ' : weighData?.carrier_name}</strong></span>
                                ) : (
                                    <span className='underline-extended-third'><strong>{weighData?.carrier_name}</strong></span>
                                )} 
                            </div>
                            <div className='df fdr' style={{gap: '10px'}}>
                                <span>Водитель</span>
                                {weighData?.client_company_type === 'ЧЛ' ? (
                                    <span>_____________________________</span>
                                ) : (
                                    <span className='underline-extended-driver-name'><strong>{weighData?.driver_name}</strong></span>
                                )} 
                            </div>
                            <div className='df fdr' style={{gap: '10px'}}>
                                <span>Вид перевозки</span>
                                <span>_______________________</span>
                            </div>
                        </div>

                        <div className='df fdr'>
                            <div className='df fdr' style={{gap: '10px'}}>
                                <span>Заказчик (плательщик)</span>
                                {weighData?.client_company_type === 'ЧЛ' ? (
                                    <span className='underline-extended-customer'><strong>{weighData?.client_company_type} {weighData?.client_company}</strong></span>
                                ) : (
                                    <span>___________________________________________________________________________________________________________________</span>
                                )}
                            </div>
                        </div>

                        <div className='df fdr'>
                            <div className='df fdr' style={{gap: '10px'}}>
                                <span>Грузоотправитель</span>
                                {weighData?.client_company_type === 'ЧЛ' ? (
                                    <span>_______________________________________________________________________________________________________________________</span>
                                ) : (
                                    <span className='underline-extended-shipper'><strong>{weighData?.seller_company_type} {weighData?.seller_company}</strong></span>                                    
                                )
                                } 
                            </div>
                        </div>

                        <div className='df fdr'>
                            <div className='df fdr' style={{gap: '10px'}}>
                                <span>Грузополучатель</span>
                                {weighData?.client_company_type === 'ЧЛ' ? (
                                    <span>________________________________________________________________________________________________________________________</span>
                                ) : (
                                    <span className='underline-extended-first'><strong>{weighData?.client_company_type} {weighData?.client_company} ({weighData?.object_name})</strong></span>                                    
                                )
                                } 
                            </div>
                        </div>

                        <div className='df fdr jcsb'>
                            <div className='df fdr' style={{gap: '10px'}}>
                                <span>Пункт погрузки</span>
                                {weighData?.client_company_type === 'ЧЛ' ? (
                                    <span>________________________________________________</span>
                                ) : (
                                    <span className='underline-extended-loading-point'><strong>г.Астана А206, здание 12/1</strong></span>                                    
                                )
                                } 
                            </div>
                            <div className='df fdr' style={{gap: '10px'}}>
                                <span>Пункт разгрузки</span>
                                <span>______________________________________________</span>
                            </div>
                        </div>

                        <div className='df fdr' style={{gap: '15px'}}>
                            <div className='df fdr' style={{gap: '10px'}}>
                                <span>Переадресовка</span>
                                <span>_________________________________________________________________________________</span>
                            </div>
                            <div className='df fdr' style={{gap: '10px'}}>
                                <span>1.Прицеп</span>
                                <span>__________________________</span>
                            </div>
                        </div>

                        <div className='df fdr' style={{gap: '15px'}}>
                            <div className='df fdr'>
                                <span>________________________________________________________________________________________________</span>
                            </div>
                            <div className='df fdr' style={{gap: '10px'}}>
                                <span>2.Прицеп</span>
                                <span>_________________________</span>
                            </div>
                        </div>
                    </div>

                    <div className='rightMainBlock df' style={{gap: '5px'}}>
                    <div className='df fdc' style={{gap: '3px', textAlign: 'right'}}>
                        <span>к путевому листу №</span>
                        <span>код</span>
                        <span>код</span>
                        <span>код</span>
                        <span>код</span>
                        <span>Маршрут №</span>
                        <span>Гар. №</span>
                        <span>Гар. №</span>
                    </div>
                    <table className='rightMainBlockTable'>
                        <tr>
                            <td></td>
                        </tr>
                        <tr>
                            <td></td>
                        </tr>
                        <tr>
                            <td></td>
                        </tr>
                        <tr>
                            <td></td>
                        </tr>
                        <tr>
                            <td></td>
                        </tr>
                        <tr>
                            <td></td>
                        </tr>
                        <tr>
                            <td></td>
                        </tr>
                        <tr>
                            <td></td>
                        </tr>
                    </table>
                    </div>
                </div>
            </div>

            <div>
                <span style={{display: 'block', textAlign: 'center', textTransform: 'uppercase'}}>Сведения о грузе</span>
                <table className="truckTable">
                    <thead>
                        <tr>
                        <th>Номенк № код</th>
                        <th>№ прейск позиция</th>
                        <th>Наименование продукции товара (груза) или номера контейнера</th>
                        <th>Един. измер </th>
                        <th>Количество</th>
                        <th>Цена</th>
                        <th>Сумма</th>
                        <th>С грузом следуют документы</th>
                        <th>Вид упаков</th>
                        <th>обьем м3</th>
                        <th>Способы опред массы</th>
                        <th>Код груза</th>
                        <th>Масса тары, т</th>
                        <th>Масса брутто, т</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td>2</td>
                            <td>3</td>
                            <td>4</td>
                            <td>5</td>
                            <td>6</td>
                            <td>7</td>
                            <td>8</td>
                            <td>9</td>
                            <td>10</td>
                            <td>11</td>
                            <td>12</td>
                            <td>13</td>
                            <td>14</td>
                        </tr>
                        <tr>
                            <td></td>
                            <td></td>
                            <td><strong>{weighData?.material_name || '-'}</strong></td>
                            <td><strong>Т</strong></td>
                            <td><strong>{weighData?.clean_weight || '-'}</strong></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td><strong>{weighData?.cubature || '-'}</strong></td>
                            <td></td>
                            <td></td>
                            <td><strong>{weighData?.tare || '-'}</strong></td>
                            <td><strong>{weighData?.brutto || '-'}</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className='df fdr' style={{gap: '15px', marginBottom: '10px'}}>
                <div className='df fdr' style={{gap: '10px'}}>
                    <span>Всего получено на сумму</span>
                    <span>_________________________________________________________</span>
                </div>
                <div className='df fdr' style={{gap: '10px'}}>
                    <span>Отпуск разрешил</span>
                    <span className='underline-extended-second'><strong>{weighData?.second_operator || '-'}</strong></span>
                </div>
            </div>
        
            <div className="df fdr jcsb" style={{gap: '10px'}}>

                <div className='df fdc' style={{gap: '15px'}}>

                    <div className='df fdr' style={{gap: '10px'}}>
                    <div className='leftBlock df fdc' style={{gap: '5px'}}>
                        <div className='df fdr' style={{gap: '15px'}}>
                            <div className='df fdr' style={{gap: '5px', marginRight: '4.5em'}}>
                                <span>Указанный груз за испр. <br/>пломбой, тарой и упаковкой</span>
                                <span className='underline-extended-plomb'><strong>{weighData?.plomb || '-'}</strong></span>
                            </div>
                            <div className='df fdr' style={{gap: '5px'}}>
                                <span>Кол.<br/>мест</span>
                                <span>____________</span>
                            </div>
                        </div>
                        <div className='df fdr' style={{gap: '5px'}}>
                            <span>Массой брутто, т</span>
                            <span className='underline-extended'><strong>{weighData?.second_brutto}</strong></span>
                            <span>к перевозке</span>
                        </div>
                        <div className='df fdr' style={{gap: '5px'}}>
                            <span style={{fontStyle: 'italic'}}>Сдал</span>
                            <span className='underline-extended-second'><strong>{weighData?.second_operator}</strong></span>
                        </div>
                        <div className='df fdr' style={{gap: '10px'}}>
                            <span style={{fontStyle: 'italic'}}>Принял водит-экспедитор</span>
                            <span>_______________________________</span>
                        </div>
                    </div>

                    <div style={{borderLeft: '1px solid black'}}></div>

                    <div className='centralBlock df fdc' style={{gap: '5px'}}>
                        <div className='df fdr' style={{gap: '15px'}}>
                            <div className='df fdr' style={{gap: '5px'}}>
                                <span>Указанный груз за испр. <br/>пломбой, тарой и упаковкой</span>
                                <span>____________</span>
                            </div>
                            <div className='df fdr' style={{gap: '5px'}}>
                                <span>Кол.<br/>мест</span>
                                <span>____________</span>
                            </div>
                        </div>
                        <div className='df fdr' style={{gap: '10px'}}>
                            <span>Массой брутто, т</span>
                            <span>_____________________</span>
                            <span>к перевозке</span>
                        </div>
                        <div className='df fdr'>
                            <span style={{fontStyle: 'italic'}}>Сдал водитель-экспедитор</span>
                            <span>________________________________</span>
                        </div>
                        <div className='df fdr'>
                            <span style={{fontStyle: 'italic'}}>Принял</span>
                            <span>_________________________________________________</span>
                        </div>
                    </div>

                    </div>

                    <div>
                <span style={{display: 'block', textAlign: 'center', textTransform: 'uppercase'}}>Погрузочно-Разгрузочные Операции</span>
                <table className="truckTable" style={{ width: '100%' }}>
    <thead>
        <tr>
            <th rowSpan={2}>операции</th>
            <th rowSpan={2}>исп АТП,<br/>отпр получ</th>
            <th colSpan={2}>способ</th>
            <th colSpan={3}>время, час. мин</th>
            <th colSpan={2}>дополнительные операции</th>
            <th rowSpan={2}>отв лицо<br/>подпись</th>
        </tr>
        <tr>
            <td>руче,мех,груз</td>
            <td>код</td>
            <td>прибытия</td>
            <td>убытия</td>
            <td>простоя</td>
            <td>время,мин</td>
            <td>наименов, колич</td>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td></td>
            <td>15</td>
            <td>16</td>
            <td>17</td>
            <td>18</td>
            <td>19</td>
            <td>20</td>
            <td>21</td>
            <td>22</td>
            <td>23</td>
        </tr>
        <tr>
            <td>погр</td>
            <td></td>
            <td></td>
            <td></td>
            <td><strong>{parseTime(weighData?.first_at)}</strong></td>
            <td><strong>{parseTime(weighData?.second_at)}</strong></td>
            <td></td>
            <td></td>
            <td></td>
            <td>80</td>
        </tr>
        <tr>
            <td>рагр</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
    </tbody>
</table>





            </div>

                <div className='df fdc'>
                    <span style={{display: 'block', textAlign: 'center', textTransform: 'uppercase'}}>ПРОЧИЕ СВЕДЕНИЯ (заполняется организацией, владельцем автотранспорта)</span>
                    <table className="truckTable" style={{width: '100%'}}>
                        <thead>
                            <tr>
                                <th colSpan={5}>Расст перевоза по группам дорог, км</th>
                                <th rowSpan={2}>Код эксп</th>
                                <th colSpan={2}>За трансп услуги</th>
                                <th colSpan={2}>Поправочн коэф</th>
                                <th rowSpan={2}>штраф</th>
                                <th rowSpan={2}></th>
                                <th rowSpan={2}></th>
                            </tr>
                            <tr>
                                <th>всего</th>
                                <th>в гор</th>
                                <th>I гр.</th>
                                <th>II гр.</th>
                                <th>III гр.</th>
                                <th>с клиента</th>
                                <th>водителю</th>
                                <th>расцводит.</th>
                                <th>основн тариф</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>24</td>
                                <td>25</td>
                                <td>26</td>
                                <td>27</td>
                                <td>28</td>
                                <td>29</td>
                                <td>30</td>
                                <td>31</td>
                                <td>32</td>
                                <td>33</td>
                                <td>34</td>
                                <td>35</td>
                                <td>36</td>
                            </tr>
                            <tr>
                                <td style={{padding: '8px'}}></td>
                                <td style={{padding: '8px'}}></td>
                                <td style={{padding: '8px'}}></td>
                                <td style={{padding: '8px'}}></td>
                                <td style={{padding: '8px'}}></td>
                                <td style={{padding: '8px'}}></td>
                                <td style={{padding: '8px'}}></td>
                                <td style={{padding: '8px'}}></td>
                                <td style={{padding: '8px'}}></td>
                                <td style={{padding: '8px'}}></td>
                                <td style={{padding: '8px'}}></td>
                                <td style={{padding: '8px'}}></td>
                                <td style={{padding: '8px'}}></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                </div>

                <div style={{borderLeft: '1px solid black', height: '14em'}}></div>

                <div className="rightBlock df fdc" style={{gap: '5px'}}>
                    <div className='df fdr' style={{gap: '10px'}}>
                        <span>По доверенности №</span>
                        <span>______________</span>
                    </div>
                    <div className='df fdr' style={{gap: '10px'}}>
                        <span>выданной</span>
                        <span>_______________________</span>
                    </div>
                    <div className='df fdr' style={{gap: '10px'}}>
                        <span>Груз получил</span>
                        <span className='underline-extended-truck-delivered'><strong>{weighData?.driver_name}</strong></span>
                    </div>
                    <div className='df fdr' style={{gap: '10px'}}>
                        <span>_________________________________</span>
                    </div>
                    <div className='df fdr' style={{gap: '10px'}}>
                        <span>Транспортные услуги</span>
                        <span>_____________</span>
                    </div>
                    <div className='df fdr'>
                        <span>_________________________________</span>
                    </div>
                    <div className='df fdr'>
                        <span>_________________________________</span>
                    </div>
                    <div className='df fdr'>
                        <span>_________________________________</span>
                    </div>
                    <div className='df fdr'>
                        <span>_________________________________</span>
                    </div>
                    <div className='df fdr' style={{gap: '10px'}}>
                        <span>Отметки о сост актах</span>
                        <span>_____________</span>
                    </div>

                    <div className="df fdc" style={{gap: '10px'}}>
                        <div className='df fdr'>
                            <span>_________________________________</span>
                        </div>
                        <div className='df fdr'>
                            <span>_________________________________</span>
                        </div>
                        <div className='df fdr'>
                            <span>_________________________________</span>
                        </div>
                        <div className='df fdr'>
                            <span>_________________________________</span>
                        </div>
                    </div>
                </div>
            </div>
            </div>
    )
}