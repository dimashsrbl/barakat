import enum

class InertRequestStatusEnum(str, enum.Enum):
    active = 'active'
    finished = 'finished'
    not_arrived = 'not_arrived' 