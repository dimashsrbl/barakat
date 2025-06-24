import logging
import time

from serial import SerialException

from indicators.abstract_driver_thread import AbstractWeightIndicator


class Middle15(AbstractWeightIndicator):
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

            if y >= 9:
                weight_value = indicator.readline(9)
                weight_value = (weight_value[6] - 48) * 100000 + (weight_value[5] - 48) * 10000 + (
                        weight_value[4] - 48) * 1000 + \
                                   (weight_value[3] - 48) * 100 + (weight_value[2] - 48) * 10 + (
                                           weight_value[1] - 48) * 1
                if weight_value < 0:
                    weight_value = weight_value * -1

                self.actual_weight_value = str(weight_value)
