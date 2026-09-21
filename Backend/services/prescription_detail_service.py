from database import conn


def add_prescription_detail(
    prescription_id,
    medicine_name,
    dosage,
    frequency,
    duration
):
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO prescription_details
        (
            prescription_id,
            medicine_name,
            dosage,
            frequency,
            duration
        )
        VALUES (%s, %s, %s, %s, %s)
    """, (
        prescription_id,
        medicine_name,
        dosage,
        frequency,
        duration
    ))

    conn.commit()
    cursor.close()

    return {
        "message": "Prescription detail added successfully"
    }


def view_prescription_details():
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            prescription_detail_id,
            prescription_id,
            medicine_name,
            dosage,
            frequency,
            duration
        FROM prescription_details
        ORDER BY prescription_detail_id
    """)

    details = cursor.fetchall()
    cursor.close()

    return [
        {
            "prescription_detail_id": row[0],
            "prescription_id": row[1],
            "medicine_name": row[2],
            "dosage": row[3],
            "frequency": row[4],
            "duration": row[5]
        }
        for row in details
    ]


def view_prescription_detail(prescription_detail_id):
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            prescription_detail_id,
            prescription_id,
            medicine_name,
            dosage,
            frequency,
            duration
        FROM prescription_details
        WHERE prescription_detail_id = %s
    """, (prescription_detail_id,))

    detail = cursor.fetchone()
    cursor.close()

    if detail is None:
        return {
            "message": "Prescription detail not found"
        }

    return {
        "prescription_detail_id": detail[0],
        "prescription_id": detail[1],
        "medicine_name": detail[2],
        "dosage": detail[3],
        "frequency": detail[4],
        "duration": detail[5]
    }


def update_prescription_detail(
    prescription_detail_id,
    medicine_name,
    dosage,
    frequency,
    duration
):
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE prescription_details
        SET medicine_name = %s,
            dosage = %s,
            frequency = %s,
            duration = %s
        WHERE prescription_detail_id = %s
    """, (
        medicine_name,
        dosage,
        frequency,
        duration,
        prescription_detail_id
    ))

    conn.commit()

    rows_updated = cursor.rowcount
    cursor.close()

    if rows_updated == 0:
        return {
            "message": "Prescription detail not found"
        }

    return {
        "message": "Prescription detail updated successfully"
    }


def delete_prescription_detail(prescription_detail_id):
    cursor = conn.cursor()

    cursor.execute("""
        DELETE FROM prescription_details
        WHERE prescription_detail_id = %s
    """, (prescription_detail_id,))

    conn.commit()

    rows_deleted = cursor.rowcount
    cursor.close()

    if rows_deleted == 0:
        return {
            "message": "Prescription detail not found"
        }

    return {
        "message": "Prescription detail deleted successfully"
    }


def view_patient_prescription_details(user_id):
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            pd.prescription_detail_id,
            pd.prescription_id,
            pd.medicine_name,
            pd.dosage,
            pd.frequency,
            pd.duration
        FROM prescription_details pd
        INNER JOIN prescriptions pr
            ON pd.prescription_id = pr.prescription_id
        INNER JOIN patients p
            ON pr.patient_id = p.patient_id
        WHERE p.user_id = %s
        ORDER BY
            pr.prescription_date DESC,
            pd.prescription_detail_id
    """, (user_id,))

    details = cursor.fetchall()

    cursor.close()

    return [
        {
            "prescription_detail_id": row[0],
            "prescription_id": row[1],
            "medicine_name": row[2],
            "dosage": row[3],
            "frequency": row[4],
            "duration": row[5]
        }
        for row in details
    ]