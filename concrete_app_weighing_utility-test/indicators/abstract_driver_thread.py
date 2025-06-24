import logging
import time
from abc import ABC, abstractmethod
from threading import Thread

import serial
from serial import SerialException

from com_port_utils import close_ports, free_com_port


class AbstractWeightIndicator(Thread, ABC):
    def __init__(self, baudrate, port, connect_interval):
        super().__init__()
        self.actual_weight_value = "0"
        self.baudrate = baudrate
        self.port = port
        self.connect_interval = connect_interval

    def run(self):
        while True:
            try:
                logging.info('Закрытие портов используя serial...')
                close_ports()  # Попытка закрыть порты

                logging.info('Закрытие портов используя powershell...')
                free_com_port(self.port)
                print(f"port {self.port}")
                with serial.Serial(baudrate=self.baudrate, port=self.port) as indicator:
                    logging.info('Установка соединения с весовым индикатором прошла успешно')
                    self.read_weight(indicator)
            except SerialException as se:
                logging.info(f'Не удалось установить соединение или соединение с весовым индикатором оборвалось: {se}')
                self.actual_weight_value = "-1"
                time.sleep(self.connect_interval)
                continue
            except Exception as e:
                logging.info(f'Произошла непредвиденная ошибка: {e}')
                self.actual_weight_value = "-1"
                time.sleep(self.connect_interval)
                continue

    @abstractmethod
    def read_weight(self, indicator):
        pass
