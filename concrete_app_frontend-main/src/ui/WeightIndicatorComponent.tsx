import React, { useState, useEffect, useRef } from 'react';

interface Props {
  onWeightChange?: any;
}

export const WeightIndicatorComponent = ({ onWeightChange }: Props) => {
  const [socketData, setSocketData] = useState(null);
  const onWeightChangeRef = useRef<any>();

  useEffect(() => {
    onWeightChangeRef.current = onWeightChange;
  }, [onWeightChange]);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8888');

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setSocketData(data);
      onWeightChangeRef.current && onWeightChangeRef.current(data);
    };

    return () => {
      socket.close();
    };
  }, []);

  return (
    <div className="weightIndicatorBlock df fdr jcsb">
      {(socketData && socketData >= 0) || socketData === 0 ? (
        <>
          <span className="fz16">Индикатор веса</span>
          <span className="fw600">{socketData || 0} кг</span>
        </>
      ) : (
        <span className="errorText oh">Нет соединения с индикатором</span>
      )}
    </div>
  )
}
