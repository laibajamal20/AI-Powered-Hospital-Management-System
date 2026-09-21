from database import conn


def add_room(
    room_number,
    room_type,
    status
):
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO rooms
        (
            room_number,
            room_type,
            status
        )
        VALUES (%s, %s, %s)
    """, (
        room_number,
        room_type,
        status
    ))

    conn.commit()
    cursor.close()

    return {"message": "Room added successfully"}


def view_rooms():
    cursor = conn.cursor()

    cursor.execute("""
        SELECT room_id,
               room_number,
               room_type,
               status
        FROM rooms
        ORDER BY room_id
    """)

    rooms = cursor.fetchall()
    cursor.close()

    return rooms


def view_room(room_id):
    cursor = conn.cursor()

    cursor.execute("""
        SELECT room_id,
               room_number,
               room_type,
               status
        FROM rooms
        WHERE room_id = %s
    """, (room_id,))

    room = cursor.fetchone()
    cursor.close()

    if room is None:
        return {"message": "Room not found"}

    return {
        "room_id": room[0],
        "room_number": room[1],
        "room_type": room[2],
        "status": room[3]
    }


def update_room(
    room_id,
    room_number,
    room_type,
    status
):
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE rooms
        SET room_number = %s,
            room_type = %s,
            status = %s
        WHERE room_id = %s
    """, (
        room_number,
        room_type,
        status,
        room_id
    ))

    conn.commit()

    rows_updated = cursor.rowcount
    cursor.close()

    if rows_updated == 0:
        return {"message": "Room not found"}

    return {"message": "Room updated successfully"}


def delete_room(room_id):
    cursor = conn.cursor()

    cursor.execute("""
        DELETE FROM rooms
        WHERE room_id = %s
    """, (room_id,))

    conn.commit()

    rows_deleted = cursor.rowcount
    cursor.close()

    if rows_deleted == 0:
        return {"message": "Room not found"}

    return {"message": "Room deleted successfully"}