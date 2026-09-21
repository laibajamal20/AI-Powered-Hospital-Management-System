from database import conn


def view_admin_by_user_id(user_id):

    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            SELECT
                a.admin_id,
                a.first_name,
                a.last_name,
                a.phone,
                u.email
            FROM admins a
            JOIN users u
                ON a.user_id = u.user_id
            WHERE u.user_id = %s
            AND u.role = 'admin'
            AND u.is_active = TRUE
            """,
            (user_id,)
        )

        return cursor.fetchone()

    finally:
        cursor.close()


def get_pending_patients():

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
                p.address,
                u.user_id,
                u.email,
                u.is_approved
            FROM patients p
            JOIN users u
                ON p.user_id = u.user_id
            WHERE u.role = 'patient'
            AND u.is_active = TRUE
            AND u.is_approved = FALSE
            ORDER BY p.patient_id
            """
        )

        return cursor.fetchall()

    finally:
        cursor.close()


def approve_patient(user_id):

    cursor = conn.cursor()

    try:

        cursor.execute(
            """
            UPDATE users
            SET is_approved = TRUE
            WHERE user_id = %s
            AND role = 'patient'
            """,
            (user_id,)
        )

        conn.commit()

        return cursor.rowcount > 0

    except Exception:
        conn.rollback()
        raise

    finally:
        cursor.close()


def get_all_doctors():

    cursor = conn.cursor()

    try:

        cursor.execute(
            """
            SELECT
                d.doctor_id,
                d.doctor_name,
                d.phone,
                d.specialization,
                d.department_id,
                dep.department_name,
                u.email,
                d.is_active
            FROM doctors d
            JOIN users u
                ON d.user_id = u.user_id
            LEFT JOIN departments dep
                ON d.department_id = dep.department_id
            WHERE u.role = 'doctor'
            ORDER BY d.doctor_id
            """
        )

        return cursor.fetchall()

    finally:
        cursor.close()


def update_doctor_status(doctor_id, is_active):

    cursor = conn.cursor()

    try:

        # Update doctors table
        cursor.execute(
            """
            UPDATE doctors
            SET is_active = %s
            WHERE doctor_id = %s
            """,
            (is_active, doctor_id)
        )

        doctor_updated = cursor.rowcount > 0

        # Update users table for the same doctor
        cursor.execute(
            """
            UPDATE users
            SET is_active = %s
            WHERE user_id = (
                SELECT user_id
                FROM doctors
                WHERE doctor_id = %s
            )
            AND role = 'doctor'
            """,
            (is_active, doctor_id)
        )

        user_updated = cursor.rowcount > 0

        conn.commit()

        return doctor_updated and user_updated

    except Exception:
        conn.rollback()
        raise

    finally:
        cursor.close()


def update_admin(admin_id, first_name, last_name, phone):

    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            UPDATE admins
            SET first_name = %s,
                last_name = %s,
                phone = %s
            WHERE admin_id = %s
            """,
            (first_name, last_name, phone, admin_id)
        )

        conn.commit()

        return {
            "message": "Admin profile updated successfully"
        }

    except Exception:
        conn.rollback()
        raise

    finally:
        cursor.close()