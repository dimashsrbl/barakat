import { Select } from "antd";
import { ArrowBottom } from "assets/icons/ArrowBottom";

interface Props {
    placeholder: string;
    items?: { name?: string; label?: string; plate_number?: string; }[];
    state: any;
    setState: Function;
    width?: string;
    height?: string;
    minHeight?: string;
    disabled?: boolean;
    doSome?: Function;
    loadingText?: string;
}

export const SelectMultipleComponent: React.FC<Props> = ({
    placeholder,
    items = [],
    state,
    setState,
    width = '100%',
    height,
    minHeight = '56px',
    disabled = false,
    doSome,
    loadingText = 'Нет данных...'
}: Props) => {
    
    const handleChange = (e: any) => {
        if (doSome) doSome(e);
        setState(e);
    };

    return (
        <Select
            showSearch
            className="fz16"
            mode="multiple"
            disabled={disabled}
            placeholder={placeholder}
            value={state}
            style={{ width, height, minHeight, overflowY: 'auto' }}
            onChange={handleChange}
            dropdownRender={(menu) => (
                <div>
                    <span className="fw600 fz14" style={{ marginLeft: "8px", marginBottom: "10px" }}>
                        {placeholder}
                    </span>
                    {menu}
                </div>
            )}
            suffixIcon={<ArrowBottom />}
            notFoundContent={
                <div className="df fdc jcc aic" style={{ padding: '20px', gap: '10px' }}>
                    <span className="fw600 tac">{loadingText}</span>
                </div>
            }
        >
            {items.map((item, index) => (
                <Select.Option key={index} value={item.name || item.label || item.plate_number}>
                    {item.name}
                </Select.Option>
            ))}
        </Select>
    );
};
