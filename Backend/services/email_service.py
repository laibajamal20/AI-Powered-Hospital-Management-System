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
Hello,

Your verification code is {otp}.

This code expires in 5 minutes.

Hospital Management System
"""

    await asyncio.to_thread(
        client.inboxes.messages.send,
        inbox_id=AGENTMAIL_INBOX,
        to=receiver_email,
        subject="Your verification code",
        text=text
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