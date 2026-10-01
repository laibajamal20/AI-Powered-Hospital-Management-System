from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from passlib.context import CryptContext

from schemas.doctor import (
    AdminDoctorCreate,
    DoctorUpdate,
    DoctorSetPassword,
    DoctorAvailabilityRequest
)

from utils.jwt_handler import (
    get_current_user,
    require_role
)

from services import doctor_service
from services import prescription_service

from services.auth_service import (
    register_doctor,
    get_user_by_email,
    create_password_setup_token,
    get_user_by_password_reset_token,
    update_doctor_password
)

from services.email_service import send_doctor_setup_email

from database import conn


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/doctors",
    tags=["Doctors"],
    dependencies=[Depends(get_current_user)]
)


# ============================================================
# PUBLIC ROUTER
# PASSWORD SETUP
# ============================================================

public_router = APIRouter(
    prefix="/doctors",
    tags=["Doctor Password Setup"]
)


pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


# ============================================================
# GET ALL DOCTORS
# ============================================================

@router.get("/")
async def view_doctors():

    return doctor_service.view_doctors()


# ============================================================
# GET CURRENT DOCTOR PROFILE
# IMPORTANT: /me BEFORE /{doctor_id}
# ============================================================

@router.get("/me")
async def get_my_profile(
    current_user: dict = Depends(require_role("doctor"))
):

    user_id = current_user["user_id"]

    print("CURRENT USER:", current_user)
    print("DOCTOR USER ID:", user_id)

    doctor = doctor_service.view_doctor_by_user_id(
        user_id
    )

    print("DOCTOR FROM DATABASE:", doctor)

    if not doctor:
        raise HTTPException(
            status_code=404,
            detail="Doctor profile not found"
        )

    return {
        "doctor_id": doctor[0],
        "user_id": doctor[1],
        "doctor_name": doctor[2],
        "email": doctor[3],
        "phone": doctor[4],
        "specialization": doctor[5],
        "department_name": doctor[6],
        "department_id": doctor[7],
        "salary": float(doctor[8])
        if doctor[8] is not None
        else None,
        "is_active": doctor[9]
    }


# ============================================================
# DOCTOR UPDATE OWN PROFILE
# ============================================================

@router.put("/me")
async def update_my_profile(
    doctor: DoctorUpdate,
    current_user: dict = Depends(require_role("doctor"))
):

    user_id = current_user["user_id"]

    existing_doctor = (
        doctor_service.view_doctor_by_user_id(
            user_id
        )
    )

    if not existing_doctor:
        raise HTTPException(
            status_code=404,
            detail="Doctor profile not found"
        )

    result = doctor_service.update_doctor_profile(
        user_id,
        doctor.doctor_name,
        doctor.phone,
        doctor.specialization
    )

    return result


# ============================================================
# ADMIN REGISTER DOCTOR
# ============================================================

@router.post("/admin/register")
async def admin_register_doctor(
    doctor: AdminDoctorCreate,
    current_user: dict = Depends(require_role("admin"))
):

    existing_user = get_user_by_email(
        doctor.email
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="A user with this email already exists."
        )

    try:

        result = register_doctor(
            doctor.doctor_name,
            doctor.email,
            doctor.phone,
            doctor.specialization,
            doctor.department_id,
            doctor.salary,
            ""
        )

        user_id = result["user_id"]
        doctor_id = result["doctor_id"]

        # Generate password setup token
        token_data = create_password_setup_token(
            user_id
        )

        token = token_data["token"]

        setup_link = (
             f"https://ai-powered-hospital-management-system-my0bvin09-my-team-ecd2.vercel.app/set-password/{token}")

        # Send doctor setup email
        await send_doctor_setup_email(
            doctor.email,
            doctor.doctor_name,
            setup_link
        )

        return {
            "message": (
                "Doctor registered successfully. "
                "Password setup email sent."
            ),
            "user_id": user_id,
            "doctor_id": doctor_id
        }

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# ============================================================
# SET DOCTOR PASSWORD
# PUBLIC ROUTE
# ============================================================

@public_router.post("/set-password/{token}")
async def set_doctor_password(
    token: str,
    data: DoctorSetPassword
):

    result = get_user_by_password_reset_token(
        token
    )

    if not result:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired password setup link."
        )

    user_id, email, role, expiry = result

    # Check token expiry
    if datetime.utcnow() > expiry:

        raise HTTPException(
            status_code=400,
            detail="Password setup link has expired."
        )

    # Make sure token belongs to doctor
    if role != "doctor":

        raise HTTPException(
            status_code=403,
            detail="Invalid doctor password setup link."
        )

    password_hash = pwd_context.hash(
        data.password
    )

    update_doctor_password(
        user_id,
        password_hash
    )

    return {
        "message": (
            "Password created successfully. "
            "You can now log in."
        )
    }


# ============================================================
# GET SINGLE DOCTOR
# ============================================================

@router.get("/{doctor_id}")
async def view_single_doctor(
    doctor_id: int
):

    doctor = doctor_service.view_doctor(
        doctor_id
    )

    if doctor is None:

        return {
            "message": "Doctor not found"
        }

    return {
        "doctor_id": doctor[0],
        "user_id": doctor[1],
        "doctor_name": doctor[2],
        "email": doctor[3],
        "phone": doctor[4],
        "specialization": doctor[5],
        "department_name": doctor[6],
        "department_id": doctor[7],
        "salary": float(doctor[8])
        if doctor[8] is not None
        else None,
        "is_active": doctor[9]
    }


# ============================================================
# ADMIN UPDATE DOCTOR
# ============================================================

@router.put("/{doctor_id}")
async def update_doctor(
    doctor_id: int,
    doctor: DoctorUpdate
):

    return doctor_service.update_doctor(
        doctor_id,
        doctor.doctor_name,
        doctor.email,
        doctor.phone,
        doctor.specialization,
        doctor.department_id,
        doctor.salary
    )


# ============================================================
# DOCTOR PRESCRIPTIONS
# ============================================================

@router.get("/me/prescriptions")
async def get_my_prescriptions(
    current_user: dict = Depends(require_role("doctor"))
):

    return prescription_service.view_doctor_prescriptions(
        current_user["user_id"]
    )


# ============================================================
# DOCTOR'S PATIENTS
# ============================================================

@router.get("/me/patients")
async def get_my_patients(
    current_user: dict = Depends(require_role("doctor"))
):

    cursor = conn.cursor()

    try:

        # ====================================================
        # GET DOCTOR ID
        # ====================================================

        cursor.execute(
            """
            SELECT doctor_id
            FROM doctors
            WHERE user_id = %s
              AND is_active = TRUE
            """,
            (
                current_user["user_id"],
            )
        )

        doctor = cursor.fetchone()

        if not doctor:

            raise HTTPException(
                status_code=404,
                detail="Doctor profile not found"
            )

        doctor_id = doctor[0]

        # ====================================================
        # GET DOCTOR'S PATIENTS
        # ====================================================

        cursor.execute(
            """
            SELECT
                p.patient_id,
                p.first_name,
                p.last_name,
                p.date_of_birth,
                p.gender,
                p.phone,
                p.address,

                a.appointment_id,
                a.appointment_date,
                a.appointment_time,

                pr.prescription_id,
                pr.prescription_date,
                pr.notes

            FROM patients p

            INNER JOIN appointments a
                ON p.patient_id = a.patient_id

            LEFT JOIN prescriptions pr
                ON pr.patient_id = p.patient_id
                AND pr.doctor_id = %s
                AND pr.appointment_id = a.appointment_id

            WHERE a.doctor_id = %s
              AND p.is_active = TRUE
              AND a.is_active = TRUE

            ORDER BY
                p.first_name,
                p.last_name,
                a.appointment_date
            """,
            (
                doctor_id,
                doctor_id
            )
        )

        rows = cursor.fetchall()

        patients = []

        for row in rows:

            patients.append({
                "patient_id": row[0],
                "first_name": row[1],
                "last_name": row[2],
                "date_of_birth": row[3],
                "gender": row[4],
                "phone": row[5],
                "address": row[6],

                "appointment_id": row[7],
                "appointment_date": row[8],
                "appointment_time": row[9],

                "prescription_id": row[10],
                "prescription_date": row[11],
                "prescription_notes": row[12]
            })

        return patients

    except HTTPException:

        raise

    except Exception as e:

        conn.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:

        cursor.close()


# ============================================================
# ADMIN
# GET ACTIVE DOCTORS FOR AVAILABILITY
# ============================================================

@router.get("/admin/availability/doctors")
async def get_doctors_for_availability(
    current_user: dict = Depends(require_role("admin"))
):

    cursor = conn.cursor()

    try:

        cursor.execute(
            """
            SELECT
                d.doctor_id,
                d.doctor_name,
                d.department_id,
                dep.department_name

            FROM doctors d

            LEFT JOIN departments dep
                ON d.department_id = dep.department_id

            WHERE d.is_active = TRUE

            ORDER BY d.doctor_name
            """
        )

        rows = cursor.fetchall()

        doctors = []

        for row in rows:

            doctors.append({
                "doctor_id": row[0],
                "doctor_name": row[1],
                "department_id": row[2],
                "department_name": row[3]
            })

        return doctors

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:

        cursor.close()


# ============================================================
# ADMIN
# SAVE DOCTOR AVAILABILITY
# ============================================================

@router.post("/admin/availability")
async def save_doctor_availability(
    data: DoctorAvailabilityRequest,
    current_user: dict = Depends(require_role("admin"))
):

    cursor = conn.cursor()

    try:

        # Remove existing schedule
        cursor.execute(
            """
            DELETE FROM doctor_availability
            WHERE doctor_id = %s
            """,
            (
                data.doctor_id,
            )
        )

        # Insert new schedule
        for item in data.availability:

            if item.start_time >= item.end_time:

                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Invalid time for "
                        f"{item.day_of_week}"
                    )
                )

            cursor.execute(
                """
                INSERT INTO doctor_availability
                (
                    doctor_id,
                    day_of_week,
                    start_time,
                    end_time,
                    is_active
                )
                VALUES (%s, %s, %s, %s, TRUE)
                """,
                (
                    data.doctor_id,
                    item.day_of_week,
                    item.start_time,
                    item.end_time
                )
            )

        conn.commit()

        return {
            "message": (
                "Doctor availability saved successfully"
            )
        }

    except HTTPException:

        conn.rollback()
        raise

    except Exception as e:

        conn.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:

        cursor.close()


# ============================================================
# ADMIN
# GET DOCTOR AVAILABILITY
# ============================================================

@router.get("/admin/availability/{doctor_id}")
async def get_doctor_availability(
    doctor_id: int,
    current_user: dict = Depends(require_role("admin"))
):

    cursor = conn.cursor()

    try:

        cursor.execute(
            """
            SELECT
                availability_id,
                day_of_week,
                start_time,
                end_time,
                is_active

            FROM doctor_availability

            WHERE doctor_id = %s
              AND is_active = TRUE

            ORDER BY
                CASE day_of_week
                    WHEN 'Monday' THEN 1
                    WHEN 'Tuesday' THEN 2
                    WHEN 'Wednesday' THEN 3
                    WHEN 'Thursday' THEN 4
                    WHEN 'Friday' THEN 5
                    WHEN 'Saturday' THEN 6
                    WHEN 'Sunday' THEN 7
                END,
                start_time
            """,
            (
                doctor_id,
            )
        )

        rows = cursor.fetchall()

        availability = []

        for row in rows:

            availability.append({
                "availability_id": row[0],
                "day_of_week": row[1],
                "start_time": str(row[2]),
                "end_time": str(row[3]),
                "is_active": row[4]
            })

        return availability

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:

        cursor.close()