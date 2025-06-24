interface ButtonProps {
    text: string;
    onClick: any;
    disabled?: boolean;
    width?: string;
    height?: string;
    variant?: 'primary' | 'primaryDisabled' | 'disabled' | 'secondary' | 'secondaryDisabled' | 'activateButton' | 'deactivateButton' | 'removeButton' | 'deactivateLogButton'; // Возможные варианты стилей
  }

export const ButtonComponent = ({ text, onClick, disabled, width = "100%", height = "54px", variant = 'primary' }: ButtonProps) => {
    const getClassName = () => {
        switch (variant) {
          case 'primary':
            return 'button-primary';
          case 'primaryDisabled':
            return 'button-primary-disabled';
          case 'disabled':
            return 'button-disabled';
          case 'secondary':
            return 'button-secondary';
          case 'secondaryDisabled':
            return 'button-secondary-disabled'
          case 'activateButton':
            return 'activate-button'
          case 'deactivateButton':
            return 'deactivate-button'
          case 'removeButton':
            return 'remove-button'
          case 'deactivateLogButton':
            return 'deactivate-log-button'
          default:
            return 'button-primary';
        }
      };
    return (
        <button className={`${getClassName()} fz16 hover`} 
        disabled={disabled} 
        onClick={onClick} 
        style={{
          width: width, 
          height: height, 
          borderRadius: "6px",
          cursor: disabled ? "not-allowed" : "pointer",
          background: disabled ? "#F2F2F2" : '',
          color: disabled ? "#828282" : '',
          border: disabled ? "none" : "",
        }}
        >
            {text}
        </button>
    )
}