from database import conn

def add_patients(patient_id,first_name, last_name,date_of_birth, 
gender, phone, address):
    cursor=conn.cursor()

    cursor.execute("""Insert into patients
    (patient_id,first_name, last_name,date_of_birth, gender, phone, address)
    values(%s,%s,%s,%s,%s,%s,%s)""",
    (patient_id, first_name,last_name,date_of_birth,gender,phone,address))
    
    conn.commit()

    return {"message" : "Patient addedd successfully"}

def view_patients():
    cursor= conn.cursor()
    cursor.execute("select patient_id, (first_name||' '||last_name) as patient_name from patients where is_active=true order by patient_id")
    patients = cursor.fetchall()
    cursor.close()
    return patients
    
def view_patient(patient_id):
    cursor= conn.cursor()
    cursor.execute("""select patient_id,
            first_name,
            last_name,
            date_of_birth,
            gender,
            phone,
            address from patients where patient_id=%s""",
    (patient_id,))
    return cursor.fetchone()

def update_patient(
    patient_id,
    first_name,
    last_name,
    date_of_birth,
    gender,
    phone,
    address
):

    cursor = conn.cursor()

    cursor.execute(
        """
        UPDATE patients
        SET
            first_name = %s,
            last_name = %s,
            date_of_birth = %s,
            gender = %s,
            phone = %s,
            address = %s
        WHERE patient_id = %s
        and is_active=true
        """,
        (
            first_name,
            last_name,
            date_of_birth,
            gender,
            phone,
            address,
            patient_id
        )
    )

    conn.commit()

    rows_updated = cursor.rowcount

    cursor.close()
    if rows_updated == 0:
        return {"message": "Patient not found"}

    return {"message": "Patient updated successfully"}

def delete_patient(patient_id):
    cursor = conn.cursor()

    cursor.execute(
        """
        UPDATE patients
        SET is_active = FALSE
        WHERE patient_id = %s
        AND is_active = TRUE
        """,
        (patient_id,)
    )

    conn.commit()

    rows_updated = cursor.rowcount

    cursor.close()

    if rows_updated == 0:
        return {"message": "Patient not found"}

    return {"message": "Patient deleted successfully"}


def view_patient_by_user_id(user_id):

    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            SELECT
                p.patient_id,
                p.first_name,
                p.last_name,
                p.date_of_birth,
                p.gender,
                p.phone,
                p.address, u.email
            FROM patients p join users u on p.user_id = u.user_id
            WHERE u.user_id = %s
            AND p.is_active = TRUE
            """,
            (user_id,)
        )

        return cursor.fetchone()

    finally:
        cursor.close()