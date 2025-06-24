import { CloseIcon } from 'assets/icons/Close';
import s from './index.module.scss';
import { SelectComponent } from 'ui/SelectComponentAntd';
import { ButtonComponent } from 'ui/ButtonComponent';

interface props {
    popup: boolean
    setPopup: Function
    materialItems: any
    material: any
    setMaterial: any
    handleMaterialChange: any
    objectItems: any
    object: any
    setObject: any
    handleObjectChange: any
    vehicleItems: any
    vehicle: any
    setVehicle: any
    handleVehicleChange: any
}

export const ApplicationLogFilterComponent = ({ popup, setPopup,
    materialItems,
    material,
    setMaterial,
    handleMaterialChange, 
    objectItems, object, setObject, handleObjectChange,
    vehicleItems, vehicle, setVehicle, handleVehicleChange }: props) => {
    return (
        <>
            <div className={`${s.toolbar} df fdr pa w100 aic jcsb`} style={{ gap: '12px' }}>
                <span className='fz20' style={{ marginLeft: '3em' }}>Фильтры</span>
                <div className='df aic' onClick={() => { setPopup(false) }}>
                    <CloseIcon />
                </div>
            </div>

            <div className={`${s.mobileContentBlock} df fdc`} style={{ gap: '16px' }}>
                <SelectComponent
                    placeholder={'Материал'}
                    items={materialItems}
                    state={material}
                    setState={setMaterial}
                    doSome={handleMaterialChange}
                    height={"56px"}
                    loadingText={'Нет данных...'}
                />                
                <SelectComponent
                    placeholder={'Объект'}
                    items={objectItems}
                    state={object}
                    setState={setObject}
                    doSome={handleObjectChange}
                    height={"56px"}
                    loadingText={'Нет данных...'}
                />
                <SelectComponent
                    placeholder={'Транспорт'}
                    items={vehicleItems}
                    state={vehicle}
                    setState={setVehicle}
                    doSome={handleVehicleChange}
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
                    onClick={() => { setMaterial(null); setVehicle(null); setObject(null);}}
                    disabled={false}
                    variant='secondary'
                />
            </div>
        </>
    )
}