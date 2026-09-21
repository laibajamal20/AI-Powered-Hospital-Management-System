from pydantic import BaseModel
from datetime import date
from decimal import Decimal


class BillCreate(BaseModel):
    patient_id: int
    appointment_id: int | None = None
    bill_date: date | None = None
    total_amount: Decimal
    status: str = "Unpaid"


class BillUpdate(BaseModel):
    appointment_id: int | None = None
    bill_date: date | None = None
    total_amount: Decimal
    status: str