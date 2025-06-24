from pydantic import BaseModel


class CVAssistPlateNumberSchema(BaseModel):
    plate_number: str
