import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./BookAppointment.css";

function BookAppointment() {

    const navigate = useNavigate();

    const [patient, setPatient] = useState(null);
    const [selectedType, setSelectedType] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        const fetchPatient = async () => {

            const token = localStorage.getItem("access_token");

            console.log("BOOK APPOINTMENT TOKEN:", token);

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
                            Authorization: `Bearer ${token}`,
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
                        "Failed to load patient information"
                    );
                }

                setPatient(data);

            } catch (error) {

                console.error(
                    "BOOK APPOINTMENT ERROR:",
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
    // SELECT APPOINTMENT TYPE
    // =========================

    const handleContinue = () => {

    if (!selectedType) {
        alert("Please select an appointment type.");
        return;
    }

    console.log(
        "Selected Appointment Type:",
        selectedType
    );

    // Temporary:
    // We will use this value in the booking request.
    navigate("/book-appointment-form", {
        state: {
            appointment_type: selectedType
        }
    });
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

    if (error) {

        return (
            <div className="book-error">
                Error: {error}
            </div>
        );
    }


    return (

        <div className="patient-book-appointment">


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
                        className="menu-item"
                        onClick={() =>
                            navigate("/patient-appointments")
                        }
                    >
                        📅 Appointments
                    </button>


                    <button
                        className="menu-item active"
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
                            Book Appointment
                        </h1>

                        <p>
                            Choose how you would like to meet with your doctor.
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
                    APPOINTMENT TYPE
                ========================= */}

                <section className="dashboard-section">

                    <div className="section-header">

                        <div>

                            <h2>
                                Select Appointment Type
                            </h2>

                            <p>
                                Choose your preferred appointment method.
                            </p>

                        </div>

                    </div>



                    <div className="appointment-type-container">


                        {/* =========================
                            ONLINE
                        ========================= */}

                        <div
                            className={`appointment-type-card ${
                                selectedType === "online"
                                    ? "selected"
                                    : ""
                            }`}
                            onClick={() =>
                                setSelectedType("online")
                            }
                        >

                            <div className="appointment-type-icon">
                                💻
                            </div>


                            <h3>
                                Online Appointment
                            </h3>


                            <p>
                                Consult your doctor online from
                                the comfort of your home.
                            </p>


                            <ul>

                                <li>
                                    ✓ Video consultation
                                </li>

                                <li>
                                    ✓ No need to visit hospital
                                </li>

                                <li>
                                    ✓ Convenient and flexible
                                </li>

                            </ul>


                            <button
                                className={
                                    selectedType === "online"
                                        ? "type-selected-button"
                                        : "type-button"
                                }
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedType("online");
                                }}
                            >
                                {selectedType === "online"
                                    ? "Selected"
                                    : "Select Online"}
                            </button>

                        </div>



                        {/* =========================
                            PHYSICAL
                        ========================= */}

                        <div
                            className={`appointment-type-card ${
                                selectedType === "physical"
                                    ? "selected"
                                    : ""
                            }`}
                            onClick={() =>
                                setSelectedType("physical")
                            }
                        >

                            <div className="appointment-type-icon">
                                🏥
                            </div>


                            <h3>
                                Physical Appointment
                            </h3>


                            <p>
                                Visit the hospital and meet
                                your doctor in person.
                            </p>


                            <ul>

                                <li>
                                    ✓ Face-to-face consultation
                                </li>

                                <li>
                                    ✓ Hospital visit
                                </li>

                                <li>
                                    ✓ In-person examination
                                </li>

                            </ul>


                            <button
                                className={
                                    selectedType === "physical"
                                        ? "type-selected-button"
                                        : "type-button"
                                }
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedType("physical");
                                }}
                            >
                                {selectedType === "physical"
                                    ? "Selected"
                                    : "Select Physical"}
                            </button>

                        </div>

                    </div>



                    {/* =========================
                        CONTINUE
                    ========================= */}

                    <div className="booking-continue">

                        <button
                            className="primary-button"
                            onClick={handleContinue}
                        >
                            Continue
                        </button>

                    </div>

                </section>

            </main>

        </div>
    );
}

export default BookAppointment;
