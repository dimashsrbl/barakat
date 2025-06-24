import { SelectComponent } from 'ui/SelectComponentAntd'
import { ButtonComponent } from 'ui/ButtonComponent';
import { DatePickerComponent } from 'ui/DatePickerComponent';
import { useCallback, useEffect, useState } from 'react';

import s from './index.module.scss'
import { useDispatch } from 'react-redux';
import { getCompaniesData, getDependentByMaterialsInvoiceData, getDependentDetailInvoiceByDeletedOrAdjustedData, getDependentDetailInvoiceData, getDependentSummaryInvoiceData, getMaterialTypesData, getMaterialsData, getObjectsData } from 'store/features/apiSlice';
import { applicationReportTypes, formatAPIDateTime, reporGrouppingTypes } from 'constDatas';
import { SelectMultipleComponent } from 'ui/SelectMultipleComponent';
import { useWindowSize } from 'ui/UseWindowSizeComponent'

import * as XLSX from 'xlsx';;

export const ApplicationReportPage = () => {
    const [reportType, setReportType] = useState('Сводный отчет');
    const [clientCompanies, setClientCompanies] = useState<any>([]);
    const [reportDateFrom, setReportDateFrom] = useState(null);
    const [reportDateTo, setReportDateTo] = useState(null);
    const [reportGroup, setReportGroup] = useState('По дням');
    const [material, setMaterial] = useState<any>([]);
    const [materialType, setMaterialType] = useState<any>([]);
    const [object, setObject] = useState<any>([]);
    const [isDisabled, setIsDisabled] = useState(true);
    const [responseError, setResponseError] = useState('');

    const [companyCustomerItems, setCompanyCustomerItems] = useState<any>([]);
    const [materialItems, setMaterialItems] = useState([]);
    const [materialTypeItems, setMaterialTypeItems] = useState([]);
    const [objectItems, setObjectItems] = useState([]);

    const dispatch = useDispatch();
    const isMobile = useWindowSize();

    const downloadReportXlsFile = async (responseData: any) => {
        const byteCharacters = atob(responseData);
        const byteNumbers = new Array(byteCharacters.length);
    
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const downloadLink = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(blob);
        downloadLink.download = `c ${reportDateFrom} по ${reportDateTo}`;
        downloadLink.click();
    }

    const downloadViewReportXLSFile = async (responseData: any) => {
        const byteCharacters = atob(responseData);
        const byteNumbers = new Array(byteCharacters.length);
    
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        const arrayBuffer = byteArray.buffer;
            
        const workbook = XLSX.read(arrayBuffer, { type: 'array', raw: true });
    
        const contentDiv = document.createElement('div');
    
        const htmlContent = XLSX.write(workbook, { bookType: 'html', bookSST: false, type: 'string' });
        
        const styledHtmlContent = `
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@200;500&display=swap');

                body {
                    font-family: 'Montserrat', sans-serif;
                }
                
                table {
                    border-collapse: collapse;
                    width: 100%;
                    font-size: 14px;
                }
                th, td {
                    border: 1px solid #000;
                    text-align: center;
                }
                th {
                    background-color: #f2f2f2;
                }
                @page { size: landscape; margin: 0; }
            </style>
            ${htmlContent}
        `;

        contentDiv.innerHTML = styledHtmlContent;

        const containerDiv = document.createElement('div');

        function printContent() {
            if (printWindow) {
                hideButtons();

                printWindow.onafterprint = function () {
                    printWindow.close();
                };

                printWindow.print();
            }
        }
    
        function downloadFile() {
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const downloadLink = document.createElement('a');
            downloadLink.href = window.URL.createObjectURL(blob);
            downloadLink.download = `c ${reportDateFrom} по ${reportDateTo}`;
            downloadLink.click();
        }
    
        const buttons = `
            <button id="downloadButton">Скачать</button>
            <button id="printButton">Распечатать</button>
        `;
        
        containerDiv.insertAdjacentHTML('beforeend', buttons);
    
        containerDiv.appendChild(contentDiv);
    
        const printWindow:any = window.open('', '_blank');

        printWindow.document.title = 'Отчет по отвесам';
    
        printWindow?.document.body.appendChild(containerDiv);

        const downloadButton = printWindow?.document.getElementById("downloadButton");
        const printButton = printWindow?.document.getElementById("printButton");
    
        if (downloadButton && printButton) {
            downloadButton.addEventListener("click", downloadFile);
            printButton.addEventListener("click", printContent);
        }
        
        function hideButtons() {
            downloadButton.style.display = 'none';
            printButton.style.display = 'none'
        }
    }

    const getCustomerCompanies = useCallback(async () => {
        const request = await dispatch(getCompaniesData({company_function: 'Заказчик'}));
        setCompanyCustomerItems(request?.payload?.data);
    }, [dispatch]);

    const getMaterialTypes = useCallback(async () => {
        const response = await dispatch(getMaterialTypesData({is_for_dependent: true}));
        setMaterialTypeItems(response?.payload?.data);
    }, [dispatch]);

    const getMaterials = useCallback(async () => {
        const request = await dispatch(getMaterialsData({is_for_dependent: true}));
        setMaterialItems(request?.payload?.data);
    }, [dispatch]);

    const getObjects = useCallback(async () => {
        const request = await dispatch(getObjectsData());
        setObjectItems(request?.payload?.data);
    }, [dispatch]);

    const formHandler = async () => {
        let allClientCompaniesIds: any[] = [];
        let allMaterialsIds: any[] = [];
        let allObjectIds: any[] = [];
    
        allClientCompaniesIds = clientCompanies
            .map((company: any) => companyCustomerItems.find((item: any) => item.name === company))
            .filter((foundItem: any) => foundItem)
            .map((foundItem: any) => foundItem.id);
    
        allMaterialsIds = material
            .map((material: any) => materialItems.find((item: any) => item.name === material))
            .filter((foundItem: any) => foundItem)
            .map((foundItem: any) => foundItem.id);

        allObjectIds = object
            .map((object: any) => objectItems.find((item: any) => item.name === object))
            .filter((foundItem: any) => foundItem)
            .map((foundItem: any) => foundItem.id);
    
        const clientCompaniesString = allClientCompaniesIds.join(',');
        const materialString = allMaterialsIds.join(',');
        const objectString = allObjectIds.join(',');
    
        const requestData = {
            from_date: formatAPIDateTime(reportDateFrom),
            to_date: formatAPIDateTime(reportDateTo),
            ...(reportType === 'Сводный отчет' && { client_companies: clientCompaniesString, material_types: materialString, objects: objectString }),
            ...(reportType === 'Детальный отчет' && { client_companies: clientCompaniesString, materials: materialString, objects: objectString }),
            ...(reportType === 'Отчет по маркам б/р' && { report_type: reportGroup === 'По дням' ? 'day' : 'month'}),
        };
    
        let response;
        if (reportType === 'Сводный отчет') {
            response = await dispatch(getDependentSummaryInvoiceData(requestData));
        } else if (reportType === 'Детальный отчет') {
            response = await dispatch(getDependentDetailInvoiceData(requestData));
        } else if (reportType === 'Отчет по удаленным и корректированным отвесам') {
            response = await dispatch(getDependentDetailInvoiceByDeletedOrAdjustedData(requestData));
        } else {
            response = await dispatch(getDependentByMaterialsInvoiceData(requestData));
        }
    
        const responseData = response?.payload?.data || [];
    
        if (response?.payload?.message === 'ok') {
            if (isMobile) {
                downloadReportXlsFile(responseData);
            } else {
                downloadViewReportXLSFile(responseData);
            }
        } else if (response?.error?.message.includes('400')) {
            setResponseError('Неверные данные в сводном отчете');
        } else if (response?.error?.message.includes('401') || response?.error?.message.includes('403')) {
            setResponseError('Недостаточно прав для выполнения этого запроса.');
        } else {
            setResponseError('Неверные данные в сводном отчете');
        }
    };
    

    useEffect(() => {
        const isSummaryReport = reportType === 'Сводный отчет';
        const isDetailReport = reportType === 'Детальный отчет';
        const isMaterialReport = reportType === 'Отчет по маркам б/р';
        const isDeletedFixedValid = reportType === 'Отчет по удаленным и корректированным отвесам';
        
        const isDateRangeValid = reportDateFrom !== null && reportDateTo !== null;
    
        setIsDisabled((isSummaryReport && isDateRangeValid) || (isDetailReport && isDateRangeValid) || (isMaterialReport && isDateRangeValid) || (isDeletedFixedValid && isDateRangeValid) ? false : true);
    }, [reportType, clientCompanies, reportDateFrom, reportDateTo]);

    useEffect(() => {
        getObjects();
        getCustomerCompanies();
        getMaterials();
        getMaterialTypes();
    }, [getObjects, getCustomerCompanies, getMaterials, getMaterialTypes]);

    return(
        <div className={`${s.reportBlock} df fdc`}>
            <SelectComponent
                placeholder={'Тип отчета'}
                items={applicationReportTypes}
                state={reportType}
                maxWidth={"60vh"}
                height={"56px"}
                setState={setReportType}
                loadingText={'Нет данных...'}
            />
            <div className={`${s.filterBlock} df fdc`}>
                <span className='fz16 fw500' style={{color: "#4F4F4F"}}>Фильтры</span>
                { reportType !== 'Отчет по удаленным и корректированным отвесам' && 
                <div className={`${s.inputBlock} df`}>
                    {reportType !== 'Отчет по маркам б/р' &&
                        <SelectMultipleComponent
                            placeholder={'Заказчик'}
                            items={companyCustomerItems}
                            state={clientCompanies}
                            minHeight={'56px'}
                            height={'56px'}
                            setState={setClientCompanies}
                            loadingText={'Нет данных...'}
                        />
                    }
                    {reportType !== 'Отчет по маркам б/р' &&  reportType !== 'Сводный отчет' &&
                        <SelectMultipleComponent
                            placeholder={'Материал'}
                            items={materialItems}
                            state={material}
                            minHeight={'56px'}
                            height={'56px'}
                            setState={setMaterial}
                            loadingText={'Нет данных...'}
                        />
                    }
                    {reportType === 'Сводный отчет' && 
                        <SelectMultipleComponent
                            placeholder={'Тип материала'}
                            items={materialTypeItems}
                            state={materialType}
                            minHeight={'56px'}
                            height={'56px'}
                            setState={setMaterialType}
                            loadingText={'Нет данных...'}
                        />
                    }
                    {reportType !== 'Отчет по маркам б/р' &&
                        <SelectMultipleComponent
                            placeholder={'Объект'}
                            items={objectItems}
                            state={object}
                            minHeight={'56px'}
                            height={'56px'}
                            setState={setObject}
                            loadingText={'Нет данных...'}
                        />
                    }

                    {reportType === 'Отчет по маркам б/р' &&
                        <SelectComponent
                            placeholder={'Группировка'}
                            items={reporGrouppingTypes}
                            state={reportGroup}
                            width={"356px"}
                            height={"56px"}
                            setState={setReportGroup}
                            loadingText={'Нет данных...'}
                        />
                    }
                </div>
                }
                <div className={`${s.datePickerBlock} df fdr`}>
                    <DatePickerComponent
                        placeholder='Дата и время ОТ'
                        showTime
                        height={'56px'}
                        format={'HH:mm - DD/MM/YYYY'}
                        state={reportDateFrom}
                        setState={setReportDateFrom}
                    />
                    <DatePickerComponent
                        placeholder='Дата и время ДО'
                        showTime
                        height={'56px'}
                        format={'HH:mm - DD/MM/YYYY'}
                        state={reportDateTo}
                        setState={setReportDateTo}
                    />
                </div>
            </div>

            {responseError !== '' && (
                <span style={{ color: '#EB5757', fontSize: '14px', margin: '0 0 0 5px' }}>{responseError}</span>
            )}

            <div className={`${s.actionButtons} df fdr w50`}>
                <ButtonComponent 
                    width='100%'
                    height='48px'
                    text='Сформировать'
                    onClick={() => {formHandler()}}
                    disabled={isDisabled} 
                    variant='primary'
                />
                <ButtonComponent 
                    width='100%'
                    height='48px'
                    text='Сбросить' 
                    onClick={() => { setReportDateFrom(null); setReportDateTo(null); setObject([]); setMaterialType([]); setMaterial([]); setClientCompanies([]); }}
                    disabled={false} 
                    variant='secondary'
                />
            </div>
        </div>
    )
}