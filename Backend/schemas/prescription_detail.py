from pydantic import BaseModel


class PrescriptionDetailCreate(BaseModel):
    prescription_id: int
    medicine_name: str
    dosage: str
    frequency: str
    duration: str


class PrescriptionDetailUpdate(BaseModel):
    medicine_name: str
    dosage: str
    frequency: str
    duration: str