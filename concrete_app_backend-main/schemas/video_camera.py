# from typing import Optional
#
# from pydantic import BaseModel
#
#
# class VideoCameraSchema(BaseModel):
#     id: int
#     name: str
#     login: str
#     rtsp_link: Optional[str]
#     weight_indicator_id: int
#
#     class Config:
#         from_attributes = True
#
#
# class VideoCameraSchemaAdd(BaseModel):
#     name: str
#     login: str
#     rtsp_link: Optional[str]
#     weight_indicator_id: bool
#
#
# class VideoCameraSchemaUpdate(BaseModel):
#     name: str
#     login: str
#     rtsp_link: Optional[str]
#     weight_indicator_id: int
