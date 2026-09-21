from database import conn
from datetime import datetime, timedelta
import secrets

def get_user_by_email(email):
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT user_id, email, password_hash, role,
                   google_id, is_active, is_approved
            FROM users
            WHERE email = %s
        """, (email,))

        return cursor.fetchone()

    except Exception:
        conn.rollback()
        raise

    finally:
        cursor.close()

def update_google_id(user_id, google_id):
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            UPDATE users
            SET google_id = %s
            WHERE user_id = %s
            """,
            (google_id, user_id)
        )

        conn.commit()

    except Exception:
        conn.rollback()
        raise

    finally:
        cursor.close()


def register_patient(
    first_name,
    last_name,
    date_of_birth,
    gender,
    phone,
    address,
    email,
    password_hash
):
    cursor = conn.cursor()

    try:
        # Create login account
        cursor.execute(
            """
            INSERT INTO users
            (email, password_hash, role, is_active, is_approved)
            VALUES (%s, %s, 'patient', TRUE, FALSE)
            RETURNING user_id
            """,
            (email, password_hash)
        )

        user_id = cursor.fetchone()[0]

        # Create patient record
        cursor.execute(
            """
            INSERT INTO patients
            (user_id, first_name, last_name, date_of_birth,
             gender, phone, address)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING patient_id
            """,
            (
                user_id,
                first_name,
                last_name,
                date_of_birth,
                gender,
                phone,
                address
            )
        )

        patient_id = cursor.fetchone()[0]

        conn.commit()

        return {
            "user_id": user_id,
            "patient_id": patient_id
        }

    except Exception:
        conn.rollback()
        raise

    finally:
        cursor.close()

def register_doctor(
    doctor_name,
    email,
    phone,
    specialization,
    department_id,
    salary,
    password_hash
):
    cursor = conn.cursor()

    try:
        # Create doctor login account
        cursor.execute(
            """
            INSERT INTO users
            (email, password_hash, role, is_active, is_approved)
            VALUES (%s, %s, 'doctor', TRUE, TRUE)
            RETURNING user_id
            """,
            (email, password_hash)
        )

        user_id = cursor.fetchone()[0]

        # Create doctor profile
        cursor.execute(
            """
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
            """,
            (
                user_id,
                doctor_name,
                email,
                phone,
                specialization,
                department_id,
                salary
            )
        )

        doctor_id = cursor.fetchone()[0]

        conn.commit()

        return {
            "user_id": user_id,
            "doctor_id": doctor_id
        }

    except Exception:
        conn.rollback()
        raise

    finally:
        cursor.close()

def create_password_setup_token(user_id):
    cursor = conn.cursor()

    try:

        token = secrets.token_urlsafe(32)

        expiry = datetime.utcnow() + timedelta(hours=24)

        cursor.execute(
            """
            UPDATE users
            SET
                password_reset_token = %s,
                password_reset_expiry = %s
            WHERE user_id = %s
            """,
            (
                token,
                expiry,
                user_id
            )
        )

        conn.commit()

        return {
            "token": token,
            "expiry": expiry
        }

    except Exception:
        conn.rollback()
        raise

    finally:
        cursor.close()


def get_user_by_password_reset_token(token):
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            SELECT user_id, email, role,
                   password_reset_expiry
            FROM users
            WHERE password_reset_token = %s
            """,
            (token,)
        )

        return cursor.fetchone()

    finally:
        cursor.close()


def update_doctor_password(user_id, password_hash):
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            UPDATE users
            SET
                password_hash = %s,
                password_reset_token = NULL,
                password_reset_expiry = NULL
            WHERE user_id = %s
            """,
            (
                password_hash,
                user_id
            )
        )

        conn.commit()

    except Exception:
        conn.rollback()
        raise

    finally:
        cursor.close()