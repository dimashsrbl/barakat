import logging
import re
import time

from serial import SerialException

from indicators.abstract_driver_thread import AbstractWeightIndicator


class A9(AbstractWeightIndicator):
    def read_weight(self, indicator):
        logging.info('Установка соединения с весовым индикатором прошла успешно')
        while True:
            time.sleep(0.15)
            if not indicator:
                raise SerialException

            indicator.flushInput()
            time.sleep(0.35)
            try:
                y = indicator.in_waiting
            except:
                logging.info('Индикатор не подключен: нет очереди')

            if y > 0:
                data = indicator.readline(8)
                print(data)
                raw = data.decode('ascii')
                weight_value = raw[2:8]
                indicator.reset_input_buffer()
                indicator.reset_output_buffer()
                time.sleep(.5)
                self.actual_weight_value = str(weight_value)
