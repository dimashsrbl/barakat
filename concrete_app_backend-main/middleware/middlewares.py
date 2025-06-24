from middleware.exception_handler import middleware as exception_handler
from middleware.proccess_time import middleware as proccess_time
middleware_list = [
    exception_handler,
    proccess_time,
]
