import { DatePicker } from "antd";

const { RangePicker } = DatePicker;

interface props {
    state: any
    setState: any
    width?: any
    height?: any
    maxWidth?: any
    showTime?: boolean
    doSome?: Function
    format?: any
}

export const RangePickerComponent = ({
    state, 
    setState, 
    width = '100%', 
    height = '56px', 
    showTime = false,
    format = 'DD/MM/YYYY',
    maxWidth,
    doSome 
}: props) => {
    return (
        <RangePicker
            className='datePickerInput fz16'
            format={format}
            placeholder={['Начальная дата', 'Конечная дата']}
            showTime={showTime}
            value={state}
            style={{width: width, height: height, maxWidth}}
            onChange={(e) => {
                if (doSome) doSome(e)
                setState(e)
            }}
        />
    )
}