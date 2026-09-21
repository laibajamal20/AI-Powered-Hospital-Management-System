from database import conn


def add_medical_record(
    record_id,
    patient_id,
    doctor_id,
    diagnosis,
    signs,
    treatment,
    record_date
):
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO medical_records
        (
            record_id,
            patient_id,
            doctor_id,
            diagnosis,
            signs,
            treatment,
            record_date
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """, (
        record_id,
        patient_id,
        doctor_id,
        diagnosis,
        signs,
        treatment,
        record_date
    ))

    conn.commit()
    cursor.close()

    return {"message": "Medical record added successfully"}


def view_medical_records():
    cursor = conn.cursor()

    cursor.execute("""
        SELECT record_id,
               patient_id,
               doctor_id,
               diagnosis,
               signs,
               treatment,
               record_date
        FROM medical_records
        ORDER BY record_id
    """)

    records = cursor.fetchall()
    cursor.close()

    return records


def view_medical_record(record_id):
    cursor = conn.cursor()

    cursor.execute("""
        SELECT record_id,
               patient_id,
               doctor_id,
               diagnosis,
               signs,
               treatment,
               record_date
        FROM medical_records
        WHERE record_id = %s
    """, (record_id,))

    record = cursor.fetchone()
    cursor.close()

    if record is None:
        return {"message": "Medical record not found"}

    return {
        "record_id": record[0],
        "patient_id": record[1],
        "doctor_id": record[2],
        "diagnosis": record[3],
        "signs": record[4],
        "treatment": record[5],
        "record_date": record[6]
    }


def update_medical_record(
    record_id,
    diagnosis,
    signs,
    treatment,
    record_date
):
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE medical_records
        SET diagnosis = %s,
            signs = %s,
            treatment = %s,
            record_date = %s
        WHERE record_id = %s
    """, (
        diagnosis,
        signs,
        treatment,
        record_date,
        record_id
    ))

    conn.commit()

    rows_updated = cursor.rowcount
    cursor.close()

    if rows_updated == 0:
        return {"message": "Medical record not found"}

    return {"message": "Medical record updated successfully"}


def delete_medical_record(record_id):
    cursor = conn.cursor()

    cursor.execute("""
        DELETE FROM medical_records
        WHERE record_id = %s
    """, (record_id,))

    conn.commit()

    rows_deleted = cursor.rowcount
    cursor.close()

    if rows_deleted == 0:
        return {"message": "Medical record not found"}

    return {"message": "Medical record deleted successfully"}