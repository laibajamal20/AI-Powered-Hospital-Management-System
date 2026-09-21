from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import (patients,
    departments,
    doctors,
    appointments,
    rooms,
    medicines,
    admissions,
    medical_records,
    prescriptions,
    prescription_details,
    bills,
    payments,
    auth,
    admin,
    heart_prediction)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(patients.router)
app.include_router(departments.router)
app.include_router(doctors.router)
app.include_router(doctors.public_router)

app.include_router(appointments.router)
app.include_router(rooms.router)
app.include_router(medicines.router)
app.include_router(admissions.router)
app.include_router(medical_records.router)
app.include_router(prescriptions.router)
app.include_router(prescription_details.router)
app.include_router(bills.router)
app.include_router(payments.router)
app.include_router(admin.router)
app.include_router(heart_prediction.router)