import React, { useState, useRef } from 'react';
import { SelectArrow } from 'assets/icons/SelectArrow';

interface Props {
  options: any[];
  onSelect?: (value: string) => void;
  width?: string;
  height?: string;
  placeholder?: string;
}

export const SelectComponent = ({
  options,
  onSelect,
  width = "152px",
  height = "48px",
  placeholder,
}: Props) => {
  const [selectedValue, setSelectedValue] = useState('');
  const selectRef = useRef<HTMLSelectElement>(null);

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSelectedValue(value);
    onSelect?.(value);
  };

  const handleArrowClick = () => {
    selectRef.current?.click();
  };

  return (
    <div className='custom-select-wrapper df jcsb w100' style={{ width, height }}>
      <select
        ref={selectRef}
        className='custom-select fz16'
        value={selectedValue}
        onChange={handleSelectChange}
      >
        {placeholder && (
          <option value="" disabled hidden style={{ color: "#828282" }}>
            {placeholder}
          </option>
        )}
        {options.map((option: any, index: number) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
      <div className="custom-select-arrow-wrapper df aic" onClick={handleArrowClick}>
        <SelectArrow />
      </div>
    </div>
  );
};
