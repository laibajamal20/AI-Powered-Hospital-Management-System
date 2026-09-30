import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PatientAppointments.css";

function PatientAppointments() {

    const navigate = useNavigate();

    const [patient, setPatient] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        const fetchData = async () => {

            const token = localStorage.getItem("access_token");

            console.log("APPOINTMENT TOKEN:", token);

            if (!token) {
                navigate("/login");
                return;
            }

            try {

                // =========================
                // FETCH PATIENT
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

                console.log(
                    "PATIENT STATUS:",
                    patientResponse.status
                );

                const patientData =
                    await patientResponse.json();

                if (patientResponse.status === 401) {

                    localStorage.removeItem("access_token");
                    localStorage.removeItem("user_email");
                    localStorage.removeItem("user_role");
                    localStorage.removeItem("user_id");
                    localStorage.removeItem("sessionExpiresAt");

                    navigate("/login", {
                        state: {
                            sessionTimedOut: true
                        }
                    });

                    return;
                }

                if (!patientResponse.ok) {
                    throw new Error(
                        patientData.detail ||
                        "Failed to load patient information"
                    );
                }

                setPatient(patientData);


                // =========================
                // FETCH APPOINTMENTS
                // =========================

                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/appointments/patient/me`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    }
                );

                console.log(
                    "APPOINTMENT STATUS:",
                    response.status
                );

                const data = await response.json();

                console.log(
                    "APPOINTMENT DATA:",
                    data
                );

                if (response.status === 401) {

                    localStorage.removeItem("access_token");
                    localStorage.removeItem("user_email");
                    localStorage.removeItem("user_role");
                    localStorage.removeItem("user_id");
                    localStorage.removeItem("sessionExpiresAt");

                    navigate("/login", {
                        state: {
                            sessionTimedOut: true
                        }
                    });

                    return;
                }

                if (!response.ok) {

                    throw new Error(
                        data.detail ||
                        "Failed to load appointments"
                    );
                }

                setAppointments(data);

            } catch (error) {

                console.error(
                    "APPOINTMENTS ERROR:",
                    error
                );

                setError(error.message);

            } finally {

                setLoading(false);
            }
        };

        fetchData();

    }, [navigate]);


    // =========================
    // LOGOUT
    // =========================

    const handleLogout = () => {

        localStorage.removeItem("access_token");
        localStorage.removeItem("user_email");
        localStorage.removeItem("user_role");
        localStorage.removeItem("user_id");
        localStorage.removeItem("sessionExpiresAt");

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

        <div className="patient-appointments">


            {/* =========================
                SIDEBAR
            ========================= */}

            <aside className="sidebar">

                <div className="sidebar-logo">

                    <h2>HMS</h2>

                    <p>
                        Hospital Management
                    </p>

                </div>


                <nav className="sidebar-menu">

                    <button
                        className="menu-item"
                        onClick={() =>
                            navigate("/patient-dashboard")
                        }
                    >
                        🏠 Dashboard
                    </button>


                    <button
                        className="menu-item"
                        onClick={() =>
                            navigate("/patient-profile")
                        }
                    >
                        👤 My Profile
                    </button>


                    <button
                        className="menu-item active"
                        onClick={() =>
                            navigate("/patient-appointments")
                        }
                    >
                        📅 Appointments
                    </button>


                    <button
                        className="menu-item"
                        onClick={() =>
                            navigate("/book-appointment")
                        }
                    >
                        ➕ Book Appointment
                    </button>


                    <button
                        className="menu-item"
                        onClick={() =>
                            navigate("/patient-prescriptions")
                        }
                    >
                        💊 Prescriptions
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


                    {/* PATIENT NAME + EMAIL */}

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
                    APPOINTMENT SUMMARY
                ========================= */}

                <section className="stats-container">

                    <div className="stat-card">

                        <div className="stat-icon">
                            📅
                        </div>

                        <div>

                            <p>
                                Total Appointments
                            </p>

                            <h2>
                                {appointments.length}
                            </h2>

                        </div>

                    </div>

                </section>



                {/* =========================
                    APPOINTMENTS SECTION
                ========================= */}

                <section className="dashboard-section">


                    <div className="section-header">

                        <div>

                            <h2>
                                Your Appointments
                            </h2>

                            <p>
                                All your scheduled and previous appointments.
                            </p>

                        </div>


                        <button
                            className="view-button"
                            onClick={() =>
                                navigate("/book-appointment")
                            }
                        >
                            + Book Appointment
                        </button>

                    </div>



                    {/* =========================
                        NO APPOINTMENTS
                    ========================= */}

                    {appointments.length === 0 ? (

                        <div className="empty-appointment">

                            <div className="empty-icon">
                                📅
                            </div>

                            <h3>
                                No appointments found
                            </h3>

                            <p>
                                You don't have any appointments yet.
                            </p>


                            <button
                                className="primary-button"
                                onClick={() =>
                                    navigate("/book-appointment")
                                }
                            >
                                Book Appointment
                            </button>

                        </div>

                    ) : (


                        /* =========================
                           APPOINTMENT LIST
                        ========================= */

                        <div className="appointments-list">

                            {appointments.map((appointment) => (

                                <div
                                    className="appointment-card"
                                    key={appointment.appointment_id}
                                >


                                    <div className="appointment-card-header">

                                        <div>

                                            <h3>
                                                🩺 {appointment.doctor_name} 
                                            </h3>
                                            <p>
                                                Doctor ID:{" "}
                                                {appointment.doctor_id}
                                            </p>

                                            <p>
                                                Appointment ID:{" "}
                                                {appointment.appointment_id}
                                            </p>

                                        </div>


                                        <span
                                            className={`appointment-status ${
                                                appointment.status?.toLowerCase()
                                            }`}
                                        >
                                            {appointment.status}
                                        </span>

                                    </div>



                                    <div className="appointment-details">


                                        <div className="appointment-detail">

                                            <span>
                                                📅 Date
                                            </span>

                                            <strong>
                                                {appointment.appointment_date}
                                            </strong>

                                        </div>


                                        <div className="appointment-detail">

                                            <span>
                                                🕐 Time
                                            </span>

                                            <strong>
                                                {appointment.appointment_time}
                                            </strong>

                                        </div>


                                        <div className="appointment-detail">

                                            <span>
                                                📝 Reason
                                            </span>

                                            <strong>
                                                {appointment.reason ||
                                                    "Not provided"}
                                            </strong>

                                        </div>

                                        <div className="appointment-detail">

                                                <span>
                                                   🏥 Type
                                                </span>

                                                <strong>
                                                  {appointment.appointment_type === "online"
                                                      ? "Online"
                                                     : "Physical"}
                                                </strong>

                                        </div>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </section>

            </main>

        </div>
    );
}

export default PatientAppointments;
