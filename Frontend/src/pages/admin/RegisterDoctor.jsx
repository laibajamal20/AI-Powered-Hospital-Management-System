import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./RegisterDoctor.css";

function RegisterDoctor() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        specialization: "",
        department_id: "",
        salary: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [admin, setAdmin] = useState(null);

    useEffect(() => {

    const fetchAdmin = async () => {

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

            const data = await response.json();

            if (response.status === 401) {

                localStorage.clear();
                navigate("/login");
                return;
            }

            if (!response.ok) {
                throw new Error(
                    data.detail || "Failed to load admin"
                );
            }

            setAdmin(data);

        } catch (error) {

            console.error(
                "REGISTER DOCTOR ADMIN ERROR:",
                error
            );

        }

    };

    fetchAdmin();

}, [navigate]);
    
    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");
    setLoading(true);

    const token = localStorage.getItem("access_token");

    if (!token) {
        navigate("/login");
        return;
    }

    try {

        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/doctors/admin/register`,
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    doctor_name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    specialization: formData.specialization,
                    department_id: Number(formData.department_id),
                    salary: Number(formData.salary)
                })
            }
        );

        const data = await response.json();

        console.log("REGISTER DOCTOR STATUS:", response.status);
        console.log("REGISTER DOCTOR DATA:", data);

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
                data.detail || "Failed to register doctor"
            );
        }

        alert("Doctor registered successfully!");

        navigate("/doctor-list");

    } catch (error) {

        console.error(
            "REGISTER DOCTOR ERROR:",
            error
        );

        setError(error.message);

    } finally {

        setLoading(false);
    }
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
                    onClick={() => {

                        localStorage.removeItem("access_token");
                        localStorage.removeItem("user_email");
                        localStorage.removeItem("user_role");
                        localStorage.removeItem("user_id");
                        localStorage.removeItem("sessionExpiresAt");

                        navigate("/login");

                    }}
                >
                    🚪 Logout
                </button>

            </aside>


            {/* ================= MAIN ================= */}

            <main className="admin-dashboard-content">

                {/* ================= HEADER ================= */}

                <header className="admin-dashboard-header">

                    <div>

                        <h1>
                            Register New Doctor
                        </h1>

                        <p>
                            Add a new doctor to the hospital system.
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


                {/* ================= FORM ================= */}

                <section className="admin-dashboard-section">

                    <div className="admin-section-header">

                        <div>

                            <h2>
                                Doctor Information
                            </h2>

                            <p>
                                Enter the details of the new doctor.
                            </p>

                        </div>

                    </div>


                    <form
                        className="register-doctor-form"
                        onSubmit={handleSubmit}
                    >

                        {/* ================= ROW 1 ================= */}

                        <div className="doctor-form-row">

                            <div className="doctor-form-group">

                                <label>
                                    Doctor Name
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    placeholder="e.g. Dr. Ahmed Khan"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />

                            </div>


                            <div className="doctor-form-group">

                                <label>
                                    Email
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    placeholder="e.g. ahmed@hospital.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                        </div>


                        {/* ================= ROW 2 ================= */}

                        <div className="doctor-form-row">

                            <div className="doctor-form-group">

                                <label>
                                    Phone Number
                                </label>

                                <input
                                    type="text"
                                    name="phone"
                                    placeholder="e.g. 03001234567"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                />

                            </div>


                            <div className="doctor-form-group">

                                <label>
                                    Specialization
                                </label>

                                <input
                                    type="text"
                                    name="specialization"
                                    placeholder="e.g. Cardiologist"
                                    value={formData.specialization}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                        </div>


                        {/* ================= ROW 3 ================= */}

                        <div className="doctor-form-row">

                            <div className="doctor-form-group">

                                <label>
                                    Department ID
                                </label>

                                <input
                                    type="number"
                                    name="department_id"
                                    placeholder="e.g. 1"
                                    value={formData.department_id}
                                    onChange={handleChange}
                                    required
                                />

                            </div>


                            <div className="doctor-form-group">

                                <label>
                                    Salary
                                </label>

                                <input
                                    type="number"
                                    name="salary"
                                    placeholder="e.g. 10000"
                                    value={formData.salary}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                        </div>


                        {error && (

                            <div className="doctor-form-error">
                                {error}
                            </div>

                        )}


                        {/* ================= BUTTONS ================= */}

                        <div className="doctor-form-actions">

                            <button
                                type="button"
                                className="doctor-cancel-button"
                                onClick={() =>
                                    navigate("/doctor-list")
                                }
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                className="admin-primary-button"
                                disabled={loading}
                            >
                                {loading
                                    ? "Registering..."
                                    : "Register Doctor"}
                            </button>

                        </div>

                    </form>

                </section>

            </main>

        </div>
    );
}

export default RegisterDoctor;