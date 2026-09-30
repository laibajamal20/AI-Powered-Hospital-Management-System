import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DoctorList.css";

function DoctorList() {

    const navigate = useNavigate();

    const [doctors, setDoctors] = useState([]);
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    useEffect(() => {

        const fetchDoctors = async () => {

            const token = localStorage.getItem("access_token");
            const role = localStorage.getItem("user_role");


            if (!token) {
                navigate("/login");
                return;
            }


            if (role !== "admin") {
                navigate("/login");
                return;
            }


            try {

                // =========================
                // FETCH ADMIN PROFILE
                // =========================

                const adminResponse = await fetch(
                    `${import.meta.env.VITE_API_URL}/admin/me`,
                    {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    }
                );


                if (adminResponse.status === 401) {

                    localStorage.clear();

                    navigate("/login");

                    return;
                }


                if (!adminResponse.ok) {

                    throw new Error(
                        "Failed to load admin profile"
                    );

                }


                const adminData = await adminResponse.json();

                setAdmin(adminData);


                // =========================
                // FETCH DOCTORS
                // =========================

                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/admin/doctors`,
                    {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    }
                );


                if (response.status === 401) {

                    localStorage.clear();

                    navigate("/login");

                    return;
                }


                if (response.status === 403) {

                    setError(
                        "You do not have permission to access this page."
                    );

                    return;
                }


                if (!response.ok) {

                    throw new Error(
                        "Failed to load doctors"
                    );

                }


                const data = await response.json();

                setDoctors(data);


            } catch (error) {

                console.error(
                    "DOCTOR LIST ERROR:",
                    error
                );

                setError(
                    "Unable to load doctors."
                );


            } finally {

                setLoading(false);

            }

        };


        fetchDoctors();

    }, [navigate]);


    // =========================
    // CHANGE DOCTOR STATUS
    // =========================

    const handleStatusChange = async (
        doctorId,
        currentStatus
    ) => {

        const token = localStorage.getItem("access_token");


        try {

            const response = await fetch(
                `http://127.0.0.1:8000/admin/doctors/${doctorId}/status?is_active=${!currentStatus}`,
                {
                    method: "PUT",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );


            if (response.status === 401) {

                localStorage.clear();

                navigate("/login");

                return;
            }


            if (response.status === 403) {

                setError(
                    "You do not have permission to change doctor status."
                );

                return;
            }


            if (!response.ok) {

                throw new Error(
                    "Failed to update doctor status"
                );

            }


            // Update doctor status immediately
            setDoctors((previousDoctors) =>
                previousDoctors.map((doctor) =>
                    doctor.doctor_id === doctorId
                        ? {
                            ...doctor,
                            is_active: !currentStatus
                        }
                        : doctor
                )
            );


        } catch (error) {

            console.error(
                "DOCTOR STATUS ERROR:",
                error
            );

            setError(
                "Unable to update doctor status."
            );

        }

    };


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
            <div className="doctor-list-loading">
                Loading doctors...
            </div>
        );

    }


    // =========================
    // ERROR
    // =========================

    if (error) {

        return (
            <div className="doctor-list-error">
                {error}
            </div>
        );

    }


    return (

        <div className="doctor-list-page">


            {/* ================= SIDEBAR ================= */}

            <aside className="admin-sidebar">


                <div className="admin-sidebar-logo">

                    <h2>
                        HMS
                    </h2>

                    <p>
                        Hospital Management
                    </p>

                </div>


                <nav className="admin-sidebar-menu">


                    <button
                        className="admin-menu-item"
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
                        className="admin-menu-item active"
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


            {/* ================= MAIN CONTENT ================= */}

            <main className="doctor-list-content">


                {/* ================= HEADER ================= */}

                <div className="doctor-list-header">


                    <div>

                        <h1>
                            Doctors
                        </h1>

                        <p>
                            View and manage registered doctors.
                        </p>

                    </div>


                    <div className="doctor-header-right">


                        {/* REGISTER DOCTOR BUTTON */}

                        <button
                            className="register-doctor-button"
                            onClick={() =>
                                navigate("/register-doctor")
                            }
                        >
                            ➕ Register New Doctor
                        </button>


                        {/* ADMIN INFO */}

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


                    </div>


                </div>


                {/* ================= DOCTOR LIST ================= */}

                {doctors.length === 0 ? (

                    <section className="doctor-empty-card">


                        <div className="doctor-empty-icon">
                            🩺
                        </div>


                        <h2>
                            No Doctors Found
                        </h2>


                        <p>
                            No doctors have been registered yet.
                        </p>


                        <button
                            className="register-doctor-button"
                            onClick={() =>
                                navigate("/register-doctor")
                            }
                        >
                            ➕ Register New Doctor
                        </button>


                    </section>

                ) : (

                    <section className="doctor-table-card">


                        <div className="doctor-table-container">


                            <table className="doctor-table">


                                <thead>

                                    <tr>

                                        <th>
                                            Doctor ID
                                        </th>

                                        <th>
                                            Name
                                        </th>

                                        <th>
                                            Department
                                        </th>

                                        <th>
                                            Specialization
                                        </th>

                                        <th>
                                            Phone
                                        </th>

                                        <th>
                                            Email
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Action
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>


                                    {doctors.map((doctor) => (

                                        <tr
                                            key={doctor.doctor_id}
                                        >


                                            {/* DOCTOR ID */}

                                            <td>
                                                {doctor.doctor_id}
                                            </td>


                                            {/* NAME */}

                                            <td>

                                                <strong>
                                                    {doctor.doctor_name}
                                                </strong>

                                            </td>


                                            {/* DEPARTMENT */}

                                            <td>

                                                {doctor.department_name ||
                                                    "Not available"}

                                            </td>


                                            {/* SPECIALIZATION */}

                                            <td>

                                                {doctor.specialization ||
                                                    "Not available"}

                                            </td>


                                            {/* PHONE */}

                                            <td>

                                                {doctor.phone ||
                                                    "Not available"}

                                            </td>


                                            {/* EMAIL */}

                                            <td>

                                                {doctor.email ||
                                                    "Not available"}

                                            </td>


                                            {/* STATUS */}

                                            <td>

                                                <span
                                                    className={
                                                        doctor.is_active
                                                            ? "doctor-status active"
                                                            : "doctor-status inactive"
                                                    }
                                                >

                                                    {doctor.is_active
                                                        ? "Active"
                                                        : "Inactive"}

                                                </span>

                                            </td>


                                            {/* ACTION */}

                                            <td>

                                                <button
                                                    className={
                                                        doctor.is_active
                                                            ? "doctor-action-button deactivate"
                                                            : "doctor-action-button activate"
                                                    }
                                                    onClick={() =>
                                                        handleStatusChange(
                                                            doctor.doctor_id,
                                                            doctor.is_active
                                                        )
                                                    }
                                                >

                                                    {doctor.is_active
                                                        ? "Deactivate"
                                                        : "Activate"}

                                                </button>

                                            </td>


                                        </tr>

                                    ))}


                                </tbody>


                            </table>


                        </div>


                    </section>

                )}


            </main>


        </div>

    );

}


export default DoctorList;