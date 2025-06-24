#!/bin/bash

alembic upgrade head

gunicorn main:app --workers 4 --worker-class worker.MyUvicornWorker --bind=0.0.0.0:8000