import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./BookAppointmentForm.css";

function BookAppointmentForm() {

    const navigate = useNavigate();
    const location = useLocation();

    const appointmentType = location.state?.appointment_type;

    const [patient, setPatient] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [selectedDoctor, setSelectedDoctor] = useState("");
    const [appointmentDate, setAppointmentDate] = useState("");
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedTime, setSelectedTime] = useState("");
    const [reason, setReason] = useState("");

    const [loading, setLoading] = useState(true);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const token = localStorage.getItem("access_token");


    // =========================
    // FETCH PATIENT + DOCTORS
    // =========================

    useEffect(() => {

        if (!appointmentType) {
            navigate("/book-appointment");
            return;
        }

        const fetchData = async () => {

            try {

                // =========================
                // PATIENT
                // =========================

                const patientResponse = await fetch(
                    `${import.meta.env.VITE_API_URL}/patients/me`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    }
                );

                if (!patientResponse.ok) {
                    throw new Error(
                        "Failed to load patient information"
                    );
                }

                const patientData =
                    await patientResponse.json();

                setPatient(patientData);


                // =========================
                // DOCTORS
                // =========================

                const doctorResponse = await fetch(
                    `${import.meta.env.VITE_API_URL}/doctors/`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    }
                );

                if (!doctorResponse.ok) {
                    throw new Error(
                        "Failed to load doctors"
                    );
                }

                const doctorData =
                    await doctorResponse.json();

                console.log(
                    "DOCTORS DATA:",
                    doctorData
                );


                // =========================
                // CONVERT DOCTOR DATA
                // =========================

                const formattedDoctors =
                    doctorData.map((doctor) => ({

                        doctor_id: doctor[0],

                        department_id: doctor[1],

                        doctor_name: doctor[2],

                        email: doctor[3],

                        phone: doctor[4],

                        specialization: doctor[5],

                        department_name: doctor[6],

                        salary: doctor[7],

                        is_active: doctor[8]

                    }));


                console.log(
                    "FORMATTED DOCTORS:",
                    formattedDoctors
                );


                setDoctors(
                    formattedDoctors
                );


                // =========================
                // CREATE DEPARTMENTS
                // =========================

                const uniqueDepartments = [];


                formattedDoctors.forEach(
                    (doctor) => {

                        if (
                            doctor.department_name
                        ) {

                            const alreadyExists =
                                uniqueDepartments.some(
                                    (department) =>
                                        department.department_name ===
                                        doctor.department_name
                                );


                            if (!alreadyExists) {

                                uniqueDepartments.push({

                                    department_id:
                                        doctor.department_id,

                                    department_name:
                                        doctor.department_name

                                });

                            }

                        }

                    }
                );


                console.log(
                    "DEPARTMENTS:",
                    uniqueDepartments
                );


                setDepartments(
                    uniqueDepartments
                );

            } catch (err) {

                console.error(err);

                setError(
                    err.message
                );

            } finally {

                setLoading(false);

            }

        };


        fetchData();

    }, [
        appointmentType,
        navigate,
        token
    ]);


    // =========================
    // FILTER DOCTORS
    // USING DEPARTMENT NAME
    // =========================

    const filteredDoctors =
        doctors.filter(
            (doctor) =>
                doctor.department_name ===
                selectedDepartment
        );


    // =========================
    // DEPARTMENT CHANGE
    // =========================

    const handleDepartmentChange =
        (e) => {

            setSelectedDepartment(
                e.target.value
            );

            setSelectedDoctor("");

            setAppointmentDate("");

            setAvailableSlots([]);

            setSelectedTime("");

            setError("");

        };


    // =========================
    // DOCTOR CHANGE
    // =========================

    const handleDoctorChange =
        (e) => {

            setSelectedDoctor(
                e.target.value
            );

            setAppointmentDate("");

            setAvailableSlots([]);

            setSelectedTime("");

            setError("");

        };


    // =========================
    // DATE CHANGE
    // =========================

    const handleDateChange =
        async (e) => {

            const date =
                e.target.value;


            setAppointmentDate(
                date
            );

            setSelectedTime("");

            setAvailableSlots([]);

            setError("");


            if (
                !selectedDoctor ||
                !date
            ) {
                return;
            }


            try {

                setLoadingSlots(
                    true
                );


                const response =
                    await fetch(
                        `http://127.0.0.1:8000/appointments/doctor/${selectedDoctor}/availability?appointment_date=${date}`,
                        {
                            method: "GET",

                            headers: {
                                Authorization:
                                    `Bearer ${token}`,

                                "Content-Type":
                                    "application/json"
                            }
                        }
                    );


                if (!response.ok) {

                    const data =
                        await response.json();

                    throw new Error(
                        data.detail ||
                        "Failed to load available times"
                    );

                }


                const data =
                    await response.json();


                console.log(
                    "AVAILABLE SLOTS:",
                    data
                );


                setAvailableSlots(
                    data
                );

            } catch (err) {

                console.error(err);

                setError(
                    err.message
                );

            } finally {

                setLoadingSlots(
                    false
                );

            }

        };


    // =========================
    // CONFIRM APPOINTMENT
    // =========================

    const handleConfirmAppointment =
        async () => {

            setError("");

            setSuccess("");


            if (!selectedDepartment) {

                setError(
                    "Please select a department."
                );

                return;
            }


            if (!selectedDoctor) {

                setError(
                    "Please select a doctor."
                );

                return;
            }


            if (!appointmentDate) {

                setError(
                    "Please select an appointment date."
                );

                return;
            }


            if (!selectedTime) {

                setError(
                    "Please select an available time."
                );

                return;
            }


            if (!reason.trim()) {

                setError(
                    "Please enter the reason for your appointment."
                );

                return;
            }


            try {

                const appointmentId =
                    Date.now();


                const appointmentData = {


                    patient_id:
                        patient.patient_id,

                    doctor_id:
                        Number(
                            selectedDoctor
                        ),

                    appointment_time:
                        selectedTime,

                    status:
                        "scheduled",

                    reason:
                        reason,

                    appointment_date:
                        appointmentDate,

                    appointment_type:
                        appointmentType

                };


                console.log(
                    "APPOINTMENT DATA:",
                    appointmentData
                );


                const response =
                    await fetch(
                        `${import.meta.env.VITE_API_URL}/appointments/`,
                        {
                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                Authorization:
                                    `Bearer ${token}`

                            },

                            body:
                                JSON.stringify(
                                    appointmentData
                                )

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.detail ||
                        "Failed to book appointment"
                    );

                }


                setSuccess(
                    "Appointment booked successfully!"
                );


                setSelectedDepartment("");

                setSelectedDoctor("");

                setAppointmentDate("");

                setAvailableSlots([]);

                setSelectedTime("");

                setReason("");


                setTimeout(() => {

                    navigate(
                        "/patient-appointments"
                    );

                }, 1500);


            } catch (err) {

                console.error(err);

                setError(
                    err.message
                );

            }

        };


    // =========================
    // LOGOUT
    // =========================

    const handleLogout = () => {

        localStorage.removeItem(
            "access_token"
        );

        localStorage.removeItem(
            "user_email"
        );

        localStorage.removeItem(
            "user_role"
        );

        localStorage.removeItem(
            "user_id"
        );

        localStorage.removeItem(
            "sessionExpiresAt"
        );

        navigate("/login");

    };


    // =========================
    // LOADING
    // =========================

    if (loading) {

        return (
            <div className="book-loading">
                Loading...
            </div>
        );

    }


    // =========================
    // ERROR
    // =========================

    if (error && !patient) {

        return (
            <div className="book-error">
                Error: {error}
            </div>
        );

    }


    // =========================
    // PAGE
    // =========================

    return (

        <div className="patient-book-appointment">


            {/* =========================
                SIDEBAR
            ========================= */}

            <aside className="sidebar">

                <div className="sidebar-logo">

                    <h2>
                        HMS
                    </h2>

                    <p>
                        Hospital Management
                    </p>

                </div>


                <nav className="sidebar-menu">

                    <button
                        className="menu-item"
                        onClick={() =>
                            navigate(
                                "/patient-dashboard"
                            )
                        }
                    >
                        🏠 Dashboard
                    </button>


                    <button
                        className="menu-item"
                        onClick={() =>
                            navigate(
                                "/patient-profile"
                            )
                        }
                    >
                        👤 My Profile
                    </button>


                    <button
                        className="menu-item"
                        onClick={() =>
                            navigate(
                                "/patient-appointments"
                            )
                        }
                    >
                        📅 Appointments
                    </button>


                    <button
                        className="menu-item active"
                        onClick={() =>
                            navigate(
                                "/book-appointment"
                            )
                        }
                    >
                        ➕ Book Appointment
                    </button>


                    <button
                        className="menu-item"
                        onClick={() =>
                            navigate(
                                "/patient-prescriptions"
                            )
                        }
                    >
                        💊 Prescriptions
                    </button>

                </nav>


                <button
                    className="logout-button"
                    onClick={
                        handleLogout
                    }
                >
                    🚪 Logout
                </button>

            </aside>



            {/* =========================
                MAIN CONTENT
            ========================= */}

            <main className="dashboard-content">


                {/* =========================
                    HEADER
                ========================= */}

                <header className="dashboard-header">

                    <div>

                        <h1>
                            Book Appointment
                        </h1>

                        <p>
                            Choose how you would like
                            to meet with your doctor.
                        </p>

                    </div>


                    {/* PATIENT INFO */}

                    <div className="patient-info">

                        <div className="profile-circle">
                            👤
                        </div>


                        <div>

                            <strong>

                                {patient
                                    ? `${patient.first_name} ${patient.last_name}`
                                    : "Patient"}

                            </strong>


                            <span>

                                {patient?.email ||
                                    "Patient Account"}

                            </span>

                        </div>

                    </div>

                </header>



                {/* =========================
                    FORM SECTION
                ========================= */}

                <section className="dashboard-section">


                    <div className="section-header">

                        <div>

                            <h2>
                                Appointment Details
                            </h2>

                            <p>
                                Complete the information below
                                to book your appointment.
                            </p>

                        </div>

                    </div>



                    {/* =========================
                        APPOINTMENT TYPE
                    ========================= */}

                    <div className="form-group">

                        <label>
                            Appointment Type
                        </label>

                        <div className="selected-type">

                            {appointmentType === "online"
                                ? "💻 Online Appointment"
                                : "🏥 Physical Appointment"}

                        </div>

                    </div>



                    {/* =========================
                        DEPARTMENT
                    ========================= */}

                    <div className="form-group">

                        <label>
                            Department
                        </label>

                        <select
                            value={
                                selectedDepartment
                            }
                            onChange={
                                handleDepartmentChange
                            }
                            className="form-input"
                        >

                            <option value="">
                                Select Department
                            </option>


                            {departments.map(
                                (department) => (

                                    <option
                                        key={
                                            department.department_name
                                        }
                                        value={
                                            department.department_name
                                        }
                                    >

                                        {
                                            department.department_name
                                        }

                                    </option>

                                )
                            )}

                        </select>

                    </div>



                    {/* =========================
                        DOCTOR
                    ========================= */}

                    <div className="form-group">

                        <label>
                            Doctor
                        </label>

                        <select
                            value={
                                selectedDoctor
                            }
                            onChange={
                                handleDoctorChange
                            }
                            className="form-input"
                            disabled={
                                !selectedDepartment
                            }
                        >

                            <option value="">

                                {selectedDepartment
                                    ? "Select Doctor"
                                    : "Select department first"}

                            </option>


                            {filteredDoctors.map(
                                (doctor) => (

                                    <option
                                        key={
                                            doctor.doctor_id
                                        }
                                        value={
                                            doctor.doctor_id
                                        }
                                    >

                                        {
                                            doctor.doctor_name
                                        }

                                    </option>

                                )
                            )}

                        </select>

                    </div>



                    {/* =========================
                        DATE
                    ========================= */}

                    <div className="form-group">

                        <label>
                            Appointment Date
                        </label>

                        <input
                            type="date"
                            value={
                                appointmentDate
                            }
                            onChange={
                                handleDateChange
                            }
                            min={
                                new Date()
                                    .toISOString()
                                    .split("T")[0]
                            }
                            className="form-input"
                            disabled={
                                !selectedDoctor
                            }
                        />

                    </div>



                    {/* =========================
                        AVAILABLE TIME
                    ========================= */}

                    <div className="form-group">

                        <label>
                            Available Time
                        </label>


                        {!selectedDoctor ||
                        !appointmentDate ? (

                            <div className="empty-slots">

                                Select a doctor and date
                                to see available times.

                            </div>

                        ) : loadingSlots ? (

                            <div className="empty-slots">

                                Loading available times...

                            </div>

                        ) : availableSlots.length === 0 ? (

                            <div className="empty-slots">

                                No availability for this date.

                            </div>

                        ) : (

                            <div className="time-slots">

                                {availableSlots.map(
                                    (slot) => (

                                        <button
                                            key={
                                                slot.time
                                            }
                                            type="button"
                                            disabled={
                                                !slot.available
                                            }
                                            className={
                                                slot.available
                                                    ? selectedTime ===
                                                      slot.time
                                                        ? "time-slot selected"
                                                        : "time-slot"
                                                    : "time-slot booked"
                                            }
                                            onClick={() =>
                                                slot.available &&
                                                setSelectedTime(
                                                    slot.time
                                                )
                                            }
                                        >

                                            {slot.time}

                                        </button>

                                    )
                                )}

                            </div>

                        )}

                    </div>



                    {/* =========================
                        REASON
                    ========================= */}

                    <div className="form-group">

                        <label>
                            Reason for Appointment
                        </label>

                        <textarea
                            value={
                                reason
                            }
                            onChange={(e) =>
                                setReason(
                                    e.target.value
                                )
                            }
                            placeholder="Enter the reason for your appointment"
                            className="form-textarea"
                            rows="4"
                        />

                    </div>



                    {/* =========================
                        ERROR
                    ========================= */}

                    {error && (

                        <div className="form-error">
                            {error}
                        </div>

                    )}



                    {/* =========================
                        SUCCESS
                    ========================= */}

                    {success && (

                        <div className="form-success">
                            {success}
                        </div>

                    )}



                    {/* =========================
                        BUTTONS
                    ========================= */}

                    <div className="booking-continue">

                        <button
                            className="secondary-button"
                            onClick={() =>
                                navigate(
                                    "/book-appointment"
                                )
                            }
                        >
                            Back
                        </button>


                        <button
                            className="primary-button"
                            onClick={
                                handleConfirmAppointment
                            }
                        >
                            Confirm Appointment
                        </button>

                    </div>

                </section>

            </main>

        </div>
    );
}

export default BookAppointmentForm;