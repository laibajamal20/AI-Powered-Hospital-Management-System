from fastapi import APIRouter, HTTPException

from google.oauth2 import id_token
from google.auth.transport import requests

from schemas.auth import (
    GoogleLoginRequest,
    PatientRegister,
    LoginRequest,
    OTPVerifyRequest,
    ResendOTPRequest
)

from services.auth_service import (
    get_user_by_email,
    update_google_id,
    register_patient
)

from services.otp_service import (
    generate_otp,
    save_otp,
    get_otp_by_email,
    clear_otp
)

from services.email_service import send_otp_email

from passlib.context import CryptContext
from datetime import datetime

from utils.jwt_handler import create_access_token


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


# ============================================================
# REGISTER PATIENT
# ============================================================

@router.post("/register")
async def register_patient_account(data: PatientRegister):

    password_hash = pwd_context.hash(data.password)

    try:

        result = register_patient(
            data.first_name,
            data.last_name,
            data.date_of_birth,
            data.gender,
            data.phone,
            data.address,
            data.email,
            password_hash
        )

        return {
            "message": "Patient registered successfully. Waiting for admin approval.",
            "user_id": result["user_id"],
            "patient_id": result["patient_id"]
        }

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@router.post("/google")
async def google_login(data: GoogleLoginRequest):

    try:

        google_user = id_token.verify_oauth2_token(
            data.credential,
            requests.Request()
        )

        email = google_user.get("email")
        name = google_user.get("name")
        google_id = google_user.get("sub")

        # ----------------------------------------------------
        # CHECK USER
        # ----------------------------------------------------

        user = get_user_by_email(email)

        if not user:

            raise HTTPException(
                status_code=404,
                detail="Patient account not found. Please register first."
            )

        (
            user_id,
            user_email,
            password_hash,
            role,
            existing_google_id,
            is_active,
            is_approved
        ) = user

        # ----------------------------------------------------
        # GOOGLE LOGIN ONLY FOR PATIENTS
        # ----------------------------------------------------

        if role != "patient":

            raise HTTPException(
                status_code=403,
                detail="Google login is only available for patients."
            )

        # ----------------------------------------------------
        # CHECK ACTIVE
        # ----------------------------------------------------

        if not is_active:

            raise HTTPException(
                status_code=403,
                detail="Your account is inactive."
            )

        # ----------------------------------------------------
        # CHECK APPROVAL
        # ----------------------------------------------------

        if not is_approved:

            raise HTTPException(
                status_code=403,
                detail="Your account has not been approved by the admin yet."
            )

        # ----------------------------------------------------
        # SAVE GOOGLE ID
        # ----------------------------------------------------

        if not existing_google_id:

            update_google_id(
                user_id,
                google_id
            )

        # ----------------------------------------------------
        # CREATE JWT
        # ----------------------------------------------------

        access_token = create_access_token(
            {
                "user_id": user_id,
                "email": email,
                "role": role
            }
        )

        # ----------------------------------------------------
        # RETURN LOGIN RESPONSE
        # ----------------------------------------------------

        return {
            "message": "Google login successful",
            "user_id": user_id,
            "email": email,
            "name": name,
            "role": role,
            "access_token": access_token
        }

    except ValueError:

        raise HTTPException(
            status_code=401,
            detail="Invalid Google credential"
        )

# ============================================================
# NORMAL LOGIN
# ============================================================

@router.post("/login")
async def login(data: LoginRequest):

    print("LOGIN STARTED")
    print("EMAIL:", data.email)
    print("ROLE:", data.role)

    # FIND USER
    print("STEP 1: Finding user")

    user = get_user_by_email(data.email)

    print("STEP 1 DONE - USER:", user)

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    (
        user_id,
        user_email,
        password_hash,
        role,
        google_id,
        is_active,
        is_approved
    ) = user

    print("STEP 2: User data loaded")
    print("ROLE FROM DATABASE:", role)

    if role != data.role:
        raise HTTPException(
            status_code=403,
            detail="Selected role does not match this account."
        )

    if not is_active:
        raise HTTPException(
            status_code=403,
            detail="Your account is inactive."
        )

    if role == "patient" and not is_approved:
        raise HTTPException(
            status_code=403,
            detail="Your account has not been approved by the admin yet."
        )

    print("STEP 3: Checking password")

    if not pwd_context.verify(
        data.password,
        password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    print("STEP 3 DONE - PASSWORD CORRECT")

    print("STEP 4: Generating OTP")

    otp, expiry = generate_otp()

    print("STEP 4 DONE - OTP GENERATED")

    print("STEP 5: Saving OTP")

    save_otp(
        data.email,
        otp,
        expiry
    )

    print("STEP 5 DONE - OTP SAVED")

    print("STEP 6: Sending OTP email")

    await send_otp_email(
        data.email,
        otp
    )

    print("STEP 6 DONE - EMAIL SENT")

    return {
        "message": "OTP sent to your registered email.",
        "requires_2fa": True,
        "email": data.email,
        "role": role
    }
# ============================================================
# VERIFY OTP
# ============================================================

@router.post("/verify-otp")
async def verify_otp(data: OTPVerifyRequest):

    print("\n================================")
    print("OTP VERIFICATION STARTED")
    print("================================")

    print("EMAIL:", data.email)
    print("RECEIVED OTP:", data.otp)

    # --------------------------------------------------------
    # GET OTP FROM DATABASE
    # --------------------------------------------------------

    result = get_otp_by_email(
        data.email
    )

    print("DATABASE OTP RESULT:", result)

    if not result or not result[0]:

        print("ERROR: NO ACTIVE OTP FOUND")

        raise HTTPException(
            status_code=400,
            detail="No active OTP found. Please request a new OTP."
        )

    stored_otp, otp_expiry = result

    print("STORED OTP:", stored_otp)
    print("OTP EXPIRY:", otp_expiry)
    print("CURRENT UTC TIME:", datetime.utcnow())

    # --------------------------------------------------------
    # CHECK OTP EXPIRY FIRST
    # --------------------------------------------------------

    if otp_expiry and datetime.utcnow() > otp_expiry:

        print("ERROR: OTP EXPIRED")

        clear_otp(
            data.email
        )

        raise HTTPException(
            status_code=400,
            detail="OTP has expired. Please request a new OTP."
        )

    # --------------------------------------------------------
    # CHECK OTP
    # --------------------------------------------------------

    if str(stored_otp).strip() != str(data.otp).strip():

        print("ERROR: INVALID OTP")

        raise HTTPException(
            status_code=400,
            detail="Invalid OTP."
        )

    # --------------------------------------------------------
    # OTP CORRECT
    # --------------------------------------------------------

    print("OTP VERIFIED SUCCESSFULLY")

    clear_otp(
        data.email
    )

    # --------------------------------------------------------
    # GET USER
    # --------------------------------------------------------

    user = get_user_by_email(
        data.email
    )

    if not user:

        print("ERROR: USER NOT FOUND")

        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    (
        user_id,
        user_email,
        password_hash,
        role,
        google_id,
        is_active,
        is_approved
    ) = user

    # --------------------------------------------------------
    # CHECK USER ACTIVE
    # --------------------------------------------------------

    if not is_active:

        raise HTTPException(
            status_code=403,
            detail="Your account is inactive."
        )

    # --------------------------------------------------------
    # CREATE JWT
    # --------------------------------------------------------

    access_token = create_access_token(
        {
            "sub": user_email,
            "user_id": user_id,
            "role": role
        }
    )

    print("JWT CREATED")
    print("USER:", user_email)
    print("ROLE:", role)
    print("USER ID:", user_id)
    print("================================\n")

    # --------------------------------------------------------
    # RETURN TOKEN
    # --------------------------------------------------------

    return {
        "message": "Two-factor authentication successful.",
        "user_id": user_id,
        "email": user_email,
        "role": role,
        "access_token": access_token,
        "token_type": "bearer"
    }


# ============================================================
# RESEND OTP
# ============================================================

@router.post("/resend-otp")
async def resend_otp(data: ResendOTPRequest):

    user = get_user_by_email(data.email)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Account with this email not found."
        )

    otp, expiry = generate_otp()

    print("--------------------------------")
    print("RESENDING OTP")
    print("EMAIL:", data.email)
    print("OTP:", otp)
    print("EXPIRY:", expiry)
    print("--------------------------------")

    save_otp(
        data.email,
        otp,
        expiry
    )

    await send_otp_email(
        data.email,
        otp
    )

    return {
        "message": "A new verification code has been sent to your email."
    }
