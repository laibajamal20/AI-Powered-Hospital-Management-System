from database import conn


def add_appointment(
    patient_id,
    doctor_id,
    appointment_time,
    status,
    reason,
    appointment_date,
    appointment_type
):
    cursor = conn.cursor()

    try:

        cursor.execute("""
            INSERT INTO appointments
            (
                patient_id,
                doctor_id,
                appointment_time,
                status,
                reason,
                appointment_date,
                appointment_type
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING appointment_id
        """, (
            patient_id,
            doctor_id,
            appointment_time,
            status,
            reason,
            appointment_date,
            appointment_type
        ))

        result = cursor.fetchone()

        if result is None:
            raise Exception(
                "Appointment was not created."
            )

        appointment_id = result[0]

        conn.commit()

        return {
            "message": "Appointment added successfully",
            "appointment_id": appointment_id
        }

    except Exception:
        conn.rollback()
        raise

    finally:
        cursor.close()


def view_appointments():
    cursor = conn.cursor()

    cursor.execute("""
        SELECT appointment_id,
               patient_id,
               doctor_id,
               appointment_time,
               status,
               reason,
               appointment_date, appointment_type
        FROM appointments
        ORDER BY appointment_id
    """)

    appointments = cursor.fetchall()
    cursor.close()

    return appointments


def view_appointment(appointment_id):
    cursor = conn.cursor()

    cursor.execute("""
        SELECT appointment_id,
               patient_id,
               doctor_id,
               appointment_time,
               status,
               reason,
               appointment_date, appointment_type
        FROM appointments
        WHERE appointment_id = %s
    """, (appointment_id,))

    appointment = cursor.fetchone()
    cursor.close()

    if appointment is None:
        return {"message": "Appointment not found"}

    return {
        "appointment_id": appointment[0],
        "patient_id": appointment[1],
        "doctor_id": appointment[2],
        "appointment_time": appointment[3],
        "status": appointment[4],
        "reason": appointment[5],
        "appointment_date": appointment[6],
        "appointment_type" : appointment[7]
    }


def update_appointment(
    appointment_id,
    appointment_time,
    status,
    reason,
    appointment_date, appointment_type
):
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE appointments
        SET appointment_time = %s,
            status = %s,
            reason = %s,
            appointment_date = %s,
            appointment_type= %s
        WHERE appointment_id = %s
    """, (
        appointment_time,
        status,
        reason,
        appointment_date,
        appointment_id, appointment_type
    ))

    conn.commit()

    rows_updated = cursor.rowcount
    cursor.close()

    if rows_updated == 0:
        return {"message": "Appointment not found"}

    return {"message": "Appointment updated successfully"}


def delete_appointment(appointment_id):
    cursor = conn.cursor()

    cursor.execute("""
        DELETE FROM appointments
        WHERE appointment_id = %s
    """, (appointment_id,))

    conn.commit()

    rows_deleted = cursor.rowcount
    cursor.close()

    if rows_deleted == 0:
        return {"message": "Appointment not found"}

    return {"message": "Appointment deleted successfully"}


def view_patient_appointments(user_id):
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            a.appointment_id,
            a.patient_id,
            a.doctor_id,
            d.doctor_name,
            a.appointment_time,
            a.status,
            a.reason,
            a.appointment_date,
            a.appointment_type
        FROM appointments a
        JOIN patients p
            ON a.patient_id = p.patient_id
        JOIN doctors d 
            ON a.doctor_id=d.doctor_id
        WHERE p.user_id = %s
        ORDER BY a.appointment_date, a.appointment_time
    """, (user_id,))

    appointments = cursor.fetchall()
    cursor.close()

    return [
        {
            "appointment_id": appointment[0],
            "patient_id": appointment[1],
            "doctor_id": appointment[2],
            "doctor_name": appointment[3],
            "appointment_time": appointment[4],
            "status": appointment[5],
            "reason": appointment[6],
            "appointment_date": appointment[7],
            "appointment_type" : appointment[8]
        }
        for appointment in appointments
    ]

def view_doctor_appointments(user_id):
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            a.appointment_id,
            a.patient_id,
            a.doctor_id,
            a.appointment_time,
            a.status,
            a.reason,
            a.appointment_date,
            a.appointment_type
        FROM appointments a
        JOIN doctors d
            ON a.doctor_id = d.doctor_id
        WHERE d.user_id = %s
        ORDER BY a.appointment_date, a.appointment_time
    """, (user_id,))

    appointments = cursor.fetchall()
    cursor.close()

    return [
        {
            "appointment_id": appointment[0],
            "patient_id": appointment[1],
            "doctor_id": appointment[2],
            "appointment_time": appointment[3],
            "status": appointment[4],
            "reason": appointment[5],
            "appointment_date": appointment[6],
            "appointment_type": appointment[7]
        }
        for appointment in appointments
    ]


def update_doctor_appointment_status(
    appointment_id,
    status,
    user_id
):

    cursor = conn.cursor()

    # Check that this appointment belongs to this doctor
    cursor.execute("""
        SELECT a.appointment_id
        FROM appointments a
        JOIN doctors d
            ON a.doctor_id = d.doctor_id
        WHERE a.appointment_id = %s
        AND d.user_id = %s
    """, (appointment_id, user_id))

    appointment = cursor.fetchone()

    if not appointment:
        cursor.close()

        return {
            "error": "You are not authorized to update this appointment"
        }


    # Only allow these statuses
    allowed_statuses = [
        "scheduled",
        "cancelled",
        "completed"
    ]

    if status.lower() not in allowed_statuses:

        cursor.close()

        return {
            "error": "Invalid appointment status"
        }


    cursor.execute("""
        UPDATE appointments
        SET status = %s
        WHERE appointment_id = %s
    """, (
        status.lower(),
        appointment_id
    ))

    conn.commit()

    cursor.close()


    return {
        "message": "Appointment status updated successfully",
        "appointment_id": appointment_id,
        "status": status.lower()
    }


from datetime import datetime, timedelta


def get_doctor_available_slots(doctor_id, appointment_date):
    cursor = conn.cursor()

    try:
        # Get weekday name
        day_of_week = appointment_date.strftime("%A")

        # Get doctor's recurring availability for this weekday
        cursor.execute("""
            SELECT start_time, end_time
            FROM doctor_availability
            WHERE doctor_id = %s
              AND day_of_week = %s
              AND is_active = TRUE
            ORDER BY start_time
        """, (
            doctor_id,
            day_of_week
        ))

        availability_rows = cursor.fetchall()

        if not availability_rows:
            return []

        # Get already booked appointments for this doctor/date
        cursor.execute("""
            SELECT appointment_time
            FROM appointments
            WHERE doctor_id = %s
              AND appointment_date = %s
              AND is_active = TRUE
        """, (
            doctor_id,
            appointment_date
        ))

        booked_rows = cursor.fetchall()

        booked_times = {
            row[0].strftime("%H:%M")
            for row in booked_rows
        }

        slots = []

        # Generate 20-minute slots
        for start_time, end_time in availability_rows:

            current_time = datetime.combine(
                appointment_date,
                start_time
            )

            end_datetime = datetime.combine(
                appointment_date,
                end_time
            )

            while current_time + timedelta(minutes=20) <= end_datetime:

                slot_time = current_time.time()
                slot_string = slot_time.strftime("%H:%M")

                slots.append({
                    "time": slot_string,
                    "available": slot_string not in booked_times
                })

                current_time += timedelta(minutes=20)

        return slots

    finally:
        cursor.close()