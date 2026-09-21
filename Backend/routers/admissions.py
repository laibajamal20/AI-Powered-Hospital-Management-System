from fastapi import APIRouter

from schemas.admission import (
    AdmissionCreate,
    AdmissionUpdate
)

from services import admission_service


router = APIRouter(
    prefix="/admissions",
    tags=["Admissions"]
)


@router.post("/")
async def add_admission(admission: AdmissionCreate):
    return admission_service.add_admission(
        admission.admission_id,
        admission.patient_id,
        admission.room_id,
        admission.admission_date,
        admission.discharge_date,
        admission.reason
    )


@router.get("/")
async def view_admissions():
    return admission_service.view_admissions()


@router.get("/{admission_id}")
async def view_admission(admission_id: int):
    return admission_service.view_admission(admission_id)


@router.put("/{admission_id}")
async def update_admission(
    admission_id: int,
    admission: AdmissionUpdate
):
    return admission_service.update_admission(
        admission_id,
        admission.room_id,
        admission.admission_date,
        admission.discharge_date,
        admission.reason
    )


@router.delete("/{admission_id}")
async def delete_admission(admission_id: int):
    return admission_service.delete_admission(admission_id)