from pydantic import BaseModel
from datetime import time
from typing import List


class AdminDoctorCreate(BaseModel):
    doctor_name: str
    email: str
    phone: str
    specialization: str
    department_id: int
    salary: float


class DoctorUpdate(BaseModel):
    doctor_name: str
    email: str
    phone: str
    specialization: str
    department_id: int
    salary: float


class DoctorProfileUpdate(BaseModel):
    doctor_name: str
    phone: str
    specialization: str


class DoctorSetPassword(BaseModel):
    password: str


class AvailabilityItem(BaseModel):
    day_of_week: str
    start_time: time
    end_time: time


class DoctorAvailabilityRequest(BaseModel):
    doctor_id: int
    availability: List[AvailabilityItem]