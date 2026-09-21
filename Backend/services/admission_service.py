from database import conn


def add_admission(
    admission_id,
    patient_id,
    room_id,
    admission_date,
    discharge_date,
    reason
):
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO admissions
        (
            admission_id,
            patient_id,
            room_id,
            admission_date,
            discharge_date,
            reason
        )
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (
        admission_id,
        patient_id,
        room_id,
        admission_date,
        discharge_date,
        reason
    ))

    conn.commit()
    cursor.close()

    return {"message": "Admission added successfully"}


def view_admissions():
    cursor = conn.cursor()

    cursor.execute("""
        SELECT admission_id,
               patient_id,
               room_id,
               admission_date,
               discharge_date,
               reason
        FROM admissions
        ORDER BY admission_id
    """)

    admissions = cursor.fetchall()
    cursor.close()

    return admissions


def view_admission(admission_id):
    cursor = conn.cursor()

    cursor.execute("""
        SELECT admission_id,
               patient_id,
               room_id,
               admission_date,
               discharge_date,
               reason
        FROM admissions
        WHERE admission_id = %s
    """, (admission_id,))

    admission = cursor.fetchone()
    cursor.close()

    if admission is None:
        return {"message": "Admission not found"}

    return {
        "admission_id": admission[0],
        "patient_id": admission[1],
        "room_id": admission[2],
        "admission_date": admission[3],
        "discharge_date": admission[4],
        "reason": admission[5]
    }


def update_admission(
    admission_id,
    room_id,
    admission_date,
    discharge_date,
    reason
):
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE admissions
        SET room_id = %s,
            admission_date = %s,
            discharge_date = %s,
            reason = %s
        WHERE admission_id = %s
    """, (
        room_id,
        admission_date,
        discharge_date,
        reason,
        admission_id
    ))

    conn.commit()

    rows_updated = cursor.rowcount
    cursor.close()

    if rows_updated == 0:
        return {"message": "Admission not found"}

    return {"message": "Admission updated successfully"}


def delete_admission(admission_id):
    cursor = conn.cursor()

    cursor.execute("""
        DELETE FROM admissions
        WHERE admission_id = %s
    """, (admission_id,))

    conn.commit()

    rows_deleted = cursor.rowcount
    cursor.close()

    if rows_deleted == 0:
        return {"message": "Admission not found"}

    return {"message": "Admission deleted successfully"}