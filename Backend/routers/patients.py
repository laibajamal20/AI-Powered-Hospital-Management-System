from fastapi import APIRouter, Depends
from services import patient_service

from schemas.patient import PatientCreate, PatientUpdate

from utils.jwt_handler import get_current_user, require_role

router = APIRouter(
    prefix="/patients",
    tags=["Patients"],
    dependencies=[Depends(get_current_user)]
)


@router.post("/")
async def add_patient(patient: PatientCreate):
    return patient_service.add_patients(
        patient.patient_id,
        patient.first_name,
        patient.last_name,
        patient.date_of_birth,
        patient.gender,
        patient.phone,
        patient.address
    )


@router.get("/")
async def view_patients():
    return patient_service.view_patients()


# ==============================
# VIEW MY PROFILE
# ==============================

@router.get("/me")
async def view_my_profile(
    current_user=Depends(require_role("patient"))
):

    patient = patient_service.view_patient_by_user_id(
        current_user["user_id"]
    )

    if patient is None:
        return {"message": "Patient profile not found"}

    return {
        "patient_id": patient[0],
        "first_name": patient[1],
        "last_name": patient[2],
        "date_of_birth": patient[3],
        "gender": patient[4],
        "phone": patient[5],
        "address": patient[6],
        "email": patient[7]
    }


# ==============================
# UPDATE MY PROFILE
# ==============================

@router.put("/me")
async def update_my_profile(
    patient: PatientUpdate,
    current_user=Depends(require_role("patient"))
):

    # Find patient using logged-in user's ID
    existing_patient = patient_service.view_patient_by_user_id(
        current_user["user_id"]
    )

    if existing_patient is None:
        return {"message": "Patient profile not found"}

    patient_id = existing_patient[0]

    # Update patient information
    result = patient_service.update_patient(
        patient_id,
        patient.first_name,
        patient.last_name,
        patient.date_of_birth,
        patient.gender,
        patient.phone,
        patient.address
    )

    return result


# ==============================
# VIEW SINGLE PATIENT
# ==============================

@router.get("/{patient_id}")
async def view_single_patient(
    patient_id: int
):

    patient = patient_service.view_patient(patient_id)

    if patient is None:
        return {"message": "Patient not found"}

    return {
        "patient_id": patient[0],
        "first_name": patient[1],
        "last_name": patient[2],
        "date_of_birth": patient[3],
        "gender": patient[4],
        "phone": patient[5],
        "address": patient[6]
    }


# ==============================
# UPDATE PATIENT BY ID
# ==============================

@router.put("/{patient_id}")
async def update_patient(
    patient_id: int,
    patient: PatientUpdate
):

    return patient_service.update_patient(
        patient_id,
        patient.first_name,
        patient.last_name,
        patient.date_of_birth,
        patient.gender,
        patient.phone,
        patient.address
    )


# ==============================
# DELETE PATIENT
# ==============================

@router.delete("/{patient_id}")
async def delete_patient(
    patient_id: int
):

    return patient_service.delete_patient(patient_id)