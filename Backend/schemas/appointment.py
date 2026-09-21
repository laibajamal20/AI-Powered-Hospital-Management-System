from datetime import date, time
from pydantic import BaseModel


class AppointmentCreate(BaseModel):
    patient_id: int
    doctor_id: int
    appointment_time: time
    status: str
    reason: str
    appointment_date: date
    appointment_type: str


class AppointmentUpdate(BaseModel):
    appointment_time: time
    status: str
    reason: str
    appointment_date: date
    appointment_type: str