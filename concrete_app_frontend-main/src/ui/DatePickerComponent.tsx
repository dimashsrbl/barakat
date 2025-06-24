import { DatePicker } from 'antd';
import locale from 'antd/es/date-picker/locale/ru_RU';

interface props {
    placeholder: string
    state: any
    setState: any
    width?: any
    height?: any
    maxWidth?: any
    format?: any
    showTime?: boolean
    doSome?: Function
}

export const DatePickerComponent = ({
    placeholder, 
    state, 
    setState, 
    width = '100%', 
    height = '56px', 
    format = 'DD.MM.YYYY',
    showTime = false,
    maxWidth,
    doSome 
}: props) => {
    return (
        <DatePicker
            locale={locale}
            className='datePickerInput fz16'
            showTime={showTime}
            value={state}
            readOnly
            style={{width: width, height: height, maxWidth}}
            onChange={(e) => {
                if (doSome) doSome(e)
                setState(e)
            }}
            format={format}
            placeholder={`${placeholder}*`}
        />
    )
}