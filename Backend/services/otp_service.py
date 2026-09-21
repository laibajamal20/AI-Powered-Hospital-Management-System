from database import conn
import secrets
from datetime import datetime, timedelta


def generate_otp():

    otp = str(secrets.randbelow(1000000)).zfill(6)

    expiry = datetime.utcnow() + timedelta(minutes=5)

    return otp, expiry


def save_otp(email, otp, expiry):

    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            UPDATE users
            SET otp_code = %s,
                otp_expiry = %s
            WHERE email = %s
            """,
            (otp, expiry, email)
        )

        conn.commit()

    finally:
        cursor.close()


def clear_otp(email):

    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            UPDATE users
            SET otp_code = NULL,
                otp_expiry = NULL
            WHERE email = %s
            """,
            (email,)
        )

        conn.commit()

    finally:
        cursor.close()

def get_otp_by_email(email):

    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            SELECT otp_code, otp_expiry
            FROM users
            WHERE email = %s
            """,
            (email,)
        )

        return cursor.fetchone()

    finally:
        cursor.close()