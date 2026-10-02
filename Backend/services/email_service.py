import os
import asyncio
from dotenv import load_dotenv
from agentmail import AgentMail

load_dotenv()

AGENTMAIL_API_KEY = os.getenv("AGENTMAIL_API_KEY")
AGENTMAIL_INBOX = "hms@agentmail.to"

client = AgentMail(api_key=AGENTMAIL_API_KEY)


async def send_otp_email(receiver_email: str, otp: str):

    text = f"""
Hospital Management System

Your verification code is:

{otp}

This code will expire in 5 minutes.

If you did not attempt to log in, please ignore this email.
"""

    html = f"""
    <h2>Hospital Management System</h2>

    <p>Your verification code is:</p>

    <h1>{otp}</h1>

    <p>This code will expire in 5 minutes.</p>

    <p>If you did not attempt to log in, please ignore this email.</p>
    """

    await asyncio.to_thread(
        client.inboxes.messages.send,
        inbox_id=AGENTMAIL_INBOX,
        to=receiver_email,
        subject="HMS Two-Factor Authentication Code",
        text=text,
        html=html
    )


async def send_doctor_setup_email(
    receiver_email: str,
    doctor_name: str,
    setup_link: str
):

    text = f"""
Hello {doctor_name},

Your Hospital Management System account is ready.

Please create your password using this link:

{setup_link}

Thank you,
Hospital Management System
"""

    await asyncio.to_thread(
        client.inboxes.messages.send,
        inbox_id=AGENTMAIL_INBOX,
        to=receiver_email,
        subject="Your Hospital Management System Account",
        text=text
    )