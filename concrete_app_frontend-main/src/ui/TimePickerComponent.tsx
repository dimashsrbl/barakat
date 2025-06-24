import { TimePicker } from "antd";

interface props {
    placeholder: string
    state: any
    setState: Function
    width?: any
    height?: any
    maxWidth?: any
    doSome?: Function
}

export const TimePickerComponent = ({
    placeholder, 
    state, 
    setState, 
    width = '100%', 
    height = '56px', 
    maxWidth,
    doSome 
}: props) => {
    return (
        <TimePicker
            className='datePickerInput fz16'
            value={state}
            style={{width: width, height: height, maxWidth}}
            onChange={(e) => {
                if (doSome) doSome()
                setState(e)
            }}
            placeholder={`${placeholder}*`}
        />
    )
}