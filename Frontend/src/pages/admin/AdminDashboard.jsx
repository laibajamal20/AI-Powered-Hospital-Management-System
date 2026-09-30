import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

function AdminDashboard() {

    const navigate = useNavigate();

    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [pendingPatients, setPendingPatients] = useState([]);

    useEffect(() => {

        const fetchAdmin = async () => {

            const token = localStorage.getItem("access_token");
            const role = localStorage.getItem("user_role");

            console.log("ADMIN TOKEN:", token);
            console.log("ADMIN ROLE:", role);

            // No token
            if (!token) {
                navigate("/login");
                return;
            }

            // Prevent patient/doctor from opening admin dashboard
            if (role !== "admin") {
                navigate("/login");
                return;
            }

            try {

                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/admin/me`,
                    {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    }
                );

                console.log("ADMIN STATUS:", response.status);

                const data = await response.json();

                console.log("ADMIN DATA:", data);

                if (response.status === 401) {

                    localStorage.clear();

                    navigate("/login", {
                        state: {
                            sessionTimedOut: true
                        }
                    });

                    return;
                }

                if (!response.ok) {
                    throw new Error(
                        data.detail || "Failed to load admin"
                    );
                }

                setAdmin(data);

                const patientsResponse = await fetch(
                 `${import.meta.env.VITE_API_URL}/admin/patients/pending`,
                  {
                   method: "GET",
                   headers: {
                       "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                   }
);

if (!patientsResponse.ok) {
    throw new Error("Failed to load pending patients");
}

const patientsData = await patientsResponse.json();

setPendingPatients(patientsData);

            } catch (error) {

                console.error(
                    "ADMIN DASHBOARD ERROR:",
                    error
                );

                setError(error.message);

            } finally {

                setLoading(false);

            }
        };

        fetchAdmin();

    }, [navigate]);


    if (loading) {

        return (
            <div className="admin-loading">
                Loading admin dashboard...
            </div>
        );
    }


    if (error) {

        return (
            <div className="admin-error">
                Error: {error}
            </div>
        );
    }


    const handleLogout = () => {

        localStorage.removeItem("access_token");
        localStorage.removeItem("user_email");
        localStorage.removeItem("user_role");
        localStorage.removeItem("user_id");
        localStorage.removeItem("sessionExpiresAt");

        navigate("/login");
    };


    return (

        <div className="admin-dashboard">

            {/* ================= SIDEBAR ================= */}

            <aside className="admin-sidebar">

                <div className="admin-sidebar-logo">

                    <h2>HMS</h2>

                    <p>
                        Hospital Management
                    </p>

                </div>


                <nav className="admin-sidebar-menu">

                    <button
                        className="admin-menu-item active"
                        onClick={() =>
                            navigate("/admin-dashboard")
                        }
                    >
                        🏠 Dashboard
                    </button>


                    <button
                        className="admin-menu-item"
                        onClick={() =>
                            navigate("/admin-profile")
                        }
                    >
                        👤 My Profile
                    </button>


                    <button
                        className="admin-menu-item"
                        onClick={() =>
                            navigate("/patient-approval")
                        }
                    >
                        👥 Patient Approval
                    </button>


                    <button
                        className="admin-menu-item"
                        onClick={() =>
                            navigate("/doctor-list")
                        }
                    >
                        🩺 Doctors
                    </button>


                    <button
                        className="admin-menu-item"
                        onClick={() =>
                            navigate("/doctor-availability")
                        }
                    >
                        📅 Doctor Availability
                    </button>

                </nav>


                <button
                    className="admin-logout-button"
                    onClick={handleLogout}
                >
                    🚪 Logout
                </button>

            </aside>


            {/* ================= MAIN ================= */}

            <main className="admin-dashboard-content">

                {/* HEADER */}

                <header className="admin-dashboard-header">

                    <div>

                        <h1>
                            Admin Dashboard
                        </h1>

                        <p>
                            Welcome back,{" "}
                            {admin?.first_name || "Admin"}!
                        </p>

                    </div>


                    <div className="admin-info">

                        <div className="admin-profile-circle">
                            👤
                        </div>

                        <div>

                            <strong>
                                {admin
                                    ? `${admin.first_name || ""} ${admin.last_name || ""}`
                                    : "Admin"}
                            </strong>

                            <span>
                                {admin?.email || "Admin Account"}
                            </span>

                        </div>

                    </div>

                </header>


                {/* ================= WELCOME ================= */}

                <section className="admin-welcome-card">

                    <div>

                        <h2>
                            Welcome, Admin 👋
                        </h2>

                        <p>
                            Manage patients, doctors and
                            appointments from one place.
                        </p>

                    </div>

                </section>


                {/* ================= STATISTICS ================= */}

                <section className="admin-stats-container">

                    <div className="admin-stat-card">

                        <div className="admin-stat-icon">
                            👥
                        </div>

                        <div>

                            <p>
                                Pending Patients
                            </p>

                            <h2>
                               {pendingPatients.length}
                            </h2>

                        </div>

                    </div>


                    <div className="admin-stat-card">

                        <div className="admin-stat-icon">
                            🩺
                        </div>

                        <div>

                            <p>
                                Total Doctors
                            </p>

                            <h2>
                                0
                            </h2>

                        </div>

                    </div>

                </section>


                {/* ================= PATIENT APPROVAL ================= */}

                <section className="admin-dashboard-section">

                    <div className="admin-section-header">

                        <div>

                            <h2>
                                Patients Waiting for Approval
                            </h2>

                            <p>
                                Review newly registered patients.
                            </p>

                        </div>


                        <button
                            className="admin-view-button"
                            onClick={() =>
                                navigate("/patient-approval")
                            }
                        >
                            View All
                        </button>

                    </div>


                    {pendingPatients.length === 0 ? (

                     <div className="admin-empty-box">

                       <div className="admin-empty-icon">
                            👥
                       </div>

                       <h3>
                         No pending patients
                       </h3>

                      <p>
                          New patient registrations will
                          appear here.
                      </p>

                    </div>

) : (

    <div className="admin-empty-box">

        <div className="admin-empty-icon">
            👥
        </div>

        <h3>
            {pendingPatients.length} patient
            {pendingPatients.length !== 1 ? "s" : ""} waiting
        </h3>

        <p>
            There are patients waiting for approval.
        </p>

        <button
            className="admin-primary-button"
            onClick={() =>
                navigate("/patient-approval")
            }
        >
            Review Patients
        </button>

    </div>

)}

                </section>


                {/* ================= APPOINTMENTS ================= */}

                <section className="admin-dashboard-section">

                    <div className="admin-section-header">

                        <div>

                            <h2>
                                Doctor Appointments
                            </h2>

                            <p>
                                Check doctor schedules and
                                appointment availability.
                            </p>

                        </div>


                        <button
                            className="admin-view-button"
                            onClick={() =>
                                navigate("/doctor-availability")
                            }
                        >
                            Check Availability
                        </button>

                    </div>


                    <div className="admin-availability-box">

                        <div className="availability-icon">
                            📅
                        </div>

                        <div>

                            <h3>
                                Find Available Doctors
                            </h3>

                            <p>
                                Check which doctor is available
                                and when their next appointment
                                is scheduled.
                            </p>

                        </div>


                        <button
                            className="admin-primary-button"
                            onClick={() =>
                                navigate("/doctor-availability")
                            }
                        >
                            Check Schedule
                        </button>

                    </div>

                </section>

            </main>

        </div>
    );
}

export default AdminDashboard;