import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DoctorAppointments.css";


function DoctorAppointments() {

    const navigate = useNavigate();

    const [appointments, setAppointments] = useState([]);
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    useEffect(() => {

        const fetchData = async () => {

            const token = localStorage.getItem(
                "access_token"
            );


            // =========================
            // NO TOKEN → LOGIN
            // =========================

            if (!token) {

                navigate("/login");

                return;
            }


            try {

                // =========================
                // FETCH DOCTOR
                // =========================

                const doctorResponse = await fetch(
                    `${import.meta.env.VITE_API_URL}/doctors/me`,
                    {
                        method: "GET",

                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    }
                );


                const doctorData =
                    await doctorResponse.json();


                // =========================
                // TOKEN EXPIRED
                // =========================

                if (doctorResponse.status === 401) {

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


                    navigate("/login", {
                        state: {
                            sessionTimedOut: true
                        }
                    });

                    return;
                }


                // =========================
                // ROLE NOT ALLOWED
                // =========================

                if (doctorResponse.status === 403) {

                    setError(
                        doctorData.detail ||
                        "You do not have permission to access this resource"
                    );

                    return;
                }


                if (!doctorResponse.ok) {

                    throw new Error(
                        doctorData.detail ||
                        "Failed to load doctor"
                    );
                }


                setDoctor(doctorData);


                // =========================
                // FETCH APPOINTMENTS
                // =========================

                const appointmentResponse =
                    await fetch(
                        `${import.meta.env.VITE_API_URL}/appointments/doctor/me`,
                        {
                            method: "GET",

                            headers: {
                                "Authorization": `Bearer ${token}`,
                                "Content-Type": "application/json"
                            }
                        }
                    );


                const appointmentData =
                    await appointmentResponse.json();


                // =========================
                // APPOINTMENT ERROR
                // =========================

                if (appointmentResponse.status === 401) {

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


                    navigate("/login", {
                        state: {
                            sessionTimedOut: true
                        }
                    });

                    return;
                }


                if (appointmentResponse.status === 403) {

                    setError(
                        appointmentData.detail ||
                        "You do not have permission to view appointments"
                    );

                    return;
                }


                if (!appointmentResponse.ok) {

                    throw new Error(
                        appointmentData.detail ||
                        "Failed to load appointments"
                    );
                }


                setAppointments(
                    appointmentData
                );

            } catch (error) {

                console.error(
                    "DOCTOR APPOINTMENTS ERROR:",
                    error
                );


                setError(
                    error?.message ||
                    "Unable to load appointments."
                );

            } finally {

                setLoading(false);
            }
        };


        fetchData();

    }, [navigate]);

    // =========================
// UPDATE APPOINTMENT STATUS
// =========================

const updateAppointmentStatus = async (
    appointmentId,
    newStatus
) => {

    const token = localStorage.getItem(
        "access_token"
    );

    try {

        const response = await fetch(
            `http://127.0.0.1:8000/appointments/doctor/${appointmentId}/status?status=${newStatus}`,
            {
                method: "PUT",

                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.detail ||
                data.error ||
                "Failed to update appointment status"
            );
        }

        // Update the appointment immediately on screen
        setAppointments((currentAppointments) =>
            currentAppointments.map((appointment) =>
                appointment.appointment_id === appointmentId
                    ? {
                        ...appointment,
                        status: newStatus
                    }
                    : appointment
            )
        );

    } catch (error) {

        console.error(
            "UPDATE APPOINTMENT STATUS ERROR:",
            error
        );

        setError(
            error?.message ||
            "Unable to update appointment status."
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
            <div className="appointments-loading">
                Loading appointments...
            </div>
        );
    }


    // =========================
    // ERROR
    // =========================

    if (error) {

        return (
            <div className="appointments-error">
                Error: {error}
            </div>
        );
    }


    return (

        <div className="doctor-appointments-page">


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
                                "/doctor-dashboard"
                            )
                        }
                    >
                        🏠 Dashboard
                    </button>


                    <button
                        className="menu-item"
                        onClick={() =>
                            navigate(
                                "/doctor-profile"
                            )
                        }
                    >
                        👨‍⚕️ My Profile
                    </button>


                    <button
                        className="menu-item active"
                        onClick={() =>
                            navigate(
                                "/doctor-appointments"
                            )
                        }
                    >
                        📅 Appointments
                    </button>


                    <button
                        className="menu-item"
                        onClick={() =>
                            navigate(
                                "/doctor-patients"
                            )
                        }
                    >
                        👥 My Patients
                    </button>


                    <button
                        className="menu-item"
                        onClick={() =>
                            navigate(
                                "/heart-disease-prediction"
                            )
                        }
                    >
                        ❤️ Heart Disease Prediction
                    </button>


                </nav>


                <button
                    className="logout-button"
                    onClick={handleLogout}
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
                            My Appointments
                        </h1>

                        <p>
                            View and manage your appointments.
                        </p>

                    </div>


                    {/* EXACT SAME AS DASHBOARD */}

                    <div className="patient-info">


                        <div className="profile-circle">
                            👨‍⚕️
                        </div>


                        <div>

                            <strong>

                                {" "}
                                {doctor?.doctor_name ||
                                    "Doctor"}

                            </strong>


                            <span>

                                {doctor?.email ||
                                    "Doctor Account"}

                            </span>

                        </div>


                    </div>


                </header>


                {/* =========================
                    APPOINTMENTS
                ========================= */}

                <section className="dashboard-section">


                    <div className="section-header">


                        <div>

                            <h2>
                                My Appointments
                            </h2>

                            <p>
                                View your scheduled
                                patient appointments.
                            </p>

                        </div>


                    </div>


                    {appointments.length === 0 ? (

                        <div className="no-appointments">

                            <div className="empty-icon">
                                📅
                            </div>

                            <h3>
                                No Appointments
                            </h3>

                            <p>
                                You currently have no
                                scheduled appointments.
                            </p>

                        </div>

                    ) : (

                        <div className="appointments-list">

                            {appointments.map(
                                (appointment) => (

                                    <div
                                        className="appointment-card"
                                        key={
                                            appointment.appointment_id
                                        }
                                    >


                                        <div className="appointment-card-header">


                                            <div>

                                                <h3>
                                                    Appointment ID:{" "}
                                                    {
                                                        appointment.appointment_id
                                                    }
                                                </h3>

                                                <p>
                                                    Patient ID:{" "}
                                                    {
                                                        appointment.patient_id
                                                    }
                                                </p>

                                            </div>


                                            <div className="appointment-status-control">

    <span
        className={`status-badge ${
            appointment.status
                ?.toLowerCase()
        }`}
    >
        {appointment.status}
    </span>

    <select
        value={appointment.status || "scheduled"}
        onChange={(e) =>
            updateAppointmentStatus(
                appointment.appointment_id,
                e.target.value
            )
        }
    >
        <option value="scheduled">
            Scheduled
        </option>

        <option value="completed">
            Completed
        </option>

        <option value="cancelled">
            Cancelled
        </option>
    </select>

</div>


                                        </div>


                                        <div className="appointment-details">


                                            <div className="appointment-detail">

                                                <span>
                                                    Date
                                                </span>

                                                <strong>
                                                    {
                                                        appointment.appointment_date
                                                    }
                                                </strong>

                                            </div>


                                            <div className="appointment-detail">

                                                <span>
                                                    Time
                                                </span>

                                                <strong>
                                                    {
                                                        appointment.appointment_time
                                                    }
                                                </strong>

                                            </div>


                                            <div className="appointment-detail">

                                                <span>
                                                    Type
                                                </span>

                                                <strong>
                                                    {
                                                        appointment.appointment_type
                                                    }
                                                </strong>

                                            </div>


                                            <div className="appointment-detail">

                                                <span>
                                                    Reason
                                                </span>

                                                <strong>
                                                    {
                                                        appointment.reason ||
                                                        "Not provided"
                                                    }
                                                </strong>

                                            </div>


                                        </div>


                                    </div>

                                )
                            )}

                        </div>

                    )}


                </section>


            </main>


        </div>
    );
}


export default DoctorAppointments;