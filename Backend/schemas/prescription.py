from pydantic import BaseModel
from datetime import date


class PrescriptionCreate(BaseModel):
    patient_id: int
    doctor_id: int
    appointment_id: int
    prescription_date: date | None = None
    notes: str | None = None
class PrescriptionUpdate(BaseModel):
    prescription_date: date | None = None
    notes: str | None = None