import { Switch } from 'antd';

interface props {
    placeholder: string
    state: any;
    setState: Function;
}

export const ToggleSwitchComponent = ({
    placeholder,
    state,
    setState,
}: props) => {

  const handleToggle = (checked: boolean) => {
    setState(checked);
  };

  return (
    <div className='df aic' style={{gap: '10px'}}>
        <Switch
            checked={state}
            onChange={handleToggle}
        />
        <span className='cg'>{placeholder}</span>
    </div>

  );
};
