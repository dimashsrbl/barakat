import React, { useState, useEffect } from 'react';
import { NotificationCloseIcon } from 'assets/icons/NotificationCloseIcon'
import { BellIcon } from 'assets/icons/BellIcon';

interface ToastProps {
  message: any;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setVisible(false);
      onClose();
    }, 10000);

    return () => clearTimeout(timeout);
  }, [onClose]);

  return visible ? 
    <div className="toast">
        <div className='toast-container df fdr aic' style={{"gap": "10px"}}>
            <div className='df aic'>
                <BellIcon/>
            </div>
            <div className='df fdc'>
                <span>{message}</span>
            </div>
            <div className='df aic cp' style={{marginLeft: 'auto'}} onClick={() => {onClose();}}>
                <NotificationCloseIcon/>
            </div>
        </div>
    </div> : null;
};
