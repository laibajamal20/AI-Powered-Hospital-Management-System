from fastapi import APIRouter, Depends

from schemas.prescription_detail import (
    PrescriptionDetailCreate,
    PrescriptionDetailUpdate
)

from services import prescription_detail_service
from utils.jwt_handler import require_role


router = APIRouter(
    prefix="/prescription-details",
    tags=["Prescription Details"]
)


# =====================================================
# ADD PRESCRIPTION DETAIL
# =====================================================

@router.post("/")
async def add_prescription_detail(
    detail: PrescriptionDetailCreate
):
    return prescription_detail_service.add_prescription_detail(
        detail.prescription_id,
        detail.medicine_name,
        detail.dosage,
        detail.frequency,
        detail.duration
    )


# =====================================================
# VIEW ALL PRESCRIPTION DETAILS
# =====================================================

@router.get("/")
async def view_prescription_details():
    return prescription_detail_service.view_prescription_details()


# =====================================================
# VIEW LOGGED-IN PATIENT'S PRESCRIPTION DETAILS
# =====================================================

@router.get("/patient/me")
async def view_my_prescription_details(
    current_user=Depends(require_role("patient"))
):
    return prescription_detail_service.view_patient_prescription_details(
        current_user["user_id"]
    )


# =====================================================
# VIEW ONE PRESCRIPTION DETAIL
# =====================================================

@router.get("/{prescription_detail_id}")
async def view_prescription_detail(
    prescription_detail_id: int
):
    return prescription_detail_service.view_prescription_detail(
        prescription_detail_id
    )


# =====================================================
# UPDATE PRESCRIPTION DETAIL
# =====================================================

@router.put("/{prescription_detail_id}")
async def update_prescription_detail(
    prescription_detail_id: int,
    detail: PrescriptionDetailUpdate
):
    return prescription_detail_service.update_prescription_detail(
        prescription_detail_id,
        detail.medicine_name,
        detail.dosage,
        detail.frequency,
        detail.duration
    )


# =====================================================
# DELETE PRESCRIPTION DETAIL
# =====================================================

@router.delete("/{prescription_detail_id}")
async def delete_prescription_detail(
    prescription_detail_id: int
):
    return prescription_detail_service.delete_prescription_detail(
        prescription_detail_id
    )