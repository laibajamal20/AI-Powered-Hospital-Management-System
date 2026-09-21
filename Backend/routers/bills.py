from fastapi import APIRouter

from schemas.bill import BillCreate, BillUpdate
from services import bill_service


router = APIRouter(
    prefix="/bills",
    tags=["Bills"]
)


@router.post("/")
async def add_bill(bill: BillCreate):
    return bill_service.add_bill(
        bill.patient_id,
        bill.appointment_id,
        bill.bill_date,
        bill.total_amount,
        bill.status
    )


@router.get("/")
async def view_bills():
    return bill_service.view_bills()


@router.get("/{bill_id}")
async def view_bill(bill_id: int):
    return bill_service.view_bill(bill_id)


@router.put("/{bill_id}")
async def update_bill(
    bill_id: int,
    bill: BillUpdate
):
    return bill_service.update_bill(
        bill_id,
        bill.appointment_id,
        bill.bill_date,
        bill.total_amount,
        bill.status
    )


@router.delete("/{bill_id}")
async def delete_bill(bill_id: int):
    return bill_service.delete_bill(bill_id)