from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordBearer
from datetime import date
from fastapi import Query

from schemas.appointment import (
    AppointmentCreate,
    AppointmentUpdate
)

from services import appointment_service

from utils.jwt_handler import get_current_user, require_role

router = APIRouter(
    prefix="/appointments",
    tags=["Appointments"]
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

@router.post("/")
async def add_appointment(
    appointment: AppointmentCreate
):
    return appointment_service.add_appointment(
        appointment.patient_id,
        appointment.doctor_id,
        appointment.appointment_time,
        appointment.status,
        appointment.reason,
        appointment.appointment_date,
        appointment.appointment_type
    )


@router.get("/")
async def view_appointments():
    return appointment_service.view_appointments()


@router.get("/patient/me")
async def view_my_appointments(
    current_user=Depends(require_role("patient"))
):
    return appointment_service.view_patient_appointments(
        current_user["user_id"]
    )


@router.get("/doctor/me")
async def view_my_doctor_appointments(
    current_user=Depends(require_role("doctor"))
):
    return appointment_service.view_doctor_appointments(
        current_user["user_id"]
    )


@router.get("/doctor/{doctor_id}/availability")
async def get_doctor_available_slots(
    doctor_id: int,
    appointment_date: date
):
    return appointment_service.get_doctor_available_slots(
        doctor_id,
        appointment_date
    )


@router.get("/{appointment_id}")
async def view_appointment(
    appointment_id: int
):
    return appointment_service.view_appointment(
        appointment_id
    )


@router.put("/doctor/{appointment_id}/status")
async def update_doctor_appointment_status(
    appointment_id: int,
    status: str,
    current_user=Depends(require_role("doctor"))
):
    return appointment_service.update_doctor_appointment_status(
        appointment_id,
        status,
        current_user["user_id"]
    )

@router.put("/{appointment_id}")
async def update_appointment(
    appointment_id: int,
    appointment: AppointmentUpdate
):
    return appointment_service.update_appointment(
        appointment_id,
        appointment.appointment_time,
        appointment.status,
        appointment.reason,
        appointment.appointment_date,
        appointment.appointment_type
    )


@router.delete("/{appointment_id}")
async def delete_appointment(
    appointment_id: int
):
    return appointment_service.delete_appointment(
        appointment_id
    )