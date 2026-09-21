from fastapi import APIRouter
from schemas.medicine import (
    MedicineCreate,
    MedicineUpdate
)

from services import medicine_service

router = APIRouter(
    prefix="/medicines",
    tags=["Medicines"]
)


@router.post("/")
async def add_medicine(
    medicine: MedicineCreate
):
    return medicine_service.add_medicine(
        medicine.medicine_id,
        medicine.medicine_name,
        medicine.manufacturer,
        medicine.price,
        medicine.stock_quantity
    )


@router.get("/")
async def view_medicines():
    return medicine_service.view_medicines()


@router.get("/{medicine_id}")
async def view_medicine(
    medicine_id: int
):
    return medicine_service.view_medicine(
        medicine_id
    )


@router.put("/{medicine_id}")
async def update_medicine(
    medicine_id: int,
    medicine: MedicineUpdate
):
    return medicine_service.update_medicine(
        medicine_id,
        medicine.medicine_name,
        medicine.manufacturer,
        medicine.price,
        medicine.stock_quantity
    )


@router.delete("/{medicine_id}")
async def delete_medicine(
    medicine_id: int
):
    return medicine_service.delete_medicine(
        medicine_id
    )