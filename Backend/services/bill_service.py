from database import conn


def add_bill(
    patient_id,
    appointment_id,
    bill_date,
    total_amount,
    status
):
    cursor = conn.cursor()

    if bill_date is None:
        cursor.execute("""
            INSERT INTO bills
            (
                patient_id,
                appointment_id,
                total_amount,
                status
            )
            VALUES (%s, %s, %s, %s)
        """, (
            patient_id,
            appointment_id,
            total_amount,
            status
        ))
    else:
        cursor.execute("""
            INSERT INTO bills
            (
                patient_id,
                appointment_id,
                bill_date,
                total_amount,
                status
            )
            VALUES (%s, %s, %s, %s, %s)
        """, (
            patient_id,
            appointment_id,
            bill_date,
            total_amount,
            status
        ))

    conn.commit()
    cursor.close()

    return {"message": "Bill added successfully"}


def view_bills():
    cursor = conn.cursor()

    cursor.execute("""
        SELECT bill_id,
               patient_id,
               appointment_id,
               bill_date,
               total_amount,
               status,
               is_active
        FROM bills
        WHERE is_active = TRUE
        ORDER BY bill_id
    """)

    bills = cursor.fetchall()
    cursor.close()

    return bills


def view_bill(bill_id):
    cursor = conn.cursor()

    cursor.execute("""
        SELECT bill_id,
               patient_id,
               appointment_id,
               bill_date,
               total_amount,
               status,
               is_active
        FROM bills
        WHERE bill_id = %s
        AND is_active = TRUE
    """, (bill_id,))

    bill = cursor.fetchone()
    cursor.close()

    if bill is None:
        return {"message": "Bill not found"}

    return {
        "bill_id": bill[0],
        "patient_id": bill[1],
        "appointment_id": bill[2],
        "bill_date": bill[3],
        "total_amount": bill[4],
        "status": bill[5],
        "is_active": bill[6]
    }


def update_bill(
    bill_id,
    appointment_id,
    bill_date,
    total_amount,
    status
):
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE bills
        SET appointment_id = %s,
            bill_date = %s,
            total_amount = %s,
            status = %s
        WHERE bill_id = %s
        AND is_active = TRUE
    """, (
        appointment_id,
        bill_date,
        total_amount,
        status,
        bill_id
    ))

    conn.commit()

    rows_updated = cursor.rowcount
    cursor.close()

    if rows_updated == 0:
        return {"message": "Bill not found"}

    return {"message": "Bill updated successfully"}


def delete_bill(bill_id):
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE bills
        SET is_active = FALSE
        WHERE bill_id = %s
        AND is_active = TRUE
    """, (bill_id,))

    conn.commit()

    rows_updated = cursor.rowcount
    cursor.close()

    if rows_updated == 0:
        return {"message": "Bill not found"}

    return {"message": "Bill deleted successfully"}