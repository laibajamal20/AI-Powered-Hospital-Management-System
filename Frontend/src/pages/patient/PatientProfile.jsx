import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PatientProfile.css";

function PatientProfile() {
    const navigate = useNavigate();

    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState("");

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        date_of_birth: "",
        gender: "",
        phone: "",
        address: "",
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        const token = localStorage.getItem("access_token");

        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const response = await fetch(
                "http://127.0.0.1:8000/patients/me",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 401) {
                localStorage.removeItem("access_token");
                navigate("/login");
                return;
            }

            if (!response.ok) {
                throw new Error("Failed to load patient profile");
            }

            const data = await response.json();

            setPatient(data);

            setFormData({
                first_name: data.first_name || "",
                last_name: data.last_name || "",
                date_of_birth: data.date_of_birth || "",
                gender: data.gender || "",
                phone: data.phone || "",
                address: data.address || "",
            });

        } catch (error) {
            console.error(error);
            setError("Unable to load your profile.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleEdit = () => {
        setEditMode(true);
        setSuccess("");
    };

    const handleCancel = () => {
        setFormData({
            first_name: patient.first_name || "",
            last_name: patient.last_name || "",
            date_of_birth: patient.date_of_birth || "",
            gender: patient.gender || "",
            phone: patient.phone || "",
            address: patient.address || "",
        });

        setEditMode(false);
        setSuccess("");
    };

    const handleSave = async () => {
        const token = localStorage.getItem("access_token");

        if (!token) {
            navigate("/login");
            return;
        }

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const response = await fetch(
                "http://127.0.0.1:8000/patients/me",
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            );

            if (response.status === 401) {
                localStorage.removeItem("access_token");
                navigate("/login");
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail || "Failed to update profile"
                );
            }

            // Update displayed patient information
            setPatient((previous) => ({
                ...previous,
                ...formData,
            }));

            setEditMode(false);
            setSuccess("Profile updated successfully!");

        } catch (error) {
            console.error(error);
            setError(error.message || "Unable to update profile.");
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_email");
        localStorage.removeItem("user_role");

        navigate("/login");
    };

    if (loading) {
        return (
            <div className="profile-loading">
                Loading your profile...
            </div>
        );
    }

    if (error && !patient) {
        return (
            <div className="profile-error">
                {error}
            </div>
        );
    }

    return (
        <div className="patient-profile-page">

            {/* SIDEBAR */}
            <aside className="profile-sidebar">

                <div className="profile-sidebar-logo">
                    <h2>HMS</h2>

                    <p>
                        Hospital Management
                    </p>
                </div>

                <nav className="profile-sidebar-menu">

                    <button
                        className="profile-menu-item"
                        onClick={() =>
                            navigate("/patient-dashboard")
                        }
                    >
                        🏠 Dashboard
                    </button>

                    <button
                        className="profile-menu-item active"
                        onClick={() =>
                            navigate("/patient-profile")
                        }
                    >
                        👤 My Profile
                    </button>

                    <button
                        className="profile-menu-item"
                        onClick={() =>
                            navigate("/patient-appointments")
                        }
                    >
                        📅 Appointments
                    </button>

                    <button
                        className="profile-menu-item"
                        onClick={() =>
                            navigate("/book-appointment")
                        }
                    >
                        ➕ Book Appointment
                    </button>

                    <button
                        className="profile-menu-item"
                        onClick={() =>
                            navigate("/patient-prescriptions")
                        }
                    >
                        💊 Prescriptions
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

                <div className="profile-page-header">

                    <h1>
                        My Profile
                    </h1>

                    <p>
                        {editMode
                            ? "Edit your personal information."
                            : "View your personal information."}
                    </p>

                </div>


                {success && (
                    <div className="profile-success">
                        {success}
                    </div>
                )}

                {error && patient && (
                    <div className="profile-error">
                        {error}
                    </div>
                )}


                {patient && (

                    <section className="profile-card">

                        {/* PROFILE HEADER */}
                        <div className="profile-card-header">

                            <div className="large-profile-circle">
                                👤
                            </div>

                            <div>

                                {editMode ? (
                                    <h2>
                                        {formData.first_name}{" "}
                                        {formData.last_name}
                                    </h2>
                                ) : (
                                    <h2>
                                        {patient.first_name}{" "}
                                        {patient.last_name}
                                    </h2>
                                )}

                                {/* EMAIL - NOT EDITABLE */}
                                <p>
                                    {patient.email ||
                                        "Not available"}
                                </p>

                            </div>

                        </div>


                        {/* PERSONAL INFORMATION */}
                        <div className="profile-section">

                            <h3>
                                Personal Information
                            </h3>

                            <div className="profile-grid">

                                {/* FIRST NAME */}
                                <div className="profile-field">

                                    <label>
                                        First Name
                                    </label>

                                    {editMode ? (
                                        <input
                                            type="text"
                                            name="first_name"
                                            value={formData.first_name}
                                            onChange={handleChange}
                                        />
                                    ) : (
                                        <p>
                                            {patient.first_name}
                                        </p>
                                    )}

                                </div>


                                {/* LAST NAME */}
                                <div className="profile-field">

                                    <label>
                                        Last Name
                                    </label>

                                    {editMode ? (
                                        <input
                                            type="text"
                                            name="last_name"
                                            value={formData.last_name}
                                            onChange={handleChange}
                                        />
                                    ) : (
                                        <p>
                                            {patient.last_name}
                                        </p>
                                    )}

                                </div>


                                {/* DATE OF BIRTH */}
                                <div className="profile-field">

                                    <label>
                                        Date of Birth
                                    </label>

                                    {editMode ? (
                                        <input
                                            type="date"
                                            name="date_of_birth"
                                            value={formData.date_of_birth}
                                            onChange={handleChange}
                                        />
                                    ) : (
                                        <p>
                                            {patient.date_of_birth ||
                                                "Not available"}
                                        </p>
                                    )}

                                </div>


                                {/* GENDER */}
                                <div className="profile-field">

                                    <label>
                                        Gender
                                    </label>

                                    {editMode ? (
                                        <select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleChange}
                                        >
                                            <option value="">
                                                Select Gender
                                            </option>

                                            <option value="Male">
                                                Male
                                            </option>

                                            <option value="Female">
                                                Female
                                            </option>

                                            <option value="Other">
                                                Other
                                            </option>
                                        </select>
                                    ) : (
                                        <p>
                                            {patient.gender ||
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
                                            value={formData.phone}
                                            onChange={handleChange}
                                        />
                                    ) : (
                                        <p>
                                            {patient.phone ||
                                                "Not available"}
                                        </p>
                                    )}

                                </div>


                                {/* EMAIL - NOT EDITABLE */}
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


                        {/* ADDRESS */}
                        <div className="profile-section">

                            <h3>
                                Address
                            </h3>

                            <div className="profile-field full-width">

                                <label>
                                    Address
                                </label>

                                {editMode ? (
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        rows="4"
                                    />
                                ) : (
                                    <p>
                                        {patient.address ||
                                            "Not available"}
                                    </p>
                                )}

                            </div>

                        </div>


                        {/* ACCOUNT INFORMATION */}
                        <div className="profile-section">

                            <h3>
                                Account Information
                            </h3>

                            <div className="profile-grid">

                                {/* PATIENT ID - NOT EDITABLE */}
                                <div className="profile-field">

                                    <label>
                                        Patient ID
                                    </label>

                                    <p>
                                        {patient.patient_id}
                                    </p>

                                </div>


                                {/* ACCOUNT TYPE - NOT EDITABLE */}
                                <div className="profile-field">

                                    <label>
                                        Account Type
                                    </label>

                                    <p>
                                        Patient
                                    </p>

                                </div>

                            </div>

                        </div>


                        {/* ACTION BUTTONS */}
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
                                        className="cancel-profile-button"
                                        onClick={handleCancel}
                                        disabled={saving}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        className="edit-profile-button"
                                        onClick={handleSave}
                                        disabled={saving}
                                    >
                                        {saving
                                            ? "Saving..."
                                            : "💾 Save Changes"}
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

export default PatientProfile;