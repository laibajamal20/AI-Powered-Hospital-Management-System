
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DoctorDashboard.css";


function DoctorDashboard() {

    const navigate = useNavigate();

    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    useEffect(() => {

        const fetchDoctor = async () => {

            // =========================
            // GET JWT TOKEN
            // =========================

            const token = localStorage.getItem(
                "access_token"
            );


            console.log(
                "DOCTOR TOKEN:",
                token
            );


            // =========================
            // NO TOKEN → LOGIN
            // =========================

            if (!token) {

                navigate("/login");

                return;
            }


            try {

                const response = await fetch(
                    "http://127.0.0.1:8000/doctors/me",
                    {
                        method: "GET",

                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    }
                );


                console.log(
                    "DOCTOR STATUS:",
                    response.status
                );


                const data = await response.json();


                console.log(
                    "DOCTOR DATA:",
                    data
                );


                // =========================
                // TOKEN EXPIRED / INVALID
                // =========================

                if (response.status === 401) {

                    console.log(
                        "DOCTOR TOKEN EXPIRED OR INVALID"
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
                // ROLE NOT ALLOWED
                // =========================

                if (response.status === 403) {

                    console.log(
                        "DOCTOR DOES NOT HAVE PERMISSION"
                    );


                    setError(
                        data.detail ||
                        "You do not have permission to access this resource"
                    );


                    return;
                }


                // =========================
                // OTHER ERRORS
                // =========================

                if (!response.ok) {

                    throw new Error(
                        data.detail ||
                        "Failed to load doctor"
                    );
                }


                // =========================
                // SUCCESS
                // =========================

                setDoctor(data);


            } catch (error) {

                console.error(
                    "DOCTOR DASHBOARD ERROR:",
                    error
                );


                setError(
                    typeof error === "string"
                    ? error
                    : error?.message || "Failed to load doctor dashboard"
                );


            } finally {

                setLoading(false);

            }
        };


        fetchDoctor();

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

        <div className="doctor-dashboard">


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
                        className="menu-item active"
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
                        className="menu-item"
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
                            Doctor Dashboard
                        </h1>

                        <p>
                            Welcome back, {" "}
                            {doctor?.doctor_name ||
                                "Doctor"}!
                        </p>

                    </div>


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
                    WELCOME CARD
                ========================= */}

                <section className="welcome-card">


                    <div>

                        <h2>

                            Welcome, {" "}
                            {doctor?.doctor_name ||
                                "Doctor"} 👋

                        </h2>


                        <p>

                            Manage your patients,
                            appointments and
                            heart disease predictions
                            from one place.

                        </p>


                        {doctor && (

                            <p className="patient-id">

                                Doctor ID:{" "}
                                {doctor.doctor_id}

                            </p>

                        )}

                    </div>


                    <button
                        className="primary-button"
                        onClick={() =>
                            navigate(
                                "/doctor-appointments"
                            )
                        }
                    >
                        View Appointments
                    </button>


                </section>


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
                                0
                            </h2>

                        </div>

                    </div>


                    <div className="stat-card">

                        <div className="stat-icon">
                            👥
                        </div>


                        <div>

                            <p>
                                My Patients
                            </p>

                            <h2>
                                0
                            </h2>

                        </div>

                    </div>


                </section>


                {/* =========================
                    PROFESSIONAL INFORMATION
                ========================= */}

                <section className="dashboard-section">


                    <div className="section-header">


                        <div>

                            <h2>
                                My Professional Information
                            </h2>

                            <p>
                                Your doctor account
                                information
                            </p>

                        </div>


                        <button
                            className="view-button"
                            onClick={() =>
                                navigate(
                                    "/doctor-profile"
                                )
                            }
                        >
                            View Profile →
                        </button>


                    </div>


                    <div className="doctor-info-grid">


                        <div className="doctor-info-item">

                            <span>
                                Doctor Name
                            </span>

                            <strong>

                                {" "}
                                {doctor?.doctor_name ||
                                    "Not available"}

                            </strong>

                        </div>


                        <div className="doctor-info-item">

                            <span>
                                Email
                            </span>

                            <strong>

                                {doctor?.email ||
                                    "Not available"}

                            </strong>

                        </div>


                        <div className="doctor-info-item">

                            <span>
                                Phone
                            </span>

                            <strong>

                                {doctor?.phone ||
                                    "Not available"}

                            </strong>

                        </div>


                        <div className="doctor-info-item">

                            <span>
                                Specialization
                            </span>

                            <strong>

                                {doctor?.specialization ||
                                    "Not available"}

                            </strong>

                        </div>


                        <div className="doctor-info-item">

                            <span>
                                Department
                            </span>

                            <strong>

                                {doctor?.department_name ||
                                    "Not available"}

                            </strong>

                        </div>


                    </div>


                </section>


                {/* =========================
                    QUICK ACTIONS
                ========================= */}

                <section className="dashboard-section">


                    <div className="section-header">

                        <div>

                            <h2>
                                Quick Actions
                            </h2>

                            <p>
                                Quickly access your
                                main doctor services.
                            </p>

                        </div>

                    </div>


                    <div className="quick-actions">


                        <button
                            className="primary-button"
                            onClick={() =>
                                navigate(
                                    "/doctor-appointments"
                                )
                            }
                        >
                            📅 View Appointments
                        </button>


                        <button
                            className="primary-button"
                            onClick={() =>
                                navigate(
                                    "/doctor-patients"
                                )
                            }
                        >
                            👥 View Patients
                        </button>


                        <button
                            className="primary-button"
                            onClick={() =>
                                navigate(
                                    "/heart-disease-prediction"
                                )
                            }
                        >
                            ❤️ Heart Disease Prediction
                        </button>


                    </div>


                </section>


            </main>


        </div>
    );
}


export default DoctorDashboard;

