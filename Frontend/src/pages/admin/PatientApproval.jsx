import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PatientApproval.css";

function PatientApproval() {

    const navigate = useNavigate();

    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [approving, setApproving] = useState(null);
    const [admin, setAdmin] = useState(null);


    const fetchPatients = async () => {

    const token = localStorage.getItem("access_token");

    if (!token) {
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

            localStorage.removeItem("access_token");

            navigate("/login");

            return;
        }

        if (!adminResponse.ok) {
            throw new Error("Failed to load admin profile");
        }

        const adminData = await adminResponse.json();

        setAdmin(adminData);


        // =========================
        // FETCH PENDING PATIENTS
        // =========================

        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/admin/patients/pending`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );


        if (response.status === 401) {

            localStorage.removeItem("access_token");

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
                "Failed to load patients"
            );

        }


        const data = await response.json();

        setPatients(data);


    } catch (error) {

        console.error(error);

        setError(
            "Unable to load pending patients."
        );


    } finally {

        setLoading(false);

    }
};

    useEffect(() => {

        fetchPatients();

    }, [navigate]);


    const handleApprove = async (userId) => {

        const token = localStorage.getItem("access_token");

        if (!token) {
            navigate("/login");
            return;
        }


        try {

            setApproving(userId);


            const response = await fetch(
               `${import.meta.env.VITE_API_URL}/admin/patients/${userId}/approve`,                {
                    method: "PUT",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );


            if (response.status === 401) {

                localStorage.removeItem("access_token");

                navigate("/login");

                return;
            }


            if (!response.ok) {

                throw new Error(
                    "Failed to approve patient"
                );

            }


            // Remove approved patient from the list

            setPatients((currentPatients) =>
                currentPatients.filter(
                    (patient) =>
                        patient.user_id !== userId
                )
            );


        } catch (error) {

            console.error(error);

            alert(
                "Unable to approve patient."
            );


        } finally {

            setApproving(null);

        }
    };


    const handleLogout = () => {

        localStorage.removeItem("access_token");
        localStorage.removeItem("user_email");
        localStorage.removeItem("user_role");

        navigate("/login");
    };


    // Loading

    if (loading) {

        return (
            <div className="approval-loading">
                Loading pending patients...
            </div>
        );

    }


    // Error

    if (error) {

        return (
            <div className="approval-error">
                {error}
            </div>
        );

    }


    return (

        <div className="patient-approval-page">


            {/* SIDEBAR */}

            <aside className="profile-sidebar">


                <div className="profile-sidebar-logo">

                    <h2>
                        HMS
                    </h2>

                    <p>
                        Hospital Management
                    </p>

                </div>


                <nav className="profile-sidebar-menu">


                    <button
                        className="profile-menu-item"
                        onClick={() =>
                            navigate("/admin-dashboard")
                        }
                    >
                        🏠 Dashboard
                    </button>


                    <button
                        className="profile-menu-item"
                        onClick={() =>
                            navigate("/admin-profile")
                        }
                    >
                        👤 My Profile
                    </button>


                    <button
                        className="profile-menu-item active"
                        onClick={() =>
                            navigate("/patient-approval")
                        }
                    >
                        👥 Patient Approval
                    </button>


                    <button
                        className="profile-menu-item"
                        onClick={() =>
                            navigate("/doctor-list")
                        }
                    >
                        🩺 Doctors
                    </button>


                    <button
                        className="profile-menu-item"
                        onClick={() =>
                            navigate("/doctor-availability")
                        }
                    >
                        📅 Doctor Availability
                    </button>


                </nav>


                <button
                    className="profile-logout-button"
                    onClick={handleLogout}
                >
                    🚪 Logout
                </button>


            </aside>


            {/* MAIN CONTENT */}

            <main className="profile-content">


               <div className="approval-page-header">

    <div>

        <h1>
            Patient Approval
        </h1>

        <p>
            Review patient information and approve new patient accounts.
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

</div> 

                {patients.length === 0 ? (

                    <section className="profile-card">

                        <div className="no-patients">

                            <div className="no-patients-icon">
                                ✓
                            </div>

                            <h2>
                                No Pending Patients
                            </h2>

                            <p>
                                There are no patients waiting for approval.
                            </p>

                        </div>

                    </section>

                ) : (

                    patients.map((patient) => (

                        <section
                            className="profile-card patient-approval-card"
                            key={patient.user_id}
                        >


                            {/* Profile Header */}

                            <div className="profile-card-header">

                                <div className="large-profile-circle">
                                    👤
                                </div>

                                <div>

                                    <h2>
                                        {patient.first_name}{" "}
                                        {patient.last_name}
                                    </h2>

                                    <p>
                                        {patient.email}
                                    </p>

                                </div>

                            </div>


                            {/* Personal Information */}

                            <div className="profile-section">

                                <h3>
                                    Personal Information
                                </h3>


                                <div className="profile-grid">


                                    <div className="profile-field">

                                        <label>
                                            First Name
                                        </label>

                                        <p>
                                            {patient.first_name ||
                                                "Not available"}
                                        </p>

                                    </div>


                                    <div className="profile-field">

                                        <label>
                                            Last Name
                                        </label>

                                        <p>
                                            {patient.last_name ||
                                                "Not available"}
                                        </p>

                                    </div>


                                    <div className="profile-field">

                                        <label>
                                            Date of Birth
                                        </label>

                                        <p>
                                            {patient.date_of_birth ||
                                                "Not available"}
                                        </p>

                                    </div>


                                    <div className="profile-field">

                                        <label>
                                            Gender
                                        </label>

                                        <p>
                                            {patient.gender ||
                                                "Not available"}
                                        </p>

                                    </div>


                                    <div className="profile-field">

                                        <label>
                                            Phone
                                        </label>

                                        <p>
                                            {patient.phone ||
                                                "Not available"}
                                        </p>

                                    </div>


                                    <div className="profile-field">

                                        <label>
                                            Email
                                        </label>

                                        <p>
                                            {patient.email ||
                                                "Not available"}
                                        </p>

                                    </div>


                                </div>

                            </div>


                            {/* Address */}

                            <div className="profile-section">

                                <h3>
                                    Address
                                </h3>


                                <div className="profile-field full-width">

                                    <label>
                                        Address
                                    </label>

                                    <p>
                                        {patient.address ||
                                            "Not available"}
                                    </p>

                                </div>

                            </div>


                            {/* Account Information */}

                            <div className="profile-section">

                                <h3>
                                    Account Information
                                </h3>


                                <div className="profile-grid">


                                    <div className="profile-field">

                                        <label>
                                            Patient ID
                                        </label>

                                        <p>
                                            {patient.patient_id}
                                        </p>

                                    </div>


                                    <div className="profile-field">

                                        <label>
                                            Account Status
                                        </label>

                                        <p className="pending-status">
                                            Pending Approval
                                        </p>

                                    </div>


                                </div>

                            </div>


                            {/* Approve Button */}

                            <div className="profile-actions">

                                <button
                                    className="approve-patient-button"
                                    onClick={() =>
                                        handleApprove(
                                            patient.user_id
                                        )
                                    }
                                    disabled={
                                        approving ===
                                        patient.user_id
                                    }
                                >

                                    {approving ===
                                    patient.user_id
                                        ? "Approving..."
                                        : "✓ Approve Patient"}

                                </button>

                            </div>


                        </section>

                    ))

                )}


            </main>


        </div>

    );
}


export default PatientApproval;
