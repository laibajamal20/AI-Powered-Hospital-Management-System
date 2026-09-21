import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PatientPrescriptions.css";

function PatientPrescriptions() {

    const navigate = useNavigate();

    const [patient, setPatient] = useState(null);
    const [prescriptions, setPrescriptions] = useState([]);
    const [prescriptionDetails, setPrescriptionDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        const fetchData = async () => {

            const token = localStorage.getItem("access_token");

            console.log("PRESCRIPTION TOKEN:", token);

            if (!token) {
                navigate("/login");
                return;
            }

            try {

                // =========================
                // FETCH PATIENT
                // =========================

                const patientResponse = await fetch(
                    "http://127.0.0.1:8000/patients/me",
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
                // FETCH PRESCRIPTIONS
                // =========================

                const prescriptionResponse = await fetch(
                    "http://127.0.0.1:8000/prescriptions/patient/me",
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    }
                );

                console.log(
                    "PRESCRIPTION STATUS:",
                    prescriptionResponse.status
                );

                const prescriptionData =
                    await prescriptionResponse.json();

                console.log(
                    "PRESCRIPTION DATA:",
                    prescriptionData
                );

                if (prescriptionResponse.status === 401) {

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

                if (!prescriptionResponse.ok) {
                    throw new Error(
                        prescriptionData.detail ||
                        "Failed to load prescriptions"
                    );
                }

                setPrescriptions(prescriptionData);


                // =========================
                // FETCH PATIENT PRESCRIPTION DETAILS
                // =========================

                const detailResponse = await fetch(
                    "http://127.0.0.1:8000/prescription-details/patient/me",
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    }
                );

                console.log(
                    "PRESCRIPTION DETAIL STATUS:",
                    detailResponse.status
                );

                const detailData =
                    await detailResponse.json();

                console.log(
                    "PRESCRIPTION DETAIL DATA:",
                    detailData
                );

                if (detailResponse.status === 401) {

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

                if (!detailResponse.ok) {
                    throw new Error(
                        detailData.detail ||
                        "Failed to load prescription details"
                    );
                }

                setPrescriptionDetails(detailData);

            } catch (error) {

                console.error(
                    "PRESCRIPTIONS ERROR:",
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
            <div className="prescriptions-loading">
                Loading prescriptions...
            </div>
        );
    }


    // =========================
    // ERROR
    // =========================

    if (error) {

        return (
            <div className="prescriptions-error">
                Error: {error}
            </div>
        );
    }


    return (

        <div className="patient-prescriptions">


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
                        className="menu-item"
                        onClick={() =>
                            navigate("/book-appointment")
                        }
                    >
                        ➕ Book Appointment
                    </button>


                    <button
                        className="menu-item active"
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
                            My Prescriptions
                        </h1>

                        <p>
                            View your prescribed medicines and prescription details.
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
                    PRESCRIPTION SUMMARY
                ========================= */}

                <section className="stats-container">

                    <div className="stat-card">

                        <div className="stat-icon">
                            💊
                        </div>

                        <div>

                            <p>
                                Total Prescriptions
                            </p>

                            <h2>
                                {prescriptions.length}
                            </h2>

                        </div>

                    </div>

                </section>



                {/* =========================
                    PRESCRIPTIONS SECTION
                ========================= */}

                <section className="dashboard-section">


                    <div className="section-header">

                        <div>

                            <h2>
                                Your Prescriptions
                            </h2>

                            <p>
                                View your prescription information and prescribed medicines.
                            </p>

                        </div>

                    </div>



                    {/* =========================
                        NO PRESCRIPTIONS
                    ========================= */}

                    {prescriptions.length === 0 ? (

                        <div className="empty-prescription">

                            <div className="empty-icon">
                                💊
                            </div>

                            <h3>
                                No prescriptions found
                            </h3>

                            <p>
                                You don't have any prescriptions yet.
                            </p>

                        </div>

                    ) : (


                        /* =========================
                           PRESCRIPTION LIST
                        ========================= */

                        <div className="prescriptions-list">

                            {prescriptions.map((prescription) => {

                                const details =
                                    prescriptionDetails.filter(
                                        (detail) =>
                                            detail.prescription_id ===
                                            prescription.prescription_id
                                    );

                                return (

                                    <div
                                        className="prescription-card"
                                        key={prescription.prescription_id}
                                    >


                                        {/* PRESCRIPTION HEADER */}

                                        <div className="prescription-card-header">

                                            <div>

                                                <h3>
                                                    💊 Prescription ID:{prescription.prescription_id}
                                                </h3>

                                                <p>
                                                    Doctor:{" "}
                                                    {prescription.doctor_name ||
                                                        "Doctor"}
                                                </p>

                                                <p>
                                                    Doctor ID:{" "}
                                                    {prescription.doctor_id}
                                                </p>

                                            </div>

                                            <span className="prescription-date">
                                                {prescription.prescription_date}
                                            </span>

                                        </div>



                                        {/* PRESCRIPTION INFORMATION */}

                                        <div className="prescription-info-grid">


                                            <div className="prescription-info-box">

                                                <span>
                                                    📋 Appointment ID
                                                </span>

                                                <strong>
                                                    {prescription.appointment_id ||
                                                        "Not linked"}
                                                </strong>

                                            </div>


                                            <div className="prescription-info-box">

                                                <span>
                                                    👨‍⚕️ Doctor ID
                                                </span>

                                                <strong>
                                                    {prescription.doctor_id}
                                                </strong>

                                            </div>


                                            <div className="prescription-info-box">

                                                <span>
                                                    📅 Prescription Date
                                                </span>

                                                <strong>
                                                    {prescription.prescription_date}
                                                </strong>

                                            </div>


                                            <div className="prescription-info-box">

                                                <span>
                                                    📝 Notes
                                                </span>

                                                <strong>
                                                    {prescription.notes ||
                                                        "No notes"}
                                                </strong>

                                            </div>

                                        </div>



                                        {/* PRESCRIPTION DETAILS */}

                                        <div className="prescription-details-section">

                                            <h4>
                                                Prescribed Medicines
                                            </h4>


                                            {details.length === 0 ? (

                                                <div className="no-medicine">
                                                    No medicine details available.
                                                </div>

                                            ) : (

                                                <div className="prescription-table-wrapper">

                                                    <table className="prescription-table">

                                                        <thead>

                                                            <tr>

                                                                <th>
                                                                    Medicine
                                                                </th>

                                                                <th>
                                                                    Dosage
                                                                </th>

                                                                <th>
                                                                    Frequency
                                                                </th>

                                                                <th>
                                                                    Duration
                                                                </th>

                                                            </tr>

                                                        </thead>


                                                        <tbody>

                                                            {details.map(
                                                                (detail) => (

                                                                    <tr
                                                                        key={
                                                                            detail.prescription_detail_id
                                                                        }
                                                                    >

                                                                        <td>
                                                                            {
                                                                                detail.medicine_name
                                                                            }
                                                                        </td>

                                                                        <td>
                                                                            {
                                                                                detail.dosage
                                                                            }
                                                                        </td>

                                                                        <td>
                                                                            {
                                                                                detail.frequency
                                                                            }
                                                                        </td>

                                                                        <td>
                                                                            {
                                                                                detail.duration
                                                                            }
                                                                        </td>

                                                                    </tr>

                                                                )
                                                            )}

                                                        </tbody>

                                                    </table>

                                                </div>

                                            )}

                                        </div>

                                    </div>

                                );

                            })}

                        </div>

                    )}

                </section>

            </main>

        </div>
    );
}

export default PatientPrescriptions;