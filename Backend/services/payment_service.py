from database import conn


def add_payment(
    payment_id,
    bill_id,
    payment_date,
    amount,
    payment_method
):
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO payments
        (
            payment_id,
            bill_id,
            payment_date,
            amount,
            payment_method
        )
        VALUES (%s, %s, %s, %s, %s)
    """, (
        payment_id,
        bill_id,
        payment_date,
        amount,
        payment_method
    ))

    conn.commit()
    cursor.close()

    return {"message": "Payment added successfully"}


def view_payments():
    cursor = conn.cursor()

    cursor.execute("""
        SELECT payment_id,
               bill_id,
               payment_date,
               amount,
               payment_method
        FROM payments
        ORDER BY payment_id
    """)

    payments = cursor.fetchall()
    cursor.close()

    return payments


def view_payment(payment_id):
    cursor = conn.cursor()

    cursor.execute("""
        SELECT payment_id,
               bill_id,
               payment_date,
               amount,
               payment_method
        FROM payments
        WHERE payment_id = %s
    """, (payment_id,))

    payment = cursor.fetchone()
    cursor.close()

    if payment is None:
        return {"message": "Payment not found"}

    return {
        "payment_id": payment[0],
        "bill_id": payment[1],
        "payment_date": payment[2],
        "amount": payment[3],
        "payment_method": payment[4]
    }


def update_payment(
    payment_id,
    payment_date,
    amount,
    payment_method
):
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE payments
        SET payment_date = %s,
            amount = %s,
            payment_method = %s
        WHERE payment_id = %s
    """, (
        payment_date,
        amount,
        payment_method,
        payment_id
    ))

    conn.commit()

    rows_updated = cursor.rowcount
    cursor.close()

    if rows_updated == 0:
        return {"message": "Payment not found"}

    return {"message": "Payment updated successfully"}


def delete_payment(payment_id):
    cursor = conn.cursor()

    cursor.execute("""
        DELETE FROM payments
        WHERE payment_id = %s
    """, (payment_id,))

    conn.commit()

    rows_deleted = cursor.rowcount
    cursor.close()

    if rows_deleted == 0:
        return {"message": "Payment not found"}

    return {"message": "Payment deleted successfully"}