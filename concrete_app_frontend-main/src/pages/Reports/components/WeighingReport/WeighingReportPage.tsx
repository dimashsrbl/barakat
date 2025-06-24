import { SelectComponent } from 'ui/SelectComponentAntd'
import { ButtonComponent } from 'ui/ButtonComponent';
import { DatePickerComponent } from 'ui/DatePickerComponent';
import { useCallback, useEffect, useState } from 'react';

import s from './index.module.scss'
import { useDispatch } from 'react-redux';
import { getCompaniesData, getSummaryInvoiceData, getMaterialsData, getDetailInvoiceData, getDetailInvoiceByDeletedOrAdjustedData, getIndependentByMaterialsInvoiceData, getCarrierData } from 'store/features/apiSlice';
import { formatAPIDateTime, reportTypes } from 'constDatas';
import { SelectMultipleComponent } from 'ui/SelectMultipleComponent';

import * as XLSX from 'xlsx';
import { useWindowSize } from 'ui/UseWindowSizeComponent';

export const WeighingReportPage = () => {
    const [reportType, setReportType] = useState('Сводный отчет');
    const [sellerCompanies, setSellerCompanies] = useState<any>([]);
    const [clientCompanies, setClientCompanies] = useState<any>([]);
    const [materials, setMaterials] = useState<any>([]);
    const [carriers, setCarriers] = useState<any>([]);
    const [reportDateFrom, setReportDateFrom] = useState<any>(null);
    const [reportDateTo, setReportDateTo] = useState<any>(null);
    const [isDisabled, setIsDisabled] = useState(true);
    const [responseError, setResponseError] = useState('');

    const [companyProviderItems, setCompanyProviderItems] = useState<any>([]);
    const [companyCustomerItems, setCompanyCustomerItems] = useState<any>([]);
    const [materialItems, setMaterialItems] = useState<any>([]);
    const [carrierItems, setCarrierItems] = useState<any>([]);

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

    const getProviderCompanies = useCallback(async () => {
        const request = await dispatch(getCompaniesData({company_function: 'Поставщик'}));
        setCompanyProviderItems(request?.payload?.data);
    }, [dispatch]);

    const getCustomerCompanies = useCallback(async () => {
        const request = await dispatch(getCompaniesData({company_function: 'Заказчик'}));
        setCompanyCustomerItems(request?.payload?.data);
    }, [dispatch]);

    const getMaterials = useCallback(async () => {
        const request = await dispatch(getMaterialsData({is_for_independent: true}));
        setMaterialItems(request?.payload?.data);
    }, [dispatch]);

    const getCarriers = useCallback(async () => {
        const request = await dispatch(getCarrierData());
        setCarrierItems(request?.payload?.data);
    }, [dispatch]);

    const formHandler = async () => {
        let allSellerCompaniesIds: any[] = [];
        let allClientCompaniesIds: any[] = [];
        let allMaterialsIds: any[] = [];
        let allCarrierIds: any[] = [];
    
        allSellerCompaniesIds = sellerCompanies
            .map((company: any) => companyProviderItems.find((item: any) => item.name === company))
            .filter((foundItem: any) => foundItem)
            .map((foundItem: any) => foundItem.id);
    
        allClientCompaniesIds = clientCompanies
            .map((company: any) => companyCustomerItems.find((item: any) => item.name === company))
            .filter((foundItem: any) => foundItem)
            .map((foundItem: any) => foundItem.id);
    
        allMaterialsIds = materials
            .map((material: any) => materialItems.find((item: any) => item.name === material))
            .filter((foundItem: any) => foundItem)
            .map((foundItem: any) => foundItem.id);
        
        allCarrierIds = carriers
        .map((carrier: any) => carrierItems.find((item: any) => item.name === carrier))
        .filter((foundItem: any) => foundItem)
        .map((foundItem: any) => foundItem.id);
    
        const sellerCompaniesString = allSellerCompaniesIds.join(',');
        const clientCompaniesString = allClientCompaniesIds.join(',');
        const materialString = allMaterialsIds.join(',');
        const carrierString = allCarrierIds.join(',');
    
        const requestData = {
            ...((reportType === 'Детальный отчет' || reportType === 'Сводный отчет') && { seller_companies: sellerCompaniesString }),
            ...((reportType === 'Детальный отчет' || reportType === 'Сводный отчет') && { client_companies: clientCompaniesString }),
            ...((reportType === 'Детальный отчет' || reportType === 'Отчет по материалам') && { materials: materialString }),
            ...(reportType === 'Детальный отчет' && { carriers: carrierString }),
            from_date: formatAPIDateTime(reportDateFrom),
            to_date: formatAPIDateTime(reportDateTo),
        };
    
        let response;
        if (reportType === 'Сводный отчет') {
            response = await dispatch(getSummaryInvoiceData(requestData));
        } else if (reportType === 'Детальный отчет') {
            response = await dispatch(getDetailInvoiceData(requestData));
        } else if (reportType === 'Отчет по удаленным и корректированным отвесам') {
            response = await dispatch(getDetailInvoiceByDeletedOrAdjustedData(requestData));
        } else {
            response = await dispatch(getIndependentByMaterialsInvoiceData(requestData));
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
        const isSummaryValid = reportType === 'Сводный отчет' && reportDateFrom !== null && reportDateTo !== null && (sellerCompanies.length !== 0 || clientCompanies.length !== 0);
        const isDetailValid = reportType === 'Детальный отчет' && reportDateFrom !== null && reportDateTo !== null;
        const isDeletedFixedValid = reportType === 'Отчет по удаленным и корректированным отвесам' && reportDateFrom !== null && reportDateTo !== null;
        const isMaterialValid = reportType === 'Отчет по материалам' && reportDateFrom !== null && reportDateTo !== null;
        setIsDisabled(!(isSummaryValid || isDetailValid || isDeletedFixedValid || isMaterialValid ));
    }, [reportType, sellerCompanies, clientCompanies, reportDateFrom, reportDateTo]);

    useEffect(() => {
        getProviderCompanies();
        getCustomerCompanies();
        getMaterials();
        getCarriers();
    }, [getProviderCompanies, getCustomerCompanies, getMaterials, getCarriers]);

    return(
        <div className={`${s.reportBlock} df fdc`}>
            <SelectComponent
                placeholder={'Тип отчета'}
                items={reportTypes}
                state={reportType}
                maxWidth={"60vh"}
                height={"56px"}
                setState={setReportType}
                loadingText={'Нет данных...'}
            />
            <div className={`${s.filterBlock} df fdc`}>
                <span className='fz16 fw500' style={{color: "#4F4F4F"}}>Фильтры</span>
                { (reportType === 'Детальный отчет' || reportType === 'Сводный отчет' || reportType === 'Отчет по материалам') && (
                    <div className={`${s.inputBlock} df`}>
                        { (reportType === 'Детальный отчет' || reportType === 'Сводный отчет') && (
                            <SelectMultipleComponent
                                placeholder={'Поставщик'}
                                items={companyProviderItems}
                                state={sellerCompanies}
                                height={'56px'}
                                minHeight={'56px'}
                                setState={setSellerCompanies}
                                loadingText={'Нет данных...'}
                            />
                        )}
                        { (reportType === 'Детальный отчет' || reportType === 'Сводный отчет') && (
                            <SelectMultipleComponent
                                placeholder={'Заказчик'}
                                items={companyCustomerItems}
                                state={clientCompanies}
                                height={'56px'}
                                minHeight={'56px'}
                                setState={setClientCompanies}
                                loadingText={'Нет данных...'}
                            />
                        )}
                        { (reportType === 'Детальный отчет' || reportType === 'Отчет по материалам') && (
                            <SelectMultipleComponent
                                placeholder={'Материал'}
                                items={materialItems}
                                state={materials}
                                height={'56px'}
                                minHeight={'56px'}
                                setState={setMaterials}
                                loadingText={'Нет данных...'}
                            />
                        )}
                        { reportType === 'Детальный отчет' && (
                            <SelectMultipleComponent
                                placeholder={'Перевозчик'}
                                items={carrierItems}
                                state={carriers}
                                height={'56px'}
                                minHeight={'56px'}
                                setState={setCarriers}
                                loadingText={'Нет данных...'}
                            />
                        )}
                    </div>
                )}
                <div className={`${s.datePickerBlock} df`}>
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
                    onClick={() => formHandler()}
                    disabled={isDisabled} 
                    variant='primary'
                />
                <ButtonComponent 
                    width='100%'
                    height='48px'
                    text='Сбросить' 
                    onClick={() => {setSellerCompanies([]); setClientCompanies([]); setMaterials([]); setReportDateFrom(null); setReportDateTo(null); }}
                    disabled={false} 
                    variant='secondary'
                />
            </div>
        </div>
    )
}