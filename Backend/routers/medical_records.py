from fastapi import APIRouter

from schemas.medical_record import (
    MedicalRecordCreate,
    MedicalRecordUpdate
)

from services import medical_record_service


router = APIRouter(
    prefix="/medical-records",
    tags=["Medical Records"]
)


@router.post("/")
async def add_medical_record(record: MedicalRecordCreate):
    return medical_record_service.add_medical_record(
        record.record_id,
        record.patient_id,
        record.doctor_id,
        record.diagnosis,
        record.signs,
        record.treatment,
        record.record_date
    )


@router.get("/")
async def view_medical_records():
    return medical_record_service.view_medical_records()


@router.get("/{record_id}")
async def view_medical_record(record_id: int):
    return medical_record_service.view_medical_record(record_id)


@router.put("/{record_id}")
async def update_medical_record(
    record_id: int,
    record: MedicalRecordUpdate
):
    return medical_record_service.update_medical_record(
        record_id,
        record.diagnosis,
        record.signs,
        record.treatment,
        record.record_date
    )


@router.delete("/{record_id}")
async def delete_medical_record(record_id: int):
    return medical_record_service.delete_medical_record(record_id)