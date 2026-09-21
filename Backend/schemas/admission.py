from pydantic import BaseModel
from datetime import date


class AdmissionCreate(BaseModel):
    admission_id: int
    patient_id: int
    room_id: int
    admission_date: date
    discharge_date: date | None = None
    reason: str


class AdmissionUpdate(BaseModel):
    room_id: int
    admission_date: date
    discharge_date: date | None = None
    reason: str