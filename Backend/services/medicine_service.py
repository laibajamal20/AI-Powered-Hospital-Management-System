from database import conn


# =========================================================
# ADD MEDICINE
# =========================================================

def add_medicine(
    medicine_id,
    medicine_name,
    manufacturer,
    price,
    stock_quantity
):
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO medicines
        (
            medicine_id,
            medicine_name,
            manufacturer,
            price,
            stock_quantity
        )
        VALUES (%s, %s, %s, %s, %s)
    """, (
        medicine_id,
        medicine_name,
        manufacturer,
        price,
        stock_quantity
    ))

    conn.commit()
    cursor.close()

    return {
        "message": "Medicine added successfully"
    }


# =========================================================
# VIEW ALL MEDICINES
# =========================================================

def view_medicines():
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            medicine_id,
            medicine_name,
            manufacturer,
            price,
            stock_quantity,
            is_active
        FROM medicines
        ORDER BY medicine_id
    """)

    medicines = cursor.fetchall()

    cursor.close()

    return [
        {
            "medicine_id": row[0],
            "medicine_name": row[1],
            "manufacturer": row[2],
            "price": row[3],
            "stock_quantity": row[4],
            "is_active": row[5]
        }
        for row in medicines
    ]


# =========================================================
# VIEW ONE MEDICINE
# =========================================================

def view_medicine(medicine_id):
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            medicine_id,
            medicine_name,
            manufacturer,
            price,
            stock_quantity,
            is_active
        FROM medicines
        WHERE medicine_id = %s
    """, (medicine_id,))

    medicine = cursor.fetchone()

    cursor.close()

    if medicine is None:
        return {
            "message": "Medicine not found"
        }

    return {
        "medicine_id": medicine[0],
        "medicine_name": medicine[1],
        "manufacturer": medicine[2],
        "price": medicine[3],
        "stock_quantity": medicine[4],
        "is_active": medicine[5]
    }


# =========================================================
# UPDATE MEDICINE
# =========================================================

def update_medicine(
    medicine_id,
    medicine_name,
    manufacturer,
    price,
    stock_quantity
):
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE medicines
        SET
            medicine_name = %s,
            manufacturer = %s,
            price = %s,
            stock_quantity = %s
        WHERE medicine_id = %s
    """, (
        medicine_name,
        manufacturer,
        price,
        stock_quantity,
        medicine_id
    ))

    conn.commit()

    rows_updated = cursor.rowcount

    cursor.close()

    if rows_updated == 0:
        return {
            "message": "Medicine not found"
        }

    return {
        "message": "Medicine updated successfully"
    }


# =========================================================
# DELETE MEDICINE
# =========================================================

def delete_medicine(medicine_id):
    cursor = conn.cursor()

    cursor.execute("""
        DELETE FROM medicines
        WHERE medicine_id = %s
    """, (medicine_id,))

    conn.commit()

    rows_deleted = cursor.rowcount

    cursor.close()

    if rows_deleted == 0:
        return {
            "message": "Medicine not found"
        }

    return {
        "message": "Medicine deleted successfully"
    }