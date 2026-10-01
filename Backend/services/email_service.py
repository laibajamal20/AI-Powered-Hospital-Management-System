import os
import resend
from dotenv import load_dotenv

load_dotenv()

resend.api_key = os.getenv("RESEND_API_KEY")


async def send_otp_email(receiver_email: str, otp: str):

    params = {
        "from": "onboarding@resend.dev",
        "to": [receiver_email],
        "subject": "HMS Two-Factor Authentication Code",
        "html": f"""
        <h2>Hospital Management System</h2>

        <p>Your verification code is:</p>

        <h1>{otp}</h1>

        <p>This code will expire in 5 minutes.</p>

        <p>If you did not attempt to log in, please ignore this email.</p>
        """
    }

    await resend.Emails.send_async(params)


async def send_doctor_setup_email(
    receiver_email: str,
    doctor_name: str,
    setup_link: str
):

    params = {
        "from": "onboarding@resend.dev",
        "to": [receiver_email],
        "subject": "Hospital Management System - Doctor Account",
        "html": f"""
        <h2>Hello {doctor_name},</h2>

        <p>Your doctor account has been created in the Hospital Management System.</p>

        <p><strong>Email:</strong> {receiver_email}</p>

        <p>To activate your account and create your password, please use the link below:</p>

        <p><a href="{setup_link}">Set Your Password</a></p>

        <p>This link is for setting your password. Please do not share it with anyone.</p>

        <p>If you did not expect this account, please contact the hospital administrator.</p>

        <p>Regards,<br>
        Hospital Management System</p>
        """
    }

    await resend.Emails.send_async(params)