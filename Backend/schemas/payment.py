from pydantic import BaseModel
from datetime import date
from decimal import Decimal


class PaymentCreate(BaseModel):
    payment_id: int
    bill_id: int
    payment_date: date
    amount: Decimal
    payment_method: str


class PaymentUpdate(BaseModel):
    payment_date: date
    amount: Decimal
    payment_method: str