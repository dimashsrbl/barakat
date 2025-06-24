import { useState, useEffect } from 'react';
import { Toast } from 'ui/ToastComponent'


export const NotificationCheckComponent = () => {
    const [showToast, setShowToast] = useState(false);
    const [socketData, setSocketData] = useState(null);
    const [userRole, setUserRole] = useState('');


    const handleToastClose = () => {
        setShowToast(false);
    };

    const waitForUserInLocalStorage = async () => {
        let attempts = 0;
        const maxAttempts = 10;
        const interval = 500;
    
        while (attempts < maxAttempts) {
          const userrole = localStorage.getItem("userrole");
    
          if (userrole) {
            try {
              setUserRole(userrole)
              break;
            } catch (error) {
              console.error("Error parsing user role from localStorage:", error);
            }
          }
    
          attempts += 1;
          await new Promise((resolve) => setTimeout(resolve, interval));
        }
      };
    
      useEffect(() => {
        waitForUserInLocalStorage();
      }, []);

    useEffect(() => {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        const wsURL = process.env.REACT_APP_WS_URL || `${protocol}//api.${host}`;

        const socket = new WebSocket(`${protocol}//${wsURL}/notifications`);
    
        socket.onmessage = (event) => {
          const data = event.data;
          setSocketData(data);

          if (data) {
            setShowToast(true);
          }
        };

        return () => {
          socket.close();
        };
      }, []);

    return (
        <>
            {(userRole === 'weighing_dispatcher' || userRole === 'Диспетчер весовой') &&
                showToast && <Toast message={socketData} onClose={handleToastClose} />
            }
        </>
    );
};
