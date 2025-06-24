from pydantic import BaseModel


class PhotoSchema(BaseModel):
    id: int
    filename: str
    is_attached: bool

    class Config:
        from_attributes = True


class PhotoSchemaAdd(BaseModel):
    photo_bytes: str

    # filename: str
    # is_attached: bool


# class PhotoSchemaUpdate(BaseModel):
#     name: str
#     description: Optional[str] = None
#
#
# class PhotoSchemaIsActive(BaseModel):
#     is_active: bool
