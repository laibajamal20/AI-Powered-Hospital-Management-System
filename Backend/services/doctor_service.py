from database import conn


# ============================================================
# ADD DOCTOR
# ============================================================

def add_doctor(
    doctor_name,
    email,
    phone,
    specialization,
    department_id,
    salary,
    user_id
):
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO doctors
            (
                user_id,
                doctor_name,
                email,
                phone,
                specialization,
                department_id,
                salary,
                is_active
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, TRUE)
            RETURNING doctor_id
        """, (
            user_id,
            doctor_name,
            email,
            phone,
            specialization,
            department_id,
            salary
        ))

        doctor_id = cursor.fetchone()[0]

        conn.commit()

        return {
            "message": "Doctor added successfully",
            "doctor_id": doctor_id
        }

    except Exception:
        conn.rollback()
        raise

    finally:
        cursor.close()


# ============================================================
# VIEW ALL DOCTORS
# ============================================================

def view_doctors():
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT
                d.doctor_id,
                d.user_id,
                d.doctor_name,
                d.email,
                d.phone,
                d.specialization,
                dep.department_name,
                d.department_id,
                d.salary,
                d.is_active
            FROM doctors d
            LEFT JOIN public.departments dep
                ON d.department_id = dep.department_id
            WHERE d.is_active = TRUE
            ORDER BY d.doctor_id
        """)

        doctors = cursor.fetchall()

        return doctors

    finally:
        cursor.close()


# ============================================================
# VIEW DOCTOR BY DOCTOR ID
# ============================================================

def view_doctor(doctor_id):
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT
                d.doctor_id,
                d.user_id,
                d.doctor_name,
                d.email,
                d.phone,
                d.specialization,
                dep.department_name,
                d.department_id,
                d.salary,
                d.is_active
            FROM doctors d
            LEFT JOIN public.departments dep
                ON d.department_id = dep.department_id
            WHERE d.doctor_id = %s
              AND d.is_active = TRUE
        """, (doctor_id,))

        return cursor.fetchone()

    finally:
        cursor.close()


# ============================================================
# VIEW DOCTOR BY USER ID
# ============================================================

def view_doctor_by_user_id(user_id):
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT
                d.doctor_id,
                d.user_id,
                d.doctor_name,
                d.email,
                d.phone,
                d.specialization,
                dep.department_name,
                d.department_id,
                d.salary,
                d.is_active
            FROM doctors d
            LEFT JOIN public.departments dep
                ON d.department_id = dep.department_id
            WHERE d.user_id = %s
              AND d.is_active = TRUE
        """, (user_id,))

        return cursor.fetchone()

    finally:
        cursor.close()


# ============================================================
# ADMIN UPDATE DOCTOR
# ============================================================

def update_doctor(
    doctor_id,
    doctor_name,
    email,
    phone,
    specialization,
    department_id,
    salary
):
    cursor = conn.cursor()

    try:
        cursor.execute("""
            UPDATE doctors
            SET
                doctor_name = %s,
                email = %s,
                phone = %s,
                specialization = %s,
                department_id = %s,
                salary = %s
            WHERE doctor_id = %s
              AND is_active = TRUE
        """, (
            doctor_name,
            email,
            phone,
            specialization,
            department_id,
            salary,
            doctor_id
        ))

        rows_updated = cursor.rowcount

        conn.commit()

        if rows_updated == 0:
            return {
                "message": "Doctor not found"
            }

        return {
            "message": "Doctor updated successfully"
        }

    except Exception:
        conn.rollback()
        raise

    finally:
        cursor.close()


# ============================================================
# DOCTOR UPDATE OWN PROFILE
# ============================================================

def update_doctor_profile(
    user_id,
    doctor_name,
    phone,
    specialization
):
    cursor = conn.cursor()

    try:
        cursor.execute("""
            UPDATE doctors
            SET
                doctor_name = %s,
                phone = %s,
                specialization = %s
            WHERE user_id = %s
              AND is_active = TRUE
        """, (
            doctor_name,
            phone,
            specialization,
            user_id
        ))

        rows_updated = cursor.rowcount

        conn.commit()

        if rows_updated == 0:
            return {
                "message": "Doctor not found"
            }

        return {
            "message": "Doctor profile updated successfully"
        }

    except Exception:
        conn.rollback()
        raise

    finally:
        cursor.close()


# ============================================================
# DELETE / DEACTIVATE DOCTOR
# ============================================================

def delete_doctor(doctor_id):
    cursor = conn.cursor()

    try:
        cursor.execute("""
            UPDATE doctors
            SET is_active = FALSE
            WHERE doctor_id = %s
        """, (doctor_id,))

        rows_updated = cursor.rowcount

        conn.commit()

        if rows_updated == 0:
            return {
                "message": "Doctor not found"
            }

        return {
            "message": "Doctor deleted successfully"
        }

    except Exception:
        conn.rollback()
        raise

    finally:
        cursor.close()