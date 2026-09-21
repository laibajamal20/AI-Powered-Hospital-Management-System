import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DoctorProfile.css";

function DoctorProfile() {

    const navigate = useNavigate();

    const [doctor, setDoctor] = useState(null);

    const [formData, setFormData] = useState({
        doctor_name: "",
        phone: "",
        specialization: ""
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    // =====================================================
    // FETCH DOCTOR PROFILE
    // =====================================================

    useEffect(() => {

        const fetchProfile = async () => {

            const token = localStorage.getItem("access_token");

            console.log("DOCTOR PROFILE TOKEN:", token);

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
                    "DOCTOR PROFILE STATUS:",
                    response.status
                );

                const data = await response.json();

                console.log(
                    "DOCTOR PROFILE DATA:",
                    data
                );


                // =================================================
                // TOKEN EXPIRED
                // =================================================

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


                // =================================================
                // FORBIDDEN
                // =================================================

                if (response.status === 403) {

                    throw new Error(
                        data.detail ||
                        "You do not have permission to view this profile."
                    );
                }


                // =================================================
                // OTHER ERROR
                // =================================================

                if (!response.ok) {

                    throw new Error(
                        data.detail ||
                        "Failed to load doctor profile."
                    );
                }


                // =================================================
                // SAVE DOCTOR DATA
                // =================================================

                setDoctor(data);

                setFormData({
                    doctor_name: data.doctor_name || "",
                    phone: data.phone || "",
                    specialization: data.specialization || ""
                });

            } catch (error) {

                console.error(
                    "DOCTOR PROFILE LOAD ERROR:",
                    error
                );

                setError(
                    error.message ||
                    "Unable to load your profile."
                );

            } finally {

                setLoading(false);
            }
        };

        fetchProfile();

    }, [navigate]);


    // =====================================================
    // HANDLE INPUT CHANGE
    // =====================================================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value
        }));

    };


    // =====================================================
    // EDIT PROFILE
    // =====================================================

    const handleEdit = () => {

        setError("");
        setSuccess("");

        setFormData({
            doctor_name: doctor?.doctor_name || "",
            phone: doctor?.phone || "",
            specialization: doctor?.specialization || ""
        });

        setEditMode(true);
    };


    // =====================================================
    // CANCEL EDIT
    // =====================================================

    const handleCancel = () => {

        setFormData({
            doctor_name: doctor?.doctor_name || "",
            phone: doctor?.phone || "",
            specialization: doctor?.specialization || ""
        });

        setEditMode(false);

        setError("");
        setSuccess("");
    };


    // =====================================================
    // SAVE PROFILE
    // =====================================================

    const handleSave = async () => {

        const token = localStorage.getItem("access_token");

        console.log(
            "TOKEN USED FOR UPDATE:",
            token
        );

        if (!token) {

            navigate("/login");

            return;
        }


        // =================================================
        // BASIC FRONTEND VALIDATION
        // =================================================

        if (!formData.doctor_name.trim()) {

            setError("Doctor name is required.");

            return;
        }

        if (!formData.phone.trim()) {

            setError("Phone number is required.");

            return;
        }

        if (!formData.specialization.trim()) {

            setError("Specialization is required.");

            return;
        }


        setSaving(true);
        setError("");
        setSuccess("");


        try {

            const requestBody = {
                doctor_name: formData.doctor_name.trim(),
                phone: formData.phone.trim(),
                specialization: formData.specialization.trim()
            };


            console.log(
                "UPDATE REQUEST BODY:",
                requestBody
            );


            const response = await fetch(
                "http://127.0.0.1:8000/doctors/me",
                {
                    method: "PUT",

                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(requestBody)
                }
            );


            console.log(
                "DOCTOR UPDATE STATUS:",
                response.status
            );


            const data = await response.json();


            console.log(
                "DOCTOR UPDATE RESPONSE:",
                data
            );


            // =================================================
            // TOKEN EXPIRED
            // =================================================

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


            // =================================================
            // FORBIDDEN
            // =================================================

            if (response.status === 403) {

                throw new Error(
                    data.detail ||
                    "You do not have permission to update your profile."
                );
            }


            // =================================================
            // VALIDATION ERROR
            // =================================================

            if (response.status === 422) {

                let validationMessage =
                    "Invalid profile data.";

                if (Array.isArray(data.detail)) {

                    validationMessage = data.detail
                        .map((err) => {

                            const location =
                                Array.isArray(err.loc)
                                    ? err.loc.join(" → ")
                                    : "field";

                            return `${location}: ${err.msg}`;

                        })
                        .join("\n");
                }

                throw new Error(
                    validationMessage
                );
            }


            // =================================================
            // OTHER ERROR
            // =================================================

            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    "Failed to update profile."
                );
            }


            // =================================================
            // UPDATE LOCAL PROFILE
            // =================================================

            setDoctor((previousDoctor) => ({

                ...previousDoctor,

                doctor_name:
                    formData.doctor_name.trim(),

                phone:
                    formData.phone.trim(),

                specialization:
                    formData.specialization.trim()

            }));


            // =================================================
            // EXIT EDIT MODE
            // =================================================

            setEditMode(false);


            // =================================================
            // SUCCESS MESSAGE
            // =================================================

            setSuccess(
                "Profile updated successfully."
            );

        } catch (error) {

            console.error(
                "DOCTOR PROFILE UPDATE ERROR:",
                error
            );

            setError(
                error.message ||
                "Unable to update profile."
            );

        } finally {

            setSaving(false);
        }
    };


    // =====================================================
    // LOGOUT
    // =====================================================

    const handleLogout = () => {

        localStorage.removeItem("access_token");
        localStorage.removeItem("user_email");
        localStorage.removeItem("user_role");
        localStorage.removeItem("user_id");
        localStorage.removeItem("sessionExpiresAt");

        navigate("/login");
    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <div className="profile-loading">
                Loading your profile...
            </div>
        );
    }


    // =====================================================
    // ERROR WITHOUT PROFILE
    // =====================================================

    if (error && !doctor) {

        return (
            <div className="profile-error">

                <h3>
                    Unable to load profile
                </h3>

                <p>
                    {error}
                </p>

                <button
                    onClick={() =>
                        window.location.reload()
                    }
                >
                    Try Again
                </button>

            </div>
        );
    }


    // =====================================================
    // MAIN UI
    // =====================================================

    return (

        <div className="doctor-profile-page">

            {/* =================================================
                SIDEBAR
            ================================================= */}

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
                            navigate("/doctor-dashboard")
                        }
                    >
                        🏠 Dashboard
                    </button>


                    <button
                        className="profile-menu-item active"
                        onClick={() =>
                            navigate("/doctor-profile")
                        }
                    >
                        👤 My Profile
                    </button>


                    <button
                        className="profile-menu-item"
                        onClick={() =>
                            navigate("/doctor-appointments")
                        }
                    >
                        📅 Appointments
                    </button>


                    <button
                        className="profile-menu-item"
                        onClick={() =>
                            navigate("/doctor-patients")
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
                    className="profile-logout-button"
                    onClick={handleLogout}
                >
                    🚪 Logout
                </button>

            </aside>


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main className="profile-content">

                <div className="profile-page-header">

                    <h1>
                        My Profile
                    </h1>

                    <p>
                        View and manage your professional
                        and personal information.
                    </p>

                </div>


                {doctor && (

                    <section className="profile-card">

                        {/* =================================================
                            PROFILE HEADER
                        ================================================= */}

                        <div className="profile-card-header">

                            <div className="large-profile-circle">
                                👨‍⚕️
                            </div>

                            <div>

                                <h2>
                                    {doctor.doctor_name}
                                </h2>

                                <p>
                                    {doctor.email ||
                                        "Not available"}
                                </p>

                            </div>

                        </div>


                        {/* =================================================
                            SUCCESS MESSAGE
                        ================================================= */}

                        {success && (

                            <div className="profile-success">
                                {success}
                            </div>

                        )}


                        {/* =================================================
                            ERROR MESSAGE
                        ================================================= */}

                        {error && (

                            <div className="profile-error">
                                {error}
                            </div>

                        )}


                        {/* =================================================
                            PERSONAL INFORMATION
                        ================================================= */}

                        <div className="profile-section">

                            <h3>
                                Personal Information
                            </h3>


                            <div className="profile-grid">

                                {/* FULL NAME */}

                                <div className="profile-field">

                                    <label>
                                        Full Name
                                    </label>

                                    {editMode ? (

                                        <input
                                            type="text"
                                            name="doctor_name"
                                            value={
                                                formData.doctor_name
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />

                                    ) : (

                                        <p>
                                            {doctor.doctor_name ||
                                                "Not available"}
                                        </p>

                                    )}

                                </div>


                                {/* PHONE */}

                                <div className="profile-field">

                                    <label>
                                        Phone
                                    </label>

                                    {editMode ? (

                                        <input
                                            type="text"
                                            name="phone"
                                            value={
                                                formData.phone
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />

                                    ) : (

                                        <p>
                                            {doctor.phone ||
                                                "Not available"}
                                        </p>

                                    )}

                                </div>


                                {/* EMAIL */}

                                <div className="profile-field">

                                    <label>
                                        Email
                                    </label>

                                    <p>
                                        {doctor.email ||
                                            "Not available"}
                                    </p>

                                </div>

                            </div>

                        </div>


                        {/* =================================================
                            PROFESSIONAL INFORMATION
                        ================================================= */}

                        <div className="profile-section">

                            <h3>
                                Professional Information
                            </h3>


                            <div className="profile-grid">

                                {/* DEPARTMENT ID */}

                                <div className="profile-field">

                                    <label>
                                        Department ID
                                    </label>

                                    <p>
                                        {doctor.department_id ||
                                            "Not available"}
                                    </p>

                                </div>


                                {/* SPECIALIZATION */}

                                <div className="profile-field">

                                    <label>
                                        Specialization
                                    </label>

                                    {editMode ? (

                                        <input
                                            type="text"
                                            name="specialization"
                                            value={
                                                formData.specialization
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />

                                    ) : (

                                        <p>
                                            {doctor.specialization ||
                                                "Not available"}
                                        </p>

                                    )}

                                </div>


                                {/* DEPARTMENT */}

                                <div className="profile-field">

                                    <label>
                                        Department
                                    </label>

                                    <p>
                                        {doctor.department_name ||
                                            "Not available"}
                                    </p>

                                </div>

                            </div>

                        </div>


                        {/* =================================================
                            ACCOUNT INFORMATION
                        ================================================= */}

                        <div className="profile-section">

                            <h3>
                                Account Information
                            </h3>


                            <div className="profile-grid">

                                {/* DOCTOR ID */}

                                <div className="profile-field">

                                    <label>
                                        Doctor ID
                                    </label>

                                    <p>
                                        {doctor.doctor_id ||
                                            "Not available"}
                                    </p>

                                </div>


                                {/* ACCOUNT TYPE */}

                                <div className="profile-field">

                                    <label>
                                        Account Type
                                    </label>

                                    <p>
                                        Doctor
                                    </p>

                                </div>

                            </div>

                        </div>


                        {/* =================================================
                            BUTTONS
                        ================================================= */}

                        <div className="profile-actions">

                            {!editMode ? (

                                <button
                                    className="edit-profile-button"
                                    onClick={handleEdit}
                                >
                                    ✏️ Edit Profile
                                </button>

                            ) : (

                                <>

                                    <button
                                        className="edit-profile-button"
                                        onClick={handleSave}
                                        disabled={saving}
                                    >

                                        {saving
                                            ? "Saving..."
                                            : "💾 Save Changes"}

                                    </button>


                                    <button
                                        className="cancel-profile-button"
                                        onClick={handleCancel}
                                        disabled={saving}
                                    >
                                        ❌ Cancel
                                    </button>

                                </>

                            )}

                        </div>

                    </section>

                )}

            </main>

        </div>
    );
}

export default DoctorProfile;