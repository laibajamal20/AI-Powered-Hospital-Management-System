from database import conn


def add_prescription(
    patient_id,
    doctor_id,
    appointment_id,
    prescription_date,
    notes
):
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO prescriptions
        (
            patient_id,
            doctor_id,
            appointment_id,
            prescription_date,
            notes
        )
        VALUES (%s, %s, %s, %s, %s)
        RETURNING prescription_id
    """, (
        patient_id,
        doctor_id,
        appointment_id,
        prescription_date,
        notes
    ))

    prescription_id = cursor.fetchone()[0]

    conn.commit()
    cursor.close()

    return {
        "message": "Prescription added successfully",
        "prescription_id": prescription_id
    }


def view_prescriptions():
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            prescription_id,
            patient_id,
            doctor_id,
            appointment_id,
            prescription_date,
            notes
        FROM prescriptions
        ORDER BY prescription_id
    """)

    prescriptions = cursor.fetchall()
    cursor.close()

    return [
        {
            "prescription_id": row[0],
            "patient_id": row[1],
            "doctor_id": row[2],
            "appointment_id": row[3],
            "prescription_date": row[4],
            "notes": row[5]
        }
        for row in prescriptions
    ]


def view_prescription(prescription_id):
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            prescription_id,
            patient_id,
            doctor_id,
            appointment_id,
            prescription_date,
            notes
        FROM prescriptions
        WHERE prescription_id = %s
    """, (prescription_id,))

    prescription = cursor.fetchone()
    cursor.close()

    if prescription is None:
        return {
            "message": "Prescription not found"
        }

    return {
        "prescription_id": prescription[0],
        "patient_id": prescription[1],
        "doctor_id": prescription[2],
        "appointment_id": prescription[3],
        "prescription_date": prescription[4],
        "notes": prescription[5]
    }


def view_patient_prescriptions(user_id):
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            pr.prescription_id,
            pr.patient_id,
            pr.doctor_id,
            d.doctor_name,
            pr.appointment_id,
            pr.prescription_date,
            pr.notes
        FROM prescriptions pr

        INNER JOIN patients p
            ON pr.patient_id = p.patient_id

        INNER JOIN doctors d
            ON pr.doctor_id = d.doctor_id

        WHERE p.user_id = %s
          AND pr.is_active = TRUE
          AND p.is_active = TRUE

        ORDER BY pr.prescription_date DESC
    """, (user_id,))

    prescriptions = cursor.fetchall()

    cursor.close()

    return [
        {
            "prescription_id": row[0],
            "patient_id": row[1],
            "doctor_id": row[2],
            "doctor_name": row[3],
            "appointment_id": row[4],
            "prescription_date": row[5],
            "notes": row[6]
        }
        for row in prescriptions
    ]


def update_prescription(
    prescription_id,
    prescription_date,
    notes
):
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE prescriptions
        SET prescription_date = %s,
            notes = %s
        WHERE prescription_id = %s
    """, (
        prescription_date,
        notes,
        prescription_id
    ))

    conn.commit()

    rows_updated = cursor.rowcount
    cursor.close()

    if rows_updated == 0:
        return {
            "message": "Prescription not found"
        }

    return {
        "message": "Prescription updated successfully"
    }


def delete_prescription(prescription_id):
    cursor = conn.cursor()

    cursor.execute("""
        DELETE FROM prescriptions
        WHERE prescription_id = %s
    """, (prescription_id,))

    conn.commit()

    rows_deleted = cursor.rowcount
    cursor.close()

    if rows_deleted == 0:
        return {
            "message": "Prescription not found"
        }

    return {
        "message": "Prescription deleted successfully"
    }


def view_doctor_prescriptions(user_id):
    cursor = conn.cursor()

    # First find the logged-in doctor's doctor_id
    cursor.execute("""
        SELECT doctor_id
        FROM doctors
        WHERE user_id = %s
          AND is_active = TRUE
    """, (user_id,))

    doctor = cursor.fetchone()

    if doctor is None:
        cursor.close()
        return []

    doctor_id = doctor[0]

    # Get this doctor's prescriptions with patient information
    cursor.execute("""
        SELECT
            pr.prescription_id,
            pr.patient_id,
            p.first_name,
            p.last_name,
            p.date_of_birth,
            p.gender,
            p.phone,
            p.address,
            pr.doctor_id,
            d.doctor_name,
            pr.appointment_id,
            pr.prescription_date,
            pr.notes,
            pd.prescription_detail_id,
            pd.medicine_name,
            pd.dosage,
            pd.frequency,
            pd.duration
        FROM prescriptions pr

        INNER JOIN patients p
            ON pr.patient_id = p.patient_id

        INNER JOIN doctors d
            ON pr.doctor_id = d.doctor_id

        LEFT JOIN prescription_details pd
            ON pr.prescription_id = pd.prescription_id

        WHERE pr.doctor_id = %s
          AND pr.is_active = TRUE
          AND p.is_active = TRUE

        ORDER BY
            pr.prescription_date DESC,
            pr.prescription_id DESC,
            pd.prescription_detail_id
    """, (doctor_id,))

    rows = cursor.fetchall()

    cursor.close()

    return [
        {
            "prescription_id": row[0],
            "patient_id": row[1],
            "patient_first_name": row[2],
            "patient_last_name": row[3],
            "patient_date_of_birth": row[4],
            "patient_gender": row[5],
            "patient_phone": row[6],
            "patient_address": row[7],
            "doctor_id": row[8],
            "doctor_name": row[9],
            "appointment_id": row[10],
            "prescription_date": row[11],
            "notes": row[12],
            "prescription_detail_id": row[13],
            "medicine_name": row[14],
            "dosage": row[15],
            "frequency": row[16],
            "duration": row[17]
        }
        for row in rows
    ]