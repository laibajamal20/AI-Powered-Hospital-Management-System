from fastapi import APIRouter, Depends
from utils.jwt_handler import require_role


from schemas.prescription import (
    PrescriptionCreate,
    PrescriptionUpdate
)

from services import prescription_service


router = APIRouter(
    prefix="/prescriptions",
    tags=["Prescriptions"]
)


@router.post("/")
async def add_prescription(
    prescription: PrescriptionCreate
):
   return prescription_service.add_prescription(
    prescription.patient_id,
    prescription.doctor_id,
    prescription.appointment_id,
    prescription.prescription_date,
    prescription.notes
)


@router.get("/")
async def view_prescriptions():
    return prescription_service.view_prescriptions()


@router.get("/patient/me")
async def view_my_prescriptions(
    current_user=Depends(require_role("patient"))
):

    return prescription_service.view_patient_prescriptions(
        current_user["user_id"]
    )


@router.get("/{prescription_id}")
async def view_prescription(prescription_id: int):
    return prescription_service.view_prescription(
        prescription_id
    )


@router.put("/{prescription_id}")
async def update_prescription(
    prescription_id: int,
    prescription: PrescriptionUpdate
):
    return prescription_service.update_prescription(
        prescription_id,
        prescription.prescription_date,
        prescription.notes
    )


@router.delete("/{prescription_id}")
async def delete_prescription(
    prescription_id: int
):
    return prescription_service.delete_prescription(
        prescription_id
    )