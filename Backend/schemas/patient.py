from pydantic import BaseModel
from datetime import date

from pydantic import BaseModel, EmailStr


class PatientRegister(BaseModel):
    first_name: str
    last_name: str
    date_of_birth: str | None = None
    gender: str | None = None
    phone: str | None = None
    address: str | None = None
    email: EmailStr
    password: str

class PatientUpdate(BaseModel):
    first_name: str
    last_name: str
    date_of_birth: date
    gender: str
    phone: str
    address: str

class PatientCreate(BaseModel):
    first_name: str
    last_name: str
    date_of_birth: date
    gender: str
    phone: str
    address: str