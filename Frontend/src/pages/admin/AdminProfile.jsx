import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminProfile.css";

function AdminProfile() {

    const navigate = useNavigate();

    const [admin, setAdmin] = useState(null);

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        phone: ""
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    // =========================
    // FETCH ADMIN PROFILE
    // =========================

    useEffect(() => {

        const fetchProfile = async () => {

            const token = localStorage.getItem("access_token");

            if (!token) {
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

                if (response.status === 401) {

                    localStorage.removeItem("access_token");
                    localStorage.removeItem("user_email");
                    localStorage.removeItem("user_role");

                    navigate("/login");

                    return;
                }

                if (!response.ok) {

                    throw new Error(
                        "Failed to load admin profile"
                    );

                }

                const data = await response.json();

                console.log("ADMIN PROFILE:", data);

                setAdmin(data);

                setFormData({
                    first_name: data.first_name || "",
                    last_name: data.last_name || "",
                    phone: data.phone || ""
                });

            } catch (error) {

                console.error(error);

                setError(
                    "Unable to load your profile."
                );

            } finally {

                setLoading(false);

            }
        };

        fetchProfile();

    }, [navigate]);


    // =========================
    // INPUT CHANGE
    // =========================

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };


    // =========================
    // EDIT
    // =========================

    const handleEdit = () => {

        setSuccess("");
        setError("");

        setFormData({
            first_name: admin.first_name || "",
            last_name: admin.last_name || "",
            phone: admin.phone || ""
        });

        setEditMode(true);

    };


    // =========================
    // CANCEL
    // =========================

    const handleCancel = () => {

        setFormData({
            first_name: admin.first_name || "",
            last_name: admin.last_name || "",
            phone: admin.phone || ""
        });

        setEditMode(false);

        setError("");
        setSuccess("");

    };


    // =========================
    // SAVE
    // =========================

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
                `${import.meta.env.VITE_API_URL}/admin/me`,
                {
                    method: "PUT",

                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        first_name: formData.first_name,
                        last_name: formData.last_name,
                        phone: formData.phone
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    "Failed to update profile"
                );

            }


            // Update profile immediately

            setAdmin({
                ...admin,
                first_name: formData.first_name,
                last_name: formData.last_name,
                phone: formData.phone
            });

            setEditMode(false);

            setSuccess(
                "Profile updated successfully."
            );

        } catch (error) {

            console.error(error);

            setError(
                error.message ||
                "Unable to update profile."
            );

        } finally {

            setSaving(false);

        }

    };


    // =========================
    // LOGOUT
    // =========================

    const handleLogout = () => {

        localStorage.removeItem("access_token");
        localStorage.removeItem("user_email");
        localStorage.removeItem("user_role");

        navigate("/login");

    };


    // =========================
    // LOADING
    // =========================

    if (loading) {

        return (
            <div className="profile-loading">
                Loading your profile...
            </div>
        );

    }


    // =========================
    // ERROR
    // =========================

    if (error && !admin) {

        return (
            <div className="profile-error">
                {error}
            </div>
        );

    }


    return (

        <div className="admin-profile-page">

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
                        className="profile-menu-item active"
                        onClick={() =>
                            navigate("/admin-profile")
                        }
                    >
                        👤 My Profile
                    </button>


                    <button
                        className="profile-menu-item"
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

                <div className="profile-page-header">

                    <h1>
                        My Profile
                    </h1>

                    <p>
                        View and manage your administrator information.
                    </p>

                </div>


                {admin && (

                    <section className="profile-card">

                        {/* PROFILE HEADER */}

                        <div className="profile-card-header">

                            <div className="large-profile-circle">
                                👤
                            </div>

                            <div>

                                <h2>
                                    {admin.first_name}{" "}
                                    {admin.last_name}
                                </h2>

                                <p>
                                    {admin.email ||
                                        "Not available"}
                                </p>

                            </div>

                        </div>


                        {/* SUCCESS */}

                        {success && (
                            <div className="profile-success">
                                {success}
                            </div>
                        )}


                        {/* ERROR */}

                        {error && (
                            <div className="profile-error">
                                {error}
                            </div>
                        )}


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
                                            value={
                                                formData.first_name
                                            }
                                            onChange={handleChange}
                                        />

                                    ) : (

                                        <p>
                                            {admin.first_name ||
                                                "Not available"}
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
                                            value={
                                                formData.last_name
                                            }
                                            onChange={handleChange}
                                        />

                                    ) : (

                                        <p>
                                            {admin.last_name ||
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
                                            onChange={handleChange}
                                        />

                                    ) : (

                                        <p>
                                            {admin.phone ||
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
                                        {admin.email ||
                                            "Not available"}
                                    </p>

                                </div>

                            </div>

                        </div>


                        {/* ACCOUNT INFORMATION */}

                        <div className="profile-section">

                            <h3>
                                Account Information
                            </h3>


                            <div className="profile-grid">

                                {/* ADMIN ID */}

                                <div className="profile-field">

                                    <label>
                                        Admin ID
                                    </label>

                                    <p>
                                        {admin.admin_id ||
                                            "Not available"}
                                    </p>

                                </div>


                                {/* ACCOUNT TYPE */}

                                <div className="profile-field">

                                    <label>
                                        Account Type
                                    </label>

                                    <p>
                                        Administrator
                                    </p>

                                </div>

                            </div>

                        </div>


                        {/* BUTTONS */}

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

export default AdminProfile;