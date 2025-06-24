import os

from uvicorn.workers import UvicornWorker


class MyUvicornWorker(UvicornWorker):
    log_config_file = os.path.join(os.getcwd(), "logging.yaml")

    CONFIG_KWARGS = {
        "log_config": log_config_file,
    }
