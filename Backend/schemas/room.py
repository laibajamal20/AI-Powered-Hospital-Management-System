from pydantic import BaseModel


class RoomCreate(BaseModel):
    room_number: str
    room_type: str
    status: str


class RoomUpdate(BaseModel):
    room_number: str
    room_type: str
    status: str