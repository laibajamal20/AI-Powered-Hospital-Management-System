import os
import aiosmtplib
from email.message import EmailMessage
from dotenv import load_dotenv
from database import conn

load_dotenv()

SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587

SENDER_EMAIL = os.getenv("SMTP_EMAIL")
SENDER_PASSWORD = os.getenv("SMTP_PASSWORD")


async def send_otp_email(receiver_email: str, otp: str):

    message = EmailMessage()

    message["From"] = SENDER_EMAIL
    message["To"] = receiver_email
    message["Subject"] = "HMS Two-Factor Authentication Code"

    message.set_content(
        f"""
Hospital Management System

Your verification code is:

{otp}

This code will expire in 5 minutes.

If you did not attempt to log in, please ignore this email.
"""
    )

    await aiosmtplib.send(
        message,
        hostname=SMTP_HOST,
        port=SMTP_PORT,
        start_tls=True,
        username=SENDER_EMAIL,
        password=SENDER_PASSWORD,
    )

async def send_doctor_setup_email(
    receiver_email: str,
    doctor_name: str,
    setup_link: str
):

    message = EmailMessage()

    message["From"] = SENDER_EMAIL
    message["To"] = receiver_email
    message["Subject"] = "Hospital Management System - Doctor Account"

    message.set_content(
        f"""
Hello {doctor_name},

Your doctor account has been created in the Hospital Management System.

Email:
{receiver_email}

To activate your account and create your password, please use the link below:

{setup_link}

This link is for setting your password. Please do not share it with anyone.

If you did not expect this account, please contact the hospital administrator.

Regards,
Hospital Management System
"""
    )

    await aiosmtplib.send(
        message,
        hostname=SMTP_HOST,
        port=SMTP_PORT,
        start_tls=True,
        username=SENDER_EMAIL,
        password=SENDER_PASSWORD,
    )