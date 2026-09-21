from fastapi import APIRouter

from schemas.payment import PaymentCreate, PaymentUpdate
from services import payment_service


router = APIRouter(
    prefix="/payments",
    tags=["Payments"]
)


@router.post("/")
async def add_payment(payment: PaymentCreate):
    return payment_service.add_payment(
        payment.payment_id,
        payment.bill_id,
        payment.payment_date,
        payment.amount,
        payment.payment_method
    )


@router.get("/")
async def view_payments():
    return payment_service.view_payments()


@router.get("/{payment_id}")
async def view_payment(payment_id: int):
    return payment_service.view_payment(payment_id)


@router.put("/{payment_id}")
async def update_payment(
    payment_id: int,
    payment: PaymentUpdate
):
    return payment_service.update_payment(
        payment_id,
        payment.payment_date,
        payment.amount,
        payment.payment_method
    )


@router.delete("/{payment_id}")
async def delete_payment(payment_id: int):
    return payment_service.delete_payment(payment_id)