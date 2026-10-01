import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DoctorAvailability.css";

function DoctorAvailability() {

    const navigate = useNavigate();

    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState("");

    const [admin, setAdmin] = useState(null);

    const [schedule, setSchedule] = useState({
        Monday: { enabled: false, start: "", end: "" },
        Tuesday: { enabled: false, start: "", end: "" },
        Wednesday: { enabled: false, start: "", end: "" },
        Thursday: { enabled: false, start: "", end: "" },
        Friday: { enabled: false, start: "", end: "" },
        Saturday: { enabled: false, start: "", end: "" },
        Sunday: { enabled: false, start: "", end: "" }
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");


    // =========================
    // GET ADMIN + DOCTORS
    // =========================

    useEffect(() => {

        const fetchData = async () => {

            const token = localStorage.getItem("access_token");
            const role = localStorage.getItem("user_role");

            if (!token || role !== "admin") {
                navigate("/login");
                return;
            }

            try {

                // =========================
                // GET ADMIN
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

                const adminData = await adminResponse.json();

                if (adminResponse.ok) {
                    setAdmin(adminData);
                }


                // =========================
                // GET DOCTORS
                // =========================

                const doctorResponse = await fetch(
                    `${import.meta.env.VITE_API_URL}/doctors/admin/availability/doctors`,
                    {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    }
                );

                const doctorData = await doctorResponse.json();

                if (!doctorResponse.ok) {
                    throw new Error(
                        doctorData.detail ||
                        "Failed to load doctors"
                    );
                }

                setDoctors(doctorData);

            } catch (err) {

                console.error(
                    "DOCTOR AVAILABILITY ERROR:",
                    err
                );

                setError(
                    err.message ||
                    "Failed to load data"
                );

            } finally {

                setLoading(false);

            }
        };

        fetchData();

    }, [navigate]);


    // =========================
    // LOAD AVAILABILITY
    // =========================

    const loadAvailability = async (doctorId) => {

        if (!doctorId) {
            return;
        }

        const token = localStorage.getItem("access_token");

        try {

            const response = await fetch(
                      `${import.meta.env.VITE_API_URL}/doctors/admin/availability/${doctorId}`,                {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    "Failed to load availability"
                );
            }

            const newSchedule = {
                Monday: { enabled: false, start: "", end: "" },
                Tuesday: { enabled: false, start: "", end: "" },
                Wednesday: { enabled: false, start: "", end: "" },
                Thursday: { enabled: false, start: "", end: "" },
                Friday: { enabled: false, start: "", end: "" },
                Saturday: { enabled: false, start: "", end: "" },
                Sunday: { enabled: false, start: "", end: "" }
            };

            data.forEach(item => {

                if (newSchedule[item.day_of_week]) {

                    newSchedule[item.day_of_week] = {
                        enabled: true,
                        start: item.start_time.substring(0, 5),
                        end: item.end_time.substring(0, 5)
                    };

                }

            });

            setSchedule(newSchedule);

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "Failed to load availability"
            );
        }
    };


    // =========================
    // DOCTOR CHANGE
    // =========================

    const handleDoctorChange = (e) => {

        const doctorId = e.target.value;

        setSelectedDoctor(doctorId);

        setMessage("");
        setError("");

        if (doctorId) {

            loadAvailability(doctorId);

        }

    };


    // =========================
    // DAY CHANGE
    // =========================

    const handleDayChange = (
        day,
        field,
        value
    ) => {

        setSchedule(prev => ({

            ...prev,

            [day]: {

                ...prev[day],

                [field]: value

            }

        }));

    };


    // =========================
    // DAY TOGGLE
    // =========================

    const handleDayToggle = (day) => {

        setSchedule(prev => ({

            ...prev,

            [day]: {

                ...prev[day],

                enabled:
                    !prev[day].enabled

            }

        }));

    };


    // =========================
    // SAVE AVAILABILITY
    // =========================

    const handleSave = async () => {

        setMessage("");
        setError("");

        if (!selectedDoctor) {

            setError(
                "Please select a doctor."
            );

            return;
        }

        const availability = [];

        for (
            const day of Object.keys(schedule)
        ) {

            const dayData = schedule[day];

            if (!dayData.enabled) {
                continue;
            }

            if (
                !dayData.start ||
                !dayData.end
            ) {

                setError(
                    `Please select start and end time for ${day}.`
                );

                return;
            }

            if (
                dayData.start >=
                dayData.end
            ) {

                setError(
                    `${day}: end time must be after start time.`
                );

                return;
            }

            availability.push({

                day_of_week: day,

                start_time:
                    dayData.start,

                end_time:
                    dayData.end

            });

        }


        if (availability.length === 0) {

            setError(
                "Please select at least one available day."
            );

            return;
        }


        const token =
            localStorage.getItem(
                "access_token"
            );

        setSaving(true);


        try {

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/doctors/admin/availability`,
                {
                    method: "POST",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        doctor_id:
                            Number(selectedDoctor),

                        availability:
                            availability

                    })
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    "Failed to save availability"
                );

            }


            setMessage(
                "Doctor availability saved successfully."
            );


        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "Failed to save availability"
            );

        } finally {

            setSaving(false);

        }

    };


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


    // =========================
    // LOADING
    // =========================

    if (loading) {

        return (
            <div className="availability-loading">
                Loading availability...
            </div>
        );

    }


    // =========================
    // SELECTED DOCTOR
    // =========================

    const selectedDoctorData =
        doctors.find(
            doctor =>
                String(doctor.doctor_id) ===
                String(selectedDoctor)
        );


    // =========================
    // UI
    // =========================

    return (

        <div className="doctor-availability">


            {/* =========================
                SIDEBAR
            ========================= */}

            <aside className="availability-sidebar">


                <div className="availability-sidebar-logo">

                    <h2>
                        HMS
                    </h2>

                    <p>
                        Hospital Management
                    </p>

                </div>


                <nav className="availability-sidebar-menu">


                    <button
                        className="availability-menu-item"
                        onClick={() =>
                            navigate(
                                "/admin-dashboard"
                            )
                        }
                    >
                        🏠 Dashboard
                    </button>


                    <button
                        className="availability-menu-item"
                        onClick={() =>
                            navigate(
                                "/admin-profile"
                            )
                        }
                    >
                        👤 My Profile
                    </button>


                    <button
                        className="availability-menu-item"
                        onClick={() =>
                            navigate(
                                "/patient-approval"
                            )
                        }
                    >
                        👥 Patient Approval
                    </button>


                    <button
                        className="availability-menu-item"
                        onClick={() =>
                            navigate(
                                "/doctor-list"
                            )
                        }
                    >
                        🩺 Doctors
                    </button>


                    <button
                        className="availability-menu-item active"
                        onClick={() =>
                            navigate(
                                "/doctor-availability"
                            )
                        }
                    >
                        📅 Doctor Availability
                    </button>


                </nav>


                <button
                    className="availability-logout-button"
                    onClick={handleLogout}
                >
                    🚪 Logout
                </button>


            </aside>


            {/* =========================
                MAIN CONTENT
            ========================= */}

            <main className="availability-content">


                {/* =========================
                    HEADER
                ========================= */}

                <header className="availability-header">

                    <div>

                        <h1>
                            Doctor Availability
                        </h1>

                        <p>
                            Manage weekly working hours
                            for your doctors.
                        </p>

                    </div>


                    <div className="availability-admin-info">

                        <div className="availability-profile-circle">
                            👨‍💼
                        </div>

                        <div>

                            <strong>
                                {admin?.admin_name ||
                                    admin?.name ||
                                    "Admin"}
                            </strong>

                            <span>
                                {admin?.email ||
                                    "Admin Account"}
                            </span>

                        </div>

                    </div>

                </header>


                {/* =========================
                    WELCOME CARD
                ========================= */}

                <section className="availability-welcome-card">

                    <div>

                        <h2>
                            Doctor Availability 👋
                        </h2>

                        <p>
                            Set the days and working
                            hours when doctors are
                            available for appointments.
                        </p>

                    </div>


                    <button
                        className="availability-primary-button"
                        onClick={() =>
                            navigate(
                                "/doctor-list"
                            )
                        }
                    >
                        View Doctors
                    </button>

                </section>


                {/* =========================
                    INFORMATION
                ========================= */}

                <div className="availability-info-box">

                    <strong>
                        Appointment Slot Information
                    </strong>

                    <p>
                        Each appointment is automatically
                        divided into 20-minute slots.
                        Booked slots will become unavailable
                        to other patients while the doctor's
                        weekly availability remains unchanged.
                    </p>

                </div>


                {/* =========================
                    SELECT DOCTOR
                ========================= */}

                <section className="availability-section">


                    <div className="availability-section-header">

                        <div>

                            <h2>
                                Select Doctor
                            </h2>

                            <p>
                                Choose a doctor to manage
                                their weekly schedule.
                            </p>

                        </div>

                    </div>


                    <label className="doctor-select-label">

                        Doctor

                    </label>


                    <select
                        className="doctor-select"
                        value={selectedDoctor}
                        onChange={handleDoctorChange}
                    >

                        <option value="">
                            -- Select Doctor --
                        </option>


                        {doctors.map(doctor => (

                            <option
                                key={doctor.doctor_id}
                                value={doctor.doctor_id}
                            >

                                {doctor.doctor_name}

                                {" — "}

                                {doctor.department_name ||
                                    "No Department"}

                            </option>

                        ))}

                    </select>


                    {selectedDoctorData && (

                        <div className="selected-doctor-card">

                            <div className="selected-doctor-icon">
                                👨‍⚕️
                            </div>


                            <div>

                                <h3>
                                    {
                                        selectedDoctorData.doctor_name
                                    }
                                </h3>

                                <p>
                                    {
                                        selectedDoctorData.department_name ||
                                        "No Department"
                                    }
                                </p>

                            </div>

                        </div>

                    )}

                </section>


                {/* =========================
                    WEEKLY SCHEDULE
                ========================= */}

                {selectedDoctor && (

                    <section className="availability-section">


                        <div className="availability-section-header">

                            <div>

                                <h2>
                                    Weekly Schedule
                                </h2>

                                <p>
                                    Select available days
                                    and define working hours.
                                </p>

                            </div>

                        </div>


                        <div className="schedule-list">


                            {Object.keys(schedule).map(day => (

                                <div
                                    className="schedule-row"
                                    key={day}
                                >


                                    <div className="day-section">

                                        <input
                                            type="checkbox"
                                            id={day}
                                            checked={
                                                schedule[day].enabled
                                            }
                                            onChange={() =>
                                                handleDayToggle(day)
                                            }
                                        />

                                        <label htmlFor={day}>
                                            {day}
                                        </label>

                                    </div>


                                    <div className="time-section">

                                        <input
                                            type="time"
                                            value={
                                                schedule[day].start
                                            }
                                            disabled={
                                                !schedule[day].enabled
                                            }
                                            onChange={e =>
                                                handleDayChange(
                                                    day,
                                                    "start",
                                                    e.target.value
                                                )
                                            }
                                        />


                                        <span>
                                            to
                                        </span>


                                        <input
                                            type="time"
                                            value={
                                                schedule[day].end
                                            }
                                            disabled={
                                                !schedule[day].enabled
                                            }
                                            onChange={e =>
                                                handleDayChange(
                                                    day,
                                                    "end",
                                                    e.target.value
                                                )
                                            }
                                        />

                                    </div>


                                </div>

                            ))}

                        </div>


                        {/* =========================
                            MESSAGES
                        ========================= */}

                        {message && (

                            <div className="success-message">
                                {message}
                            </div>

                        )}


                        {error && (

                            <div className="error-message">
                                {error}
                            </div>

                        )}


                        {/* =========================
                            SAVE
                        ========================= */}

                        <button
                            className="save-button"
                            onClick={handleSave}
                            disabled={saving}
                        >

                            {saving
                                ? "Saving..."
                                : "Save Availability"}

                        </button>


                    </section>

                )}

            </main>

        </div>
    );
}

export default DoctorAvailability;