import logging
import re
import time

from serial import SerialException

from indicators.abstract_driver_thread import AbstractWeightIndicator


class IP65(AbstractWeightIndicator):
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
                raw = indicator.readline()
                weight_value = raw.decode('utf-8')

                if '-' not in weight_value:
                    weight_value = int(re.findall('\d+', weight_value)[0])
                else:
                    weight_value = -1 * int(re.findall('\d+', weight_value)[0])

                self.actual_weight_value = str(weight_value)
