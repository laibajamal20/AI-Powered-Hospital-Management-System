from fastapi import APIRouter
from schemas.room import RoomCreate, RoomUpdate
from services import room_service

router = APIRouter(
    prefix="/rooms",
    tags=["Rooms"]
)


@router.post("/")
async def add_room(room: RoomCreate):
    return room_service.add_room(
        room.room_number,
        room.room_type,
        room.status
    )


@router.get("/")
async def view_rooms():
    return room_service.view_rooms()


@router.get("/{room_id}")
async def view_room(room_id: int):
    return room_service.view_room(room_id)


@router.put("/{room_id}")
async def update_room(
    room_id: int,
    room: RoomUpdate
):
    return room_service.update_room(
        room_id,
        room.room_number,
        room.room_type,
        room.status
    )


@router.delete("/{room_id}")
async def delete_room(room_id: int):
    return room_service.delete_room(room_id)