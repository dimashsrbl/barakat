import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const CVNotificationComponent = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const socket = new WebSocket(`ws://localhost:9000/ws`);

        socket.onmessage = (event) => {
            const data = event.data;
            const formattedData = JSON.parse(data);

            if (formattedData) {
                if (!formattedData.is_depend && formattedData.weighing_id && !formattedData.request_id) {
                    navigate(`/main/plumblog/edit/${formattedData.weighing_id}`);
                } else if (formattedData.is_depend && formattedData.weighing_id && formattedData.request_id) {
                    navigate(`/main/application-log/view/${formattedData.request_id}/edit/${formattedData.weighing_id}`);
                } else if (!formattedData.weighing_id && formattedData.transport) {
                    if (localStorage.getItem('lastTransportFromUtility')) {
                        localStorage.removeItem('lastTransportFromUtility')
                    }
                    localStorage.setItem('lastTransportFromUtility', JSON.stringify(formattedData.transport));
                    // Удаляем через 1 минуту значение ключа lastTransportFromUtility
                    const expirationTime = 60000;
                    setTimeout(() => {
                        localStorage.removeItem('lastTransportFromUtility');
                    }, expirationTime);
                }
            }
        };

        return () => {
            socket.close();
        };
    });

    return (
        <></>
    );
};
