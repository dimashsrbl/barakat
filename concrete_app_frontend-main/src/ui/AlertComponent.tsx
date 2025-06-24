import { ButtonComponent } from "./ButtonComponent";

interface AlertProps {
    message: any;
    onClose: () => void;
  }

export const AlertComponent = ({ message, onClose }: AlertProps) => {
    return (
        <div className="alert">
          <p>{message}</p>
          <ButtonComponent 
              height='48px'
              text="OK" 
              onClick={() => onClose()}
              disabled={false}
              variant='deactivateButton'
          />
        </div>
      );
}