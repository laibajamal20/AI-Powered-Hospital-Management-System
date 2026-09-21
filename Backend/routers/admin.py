from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from services import admin_service
from utils.jwt_handler import get_current_user, require_role


class AdminProfileUpdate(BaseModel):
    first_name: str
    last_name: str
    phone: str


router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
    dependencies=[Depends(get_current_user)]
)


@router.get("/me")
async def view_my_profile(
    current_user=Depends(require_role("admin"))
):

    admin = admin_service.view_admin_by_user_id(
        current_user["user_id"]
    )

    if admin is None:
        return {
            "message": "Admin profile not found"
        }

    return {
        "admin_id": admin[0],
        "first_name": admin[1],
        "last_name": admin[2],
        "phone": admin[3],
        "email": admin[4]
    }


@router.put("/me")
async def update_my_profile(
    admin: AdminProfileUpdate,
    current_user=Depends(require_role("admin"))
):

    user_id = current_user["user_id"]

    existing_admin = admin_service.view_admin_by_user_id(
        user_id
    )

    if existing_admin is None:
        raise HTTPException(
            status_code=404,
            detail="Admin profile not found"
        )

    admin_id = existing_admin[0]

    updated = admin_service.update_admin(
        admin_id,
        admin.first_name,
        admin.last_name,
        admin.phone
    )

    return updated


@router.get("/patients/pending")
async def get_pending_patients(
    current_user=Depends(require_role("admin"))
):

    patients = admin_service.get_pending_patients()

    return [
        {
            "patient_id": patient[0],
            "first_name": patient[1],
            "last_name": patient[2],
            "date_of_birth": patient[3],
            "gender": patient[4],
            "phone": patient[5],
            "address": patient[6],
            "user_id": patient[7],
            "email": patient[8],
            "is_approved": patient[9]
        }
        for patient in patients
    ]


@router.put("/patients/{user_id}/approve")
async def approve_patient(
    user_id: int,
    current_user=Depends(require_role("admin"))
):

    approved = admin_service.approve_patient(user_id)

    if not approved:
        return {
            "message": "Patient not found"
        }

    return {
        "message": "Patient approved successfully"
    }


@router.get("/doctors")
async def get_all_doctors(
    current_user=Depends(require_role("admin"))
):

    doctors = admin_service.get_all_doctors()

    return [
        {
            "doctor_id": doctor[0],
            "doctor_name": doctor[1],
            "phone": doctor[2],
            "specialization": doctor[3],
            "department_id": doctor[4],
            "department_name": doctor[5],
            "email": doctor[6],
            "is_active": doctor[7]
        }
        for doctor in doctors
    ]


@router.put("/doctors/{doctor_id}/status")
async def update_doctor_status(
    doctor_id: int,
    is_active: bool,
    current_user=Depends(require_role("admin"))
):

    updated = admin_service.update_doctor_status(
        doctor_id,
        is_active
    )

    if not updated:
        return {
            "message": "Doctor not found"
        }

    return {
        "message": "Doctor status updated successfully"
    }