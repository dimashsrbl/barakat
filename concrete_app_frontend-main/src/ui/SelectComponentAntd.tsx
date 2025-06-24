import { Select } from "antd";
import { ArrowBottom } from "assets/icons/ArrowBottom";

interface Props {
    placeholder: string;
    items?: { name?: string; label?: string; plate_number?: string; fullname?: string}[];
    state: any;
    setState: Function;
    searchValue?: any
    setSearchValue?: any;
    width?: string;
    height?: string;
    disabled?: boolean;
    doSome?: Function;
    loadingText?: string;
    maxWidth?: string;
}

export const SelectComponent: React.FC<Props> = ({
    placeholder,
    items = [],
    state,
    setState,
    searchValue,
    setSearchValue,
    width = '100%',
    height = '49px',
    maxWidth,
    disabled = false,
    doSome,
    loadingText = 'Нет данных...'
}: Props) => {
    
    const handleChange = (e: any) => {
        if (doSome) doSome(e);
        if (setSearchValue) {
            setSearchValue('');
        }
        setState(e);
    };

    const handleBlur = (e: any) => {
        if (e.target.value) {
            setSearchValue(e.target.value);
        }
    }

    return (
        <Select
            showSearch
            className="fz16"
            disabled={disabled}
            placeholder={placeholder}
            value={!searchValue ? state : searchValue}
            style={{ width, height, maxWidth }}
            onChange={handleChange}
            onBlur={handleBlur}
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
                <Select.Option key={index} value={item.name || item.label || item.plate_number || item.fullname}>
                    {item.name}
                </Select.Option>
            ))}
        </Select>
    );
};
