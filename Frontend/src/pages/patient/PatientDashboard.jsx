import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PatientDashboard.css";

function PatientDashboard() {

    const navigate = useNavigate();

    const [patient, setPatient] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    useEffect(() => {

        const fetchPatient = async () => {

            // Get JWT token
            const token = localStorage.getItem("access_token");

            console.log("PATIENT TOKEN:", token);


            // No token → go to login
            if (!token) {

                navigate("/login");

                return;
            }


            try {

                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/patients/me`,
                    {
                        method: "GET",

                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    }
                );


                console.log(
                    "PATIENT STATUS:",
                    response.status
                );


                const data = await response.json();


                console.log(
                    "PATIENT DATA:",
                    data
                );


                // =========================
                // TOKEN EXPIRED / INVALID
                // =========================

                if (response.status === 401) {

                    console.log(
                        "PATIENT TOKEN EXPIRED OR INVALID"
                    );


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
                // OTHER ERRORS
                // =========================

                if (!response.ok) {

                    throw new Error(
                        data.detail ||
                        "Failed to load patient"
                    );
                }


                // =========================
                // SUCCESS
                // =========================

                setPatient(data);
// FETCH PATIENT APPOINTMENTS
const appointmentsResponse = await fetch(
    `${import.meta.env.VITE_API_URL}/appointments/patient/me`,
    {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    }
);

const appointmentsData = await appointmentsResponse.json();

console.log(
    "DASHBOARD APPOINTMENTS:",
    appointmentsData
);

if (!appointmentsResponse.ok) {
    throw new Error(
        appointmentsData.detail ||
        "Failed to load appointments"
    );
}

setAppointments(appointmentsData);

            } catch (error) {

                console.error(
                    "PATIENT DASHBOARD ERROR:",
                    error
                );


                setError(error.message);


            } finally {

                setLoading(false);

            }
        };


        fetchPatient();

    }, [navigate]);


    // =========================
    // LOADING
    // =========================

    if (loading) {

        return (
            <div className="dashboard-loading">
                Loading dashboard...
            </div>
        );
    }


    // =========================
    // ERROR
    // =========================

    if (error) {

        return (
            <div className="dashboard-error">
                Error: {error}
            </div>
        );
    }


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


    return (

        <div className="patient-dashboard">


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
                        className="menu-item active"
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
                        className="menu-item"
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
                    onClick={handleLogout}
                >
                    🚪 Logout
                </button>


            </aside>


                

            <main className="dashboard-content">
                {/* =========================
                    WELCOME CARD
                ========================= */}

                <section className="welcome-card">


                    <div>

                        <h2>

                            Welcome,{" "}
                            {patient?.first_name ||
                                "Patient"} 👋

                        </h2>


                        <p>
                            Manage your appointments,
                            profile and prescriptions
                            from one place.
                        </p>


                        {patient && (

                            <p>
                                Patient ID:{" "}
                                {patient.patient_id}
                            </p>

                        )}

                    </div>


                </section>

                
                 {/* =========================
    HEADER
========================= */}

<header className="dashboard-header">

    <div>

        <h1>
            My Appointments
        </h1>

        <p>
            View and manage my appointments.
        </p>

    </div>


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
                    STATISTICS
                ========================= */}

                <section className="stats-container">


                    <div className="stat-card">

                        <div className="stat-icon">
                            📅
                        </div>


                        <div>

                            <p>
                                Upcoming Appointments
                            </p>

                            <h2>
                                {appointments.filter(
                                  (appointment) =>
                                   appointment.status?.toLowerCase() !== "cancelled" &&
                                   appointment.status?.toLowerCase() !== "completed").length}
                            </h2>

                        </div>

                    </div>


                </section>
                {/* =========================
                    UPCOMING APPOINTMENT
                ========================= */}

                <section className="dashboard-section">


                    <div className="section-header">


                        <div>

                            <h2>
                                Upcoming Appointment
                            </h2>

                            <p>
                                Your next scheduled
                                appointment
                            </p>

                        </div>


                        <button
                            className="view-button"
                            onClick={() =>
                                navigate(
                                    "/patient-appointments"
                                )
                            }
                        >
                            View All
                        </button>


                    </div>

{
    appointments.filter(
        (appointment) =>
            appointment.status?.toLowerCase() !== "cancelled" &&
            appointment.status?.toLowerCase() !== "completed"
    ).length === 0 ? (

        <div className="empty-appointment">

            <div className="empty-icon">
                📅
            </div>

            <h3>
                No upcoming appointments
            </h3>

            <p>
                You don't have any upcoming appointments.
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

        <div className="upcoming-appointment-card">

            {appointments
                .filter(
                    (appointment) =>
                        appointment.status?.toLowerCase() !== "cancelled" &&
                        appointment.status?.toLowerCase() !== "completed"
                )
                .slice(0, 1)
                .map((appointment) => (

                    <div key={appointment.appointment_id}>

                        <h3>
                            🩺 Doctor ID:{" "}
                            {appointment.doctor_id}
                        </h3>

                        <p>
                            📅 {appointment.appointment_date}
                        </p>

                        <p>
                            🕐 {appointment.appointment_time}
                        </p>

                        <p>
                            🏥 Type:{" "}
                          <strong>
                             {appointment.appointment_type === "online"
                                 ? "Online"
                                 : "Physical"}
                            </strong>
                      </p>

                        <p>
                            Status:{" "}
                            <strong>
                                {appointment.status}
                            </strong>
                        </p>

                    </div>

                ))}

        </div>
    )
}


                </section>


            </main>


        </div>
    );
}


export default PatientDashboard;
