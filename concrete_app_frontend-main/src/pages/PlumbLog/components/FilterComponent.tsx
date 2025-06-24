import { CloseIcon } from 'assets/icons/Close';
import s from './index.module.scss';
import { RangePickerComponent } from 'ui/RangePickerComponent';
import { SelectComponent } from 'ui/SelectComponentAntd';
import { ButtonComponent } from 'ui/ButtonComponent';

interface props {
    popup: boolean
    setPopup: Function
    selectedDates: any
    setSelectedDates: any
    handleDateChange: any
    sellerCompanyItems: any
    sellerCompany: any
    setSellerCompany: any
    handleSellerCompanyChange: any
    materialItems: any
    material: any
    setMaterial: any
    handleMaterialChange: any
}

export const FilterComponent = ({ popup, setPopup, selectedDates,
    setSelectedDates,
    handleDateChange,
    sellerCompanyItems,
    sellerCompany,
    setSellerCompany,
    handleSellerCompanyChange,
    materialItems,
    material,
    setMaterial,
    handleMaterialChange }: props) => {
    return (
        <>
            <div className={`${s.toolbar} df fdr pa w100 aic jcsb`} style={{ gap: '12px' }}>
                <span className='fz20' style={{ marginLeft: '3em' }}>Фильтры</span>
                <div className='df aic' onClick={() => { setPopup(false) }}>
                    <CloseIcon />
                </div>
            </div>

            <div className={`${s.mobileContentBlock} df fdc`} style={{ gap: '16px' }}>
                <RangePickerComponent
                    height={"56px"}
                    state={selectedDates}
                    setState={setSelectedDates}
                    doSome={handleDateChange}
                    format={'DD/MM/YYYY'}
                    width={'100%'}
                />
                <SelectComponent
                    placeholder={'Поставщик'}
                    items={sellerCompanyItems}
                    state={sellerCompany}
                    setState={setSellerCompany}
                    doSome={handleSellerCompanyChange}
                    height={"56px"}
                    loadingText={'Нет данных...'}
                />
                <SelectComponent
                    placeholder={'Материал'}
                    items={materialItems}
                    state={material}
                    setState={setMaterial}
                    doSome={handleMaterialChange}
                    height={"56px"}
                    loadingText={'Нет данных...'}
                />
            </div>

            <div className={`${s.actionsBlock} df fdc`} style={{ marginTop: '36px', gap: '16px' }}>
                <ButtonComponent
                    height='54px'
                    text="Применить"
                    onClick={() => { setPopup(false) }}
                    disabled={false}
                    variant='primary'
                />
                <ButtonComponent
                    height='54px'
                    text="Сбросить"
                    onClick={() => { setSellerCompany(null); setMaterial(null); }}
                    disabled={false}
                    variant='secondary'
                />
            </div>
        </>
    )
}