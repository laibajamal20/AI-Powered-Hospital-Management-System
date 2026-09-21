import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DoctorPatients.css";

function DoctorPatients() {

    const navigate = useNavigate();

    const [patients, setPatients] = useState([]);
    const [doctor, setDoctor] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ADD PRESCRIPTION
    const [showPrescriptionForm, setShowPrescriptionForm] =
        useState(false);

    const [selectedPatient, setSelectedPatient] =
        useState(null);

    const [prescriptionDate, setPrescriptionDate] =
        useState("");

    const [notes, setNotes] =
        useState("");

    const [prescriptionMedicines, setPrescriptionMedicines] =
        useState([
            {
                medicine_name: "",
                dosage: "",
                frequency: "",
                duration: ""
            }
        ]);

    const [prescriptionMessage, setPrescriptionMessage] =
        useState("");

    const [prescriptionLoading, setPrescriptionLoading] =
        useState(false);


    // PRESCRIPTION HISTORY
    const [doctorPrescriptions, setDoctorPrescriptions] =
        useState([]);

    const [showPrescriptionHistory, setShowPrescriptionHistory] =
        useState(false);

    const [selectedPrescriptionPatient, setSelectedPrescriptionPatient] =
        useState(null);

    const [prescriptionHistoryLoading, setPrescriptionHistoryLoading] =
        useState(false);

    const [prescriptionHistoryError, setPrescriptionHistoryError] =
        useState("");


    // LOGOUT
    const logoutUser = () => {

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
    };


    // FETCH DOCTOR + PATIENTS
    useEffect(() => {

        const fetchData = async () => {

            const token =
                localStorage.getItem("access_token");

            if (!token) {
                navigate("/login");
                return;
            }

            try {

                // FETCH DOCTOR
                const doctorResponse = await fetch(
                    "http://127.0.0.1:8000/doctors/me",
                    {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    }
                );

                const doctorData =
                    await doctorResponse.json();

                if (doctorResponse.status === 401) {
                    logoutUser();
                    return;
                }

                if (doctorResponse.status === 403) {

                    setError(
                        doctorData.detail ||
                        "You do not have permission to access this resource"
                    );

                    return;
                }

                if (!doctorResponse.ok) {

                    throw new Error(
                        doctorData.detail ||
                        "Failed to load doctor"
                    );
                }

                setDoctor(doctorData);


                // FETCH PATIENTS
                const patientsResponse = await fetch(
                    "http://127.0.0.1:8000/doctors/me/patients",
                    {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    }
                );

                const patientsData =
                    await patientsResponse.json();

                if (patientsResponse.status === 401) {
                    logoutUser();
                    return;
                }

                if (patientsResponse.status === 403) {

                    setError(
                        patientsData.detail ||
                        "You do not have permission to view patients"
                    );

                    return;
                }

                if (!patientsResponse.ok) {

                    throw new Error(
                        patientsData.detail ||
                        "Failed to load patients"
                    );
                }

                setPatients(
                    Array.isArray(patientsData)
                        ? patientsData
                        : []
                );

            } catch (error) {

                console.error(
                    "DOCTOR PATIENTS ERROR:",
                    error
                );

                setError(
                    error?.message ||
                    "Unable to load patients."
                );

            } finally {

                setLoading(false);
            }
        };


        fetchData();

    }, [navigate]);


    // OPEN ADD PRESCRIPTION FORM
    const openPrescriptionForm = (patient) => {

        setSelectedPatient(patient);

        setPrescriptionDate(
            new Date()
                .toISOString()
                .split("T")[0]
        );

        setNotes("");

        setPrescriptionMedicines([
            {
                medicine_name: "",
                dosage: "",
                frequency: "",
                duration: ""
            }
        ]);

        setPrescriptionMessage("");

        setShowPrescriptionForm(true);
    };


    // CLOSE ADD PRESCRIPTION FORM
    const closePrescriptionForm = () => {

        setShowPrescriptionForm(false);

        setSelectedPatient(null);

        setPrescriptionDate("");

        setNotes("");

        setPrescriptionMedicines([
            {
                medicine_name: "",
                dosage: "",
                frequency: "",
                duration: ""
            }
        ]);

        setPrescriptionMessage("");
    };


    // UPDATE MEDICINE ROW
    const updateMedicineRow = (
        index,
        field,
        value
    ) => {

        setPrescriptionMedicines(
            (previous) => {

                const updated =
                    [...previous];

                updated[index] = {
                    ...updated[index],
                    [field]: value
                };

                return updated;
            }
        );
    };


    // ADD MEDICINE ROW
    const addMedicineRow = () => {

        setPrescriptionMedicines(
            (previous) => [
                ...previous,
                {
                    medicine_name: "",
                    dosage: "",
                    frequency: "",
                    duration: ""
                }
            ]
        );
    };


    // REMOVE MEDICINE ROW
    const removeMedicineRow = (index) => {

        setPrescriptionMedicines(
            (previous) => {

                if (previous.length === 1) {
                    return previous;
                }

                return previous.filter(
                    (_, i) => i !== index
                );
            }
        );
    };


    // ADD PRESCRIPTION
    const handleAddPrescription = async (e) => {

        e.preventDefault();

        const token =
            localStorage.getItem(
                "access_token"
            );

        if (!token) {

            navigate("/login");

            return;
        }

        if (!selectedPatient) {

            setPrescriptionMessage(
                "Please select a patient."
            );

            return;
        }

        if (!selectedPatient.appointment_id) {

            setPrescriptionMessage(
                "No appointment is available for this patient."
            );

            return;
        }

        if (!doctor?.doctor_id) {

            setPrescriptionMessage(
                "Doctor information is not available."
            );

            return;
        }


        const invalidMedicine =
            prescriptionMedicines.some(
                (medicine) =>
                    !medicine.medicine_name.trim() ||
                    !medicine.dosage.trim() ||
                    !medicine.frequency.trim() ||
                    !medicine.duration.trim()
            );

        if (invalidMedicine) {

            setPrescriptionMessage(
                "Please complete medicine name, dosage, frequency and duration for every medicine."
            );

            return;
        }


        try {

            setPrescriptionLoading(true);

            setPrescriptionMessage("");


            // CREATE MAIN PRESCRIPTION
            const prescriptionResponse =
                await fetch(
                    "http://127.0.0.1:8000/prescriptions/",
                    {
                        method: "POST",

                        headers: {
                            "Authorization":
                                `Bearer ${token}`,

                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            patient_id:
                                selectedPatient.patient_id,

                            doctor_id:
                                doctor.doctor_id,

                            appointment_id:
                                selectedPatient.appointment_id,

                            prescription_date:
                                prescriptionDate || null,

                            notes:
                                notes || null
                        })
                    }
                );


            const prescriptionData =
                await prescriptionResponse.json();


            if (
                prescriptionResponse.status === 401
            ) {

                logoutUser();

                return;
            }


            if (!prescriptionResponse.ok) {

                throw new Error(
                    prescriptionData.detail ||
                    prescriptionData.error ||
                    "Failed to add prescription"
                );
            }


            const prescriptionId =
                prescriptionData.prescription_id;


            if (!prescriptionId) {

                throw new Error(
                    "Prescription was created but prescription ID was not returned."
                );
            }


            console.log(
                "CREATED PRESCRIPTION ID:",
                prescriptionId
            );


            // CREATE MEDICINE DETAILS
            for (
                let index = 0;
                index < prescriptionMedicines.length;
                index++
            ) {

                const medicine =
                    prescriptionMedicines[index];


                const detailResponse =
                    await fetch(
                        "http://127.0.0.1:8000/prescription-details/",
                        {
                            method: "POST",

                            headers: {
                                "Authorization":
                                    `Bearer ${token}`,

                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                prescription_id:
                                    prescriptionId,

                                medicine_name:
                                    medicine.medicine_name,

                                dosage:
                                    medicine.dosage,

                                frequency:
                                    medicine.frequency,

                                duration:
                                    medicine.duration
                            })
                        }
                    );


                const detailData =
                    await detailResponse.json();


                if (
                    detailResponse.status === 401
                ) {

                    logoutUser();

                    return;
                }


                if (!detailResponse.ok) {

                    throw new Error(
                        detailData.detail ||
                        detailData.error ||
                        "Failed to add prescription detail"
                    );
                }


                console.log(
                    "PRESCRIPTION DETAIL ADDED:",
                    detailData
                );
            }


            setPrescriptionMessage(
                "Prescription and medicine details added successfully!"
            );


            setNotes("");

            setPrescriptionMedicines([
                {
                    medicine_name: "",
                    dosage: "",
                    frequency: "",
                    duration: ""
                }
            ]);

        } catch (error) {

            console.error(
                "ADD PRESCRIPTION ERROR:",
                error
            );

            setPrescriptionMessage(
                error?.message ||
                "Unable to add prescription."
            );

        } finally {

            setPrescriptionLoading(false);
        }
    };


    // OPEN PRESCRIPTION HISTORY
    const openPrescriptionHistory = async (patient) => {

        const token =
            localStorage.getItem("access_token");

        if (!token) {
            navigate("/login");
            return;
        }

        setSelectedPrescriptionPatient(patient);

        setShowPrescriptionHistory(true);

        setPrescriptionHistoryLoading(true);

        setPrescriptionHistoryError("");

        setDoctorPrescriptions([]);


        try {

            const response = await fetch(
                "http://127.0.0.1:8000/doctors/me/prescriptions",
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"
                    }
                }
            );


            const data =
                await response.json();


            if (response.status === 401) {

                logoutUser();

                return;
            }


            if (response.status === 403) {

                throw new Error(
                    data.detail ||
                    "You do not have permission to view prescription history."
                );
            }


            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    "Failed to load prescription history."
                );
            }


            // Only show prescriptions belonging
            // to the selected patient
            const patientPrescriptions =
                Array.isArray(data)
                    ? data.filter(
                        (prescription) =>
                            prescription.patient_id ===
                            patient.patient_id
                    )
                    : [];


            setDoctorPrescriptions(
                patientPrescriptions
            );


        } catch (error) {

            console.error(
                "PRESCRIPTION HISTORY ERROR:",
                error
            );

            setPrescriptionHistoryError(
                error?.message ||
                "Unable to load prescription history."
            );

        } finally {

            setPrescriptionHistoryLoading(false);
        }
    };


    // CLOSE PRESCRIPTION HISTORY
    const closePrescriptionHistory = () => {

        setShowPrescriptionHistory(false);

        setSelectedPrescriptionPatient(null);

        setDoctorPrescriptions([]);

        setPrescriptionHistoryError("");
    };


    // LOGOUT
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


    // LOADING
    if (loading) {

        return (
            <div className="dashboard-loading">
                Loading patients...
            </div>
        );
    }


    // ERROR
    if (error) {

        return (
            <div className="dashboard-error">
                Error: {error}
            </div>
        );
    }


    return (

        <div className="doctor-dashboard">


            {/* SIDEBAR */}

            <aside className="sidebar">

                <div className="sidebar-logo">

                    <h2>
                        HMS
                    </h2>

                    <p>
                        Hospital Management
                    </p>

                </div>


                <nav className="sidebar-menu">

                    <button
                        className="menu-item"
                        onClick={() =>
                            navigate(
                                "/doctor-dashboard"
                            )
                        }
                    >
                        🏠 Dashboard
                    </button>


                    <button
                        className="menu-item"
                        onClick={() =>
                            navigate(
                                "/doctor-profile"
                            )
                        }
                    >
                        👨‍⚕️ My Profile
                    </button>


                    <button
                        className="menu-item"
                        onClick={() =>
                            navigate(
                                "/doctor-appointments"
                            )
                        }
                    >
                        📅 Appointments
                    </button>


                    <button
                        className="menu-item active"
                        onClick={() =>
                            navigate(
                                "/doctor-patients"
                            )
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
                    className="logout-button"
                    onClick={handleLogout}
                >
                    🚪 Logout
                </button>

            </aside>


            {/* MAIN CONTENT */}

            <main className="dashboard-content">


                {/* HEADER */}

                <header className="dashboard-header">

                    <div>

                        <h1>
                            My Patients
                        </h1>

                        <p>
                            View and manage your patients.
                        </p>

                    </div>


                    <div className="patient-info">

                        <div className="profile-circle">
                            👨‍⚕️
                        </div>

                        <div>

                            <strong>
                                {doctor?.doctor_name ||
                                    "Doctor"}
                            </strong>

                            <span>
                                {doctor?.email ||
                                    "Doctor Account"}
                            </span>

                        </div>

                    </div>

                </header>


                {/* PATIENTS */}

                <section className="dashboard-section">

                    <div className="section-header">

                        <div>

                            <h2>
                                My Patients
                            </h2>

                            <p>
                                Patients who have appointments
                                with you.
                            </p>

                        </div>

                    </div>


                    {patients.length === 0 ? (

                        <div className="no-patients">

                            <div className="empty-icon">
                                👥
                            </div>

                            <h3>
                                No Patients
                            </h3>

                            <p>
                                You currently have no patients.
                            </p>

                        </div>

                    ) : (

                        <div className="patients-list">

                            {patients.map(
                                (patient, patientIndex) => (

                                <div
                                    className="patient-card"
                                    key={
                                        `${patient.patient_id}-${patient.appointment_id}-${patientIndex}`
                                    }
                                >


                                    {/* PATIENT HEADER */}

                                    <div className="patient-card-header">

                                        <div>

                                            <h3>
                                                {`${patient.first_name || ""} ${patient.last_name || ""}`
                                                    .trim() ||
                                                    "Patient"}
                                            </h3>

                                            <p>
                                                Patient ID:{" "}
                                                {patient.patient_id}
                                            </p>

                                        </div>

                                        <div className="patient-icon">
                                            👤
                                        </div>

                                    </div>


                                    {/* PATIENT DETAILS */}

                                    <div className="patient-details">

                                        <div className="patient-detail">

                                            <span>
                                                Address
                                            </span>

                                            <strong>
                                                {patient.address ||
                                                    "Not provided"}
                                            </strong>

                                        </div>


                                        <div className="patient-detail">

                                            <span>
                                                Phone
                                            </span>

                                            <strong>
                                                {patient.phone ||
                                                    "Not provided"}
                                            </strong>

                                        </div>


                                        <div className="patient-detail">

                                            <span>
                                                Gender
                                            </span>

                                            <strong>
                                                {patient.gender ||
                                                    "Not provided"}
                                            </strong>

                                        </div>


                                        <div className="patient-detail">

                                            <span>
                                                Date of Birth
                                            </span>

                                            <strong>
                                                {patient.date_of_birth ||
                                                    "Not provided"}
                                            </strong>

                                        </div>

                                    </div>


                                    {/* APPOINTMENT INFO */}

                                    <div className="patient-appointment-info">

                                        <div className="patient-detail">

                                            <span>
                                                Appointment ID
                                            </span>

                                            <strong>
                                                {patient.appointment_id}
                                            </strong>

                                        </div>


                                        <div className="patient-detail">

                                            <span>
                                                Appointment Date
                                            </span>

                                            <strong>
                                                {patient.appointment_date ||
                                                    "Not provided"}
                                            </strong>

                                        </div>


                                        <div className="patient-detail">

                                            <span>
                                                Appointment Time
                                            </span>

                                            <strong>
                                                {patient.appointment_time ||
                                                    "Not provided"}
                                            </strong>

                                        </div>

                                    </div>


                                    {/* CURRENT PRESCRIPTION */}

                                    {patient.prescription_id && (

                                        <div className="patient-prescription-info">

                                            <h4>
                                                Prescription
                                            </h4>

                                            <p>

                                                <strong>
                                                    Prescription ID:
                                                </strong>{" "}

                                                {patient.prescription_id}

                                            </p>


                                            <p>

                                                <strong>
                                                    Date:
                                                </strong>{" "}

                                                {patient.prescription_date
                                                    ? new Date(
                                                        patient.prescription_date
                                                    ).toLocaleDateString()
                                                    : "Not provided"}

                                            </p>


                                            <p>

                                                <strong>
                                                    Notes:
                                                </strong>{" "}

                                                {patient.prescription_notes ||
                                                    "No notes added"}

                                            </p>

                                        </div>

                                    )}


                                    {/* ACTION BUTTONS */}

                                    <div className="patient-prescription-actions">

                                        <button
                                            className="add-prescription-button"
                                            onClick={() =>
                                                openPrescriptionForm(
                                                    patient
                                                )
                                            }
                                        >
                                            ➕ Add Prescription
                                        </button>


                                        <button
                                            className="view-prescription-history-button"
                                            onClick={() =>
                                                openPrescriptionHistory(
                                                    patient
                                                )
                                            }
                                        >
                                            📋 Prescription History
                                        </button>

                                    </div>


                                </div>

                            ))}

                        </div>

                    )}

                </section>

            </main>


            {/* ===================================================== */}
            {/* ADD PRESCRIPTION MODAL */}
            {/* ===================================================== */}

            {showPrescriptionForm &&
                selectedPatient && (

                <div className="prescription-modal-overlay">

                    <div className="prescription-modal">


                        <div className="prescription-modal-header">

                            <div>

                                <h2>
                                    Add Prescription
                                </h2>

                                <p>
                                    {`${selectedPatient.first_name || ""} ${selectedPatient.last_name || ""}`
                                        .trim() ||
                                        "Patient"}
                                </p>

                            </div>


                            <button
                                type="button"
                                className="close-prescription-button"
                                onClick={
                                    closePrescriptionForm
                                }
                            >
                                ✕
                            </button>

                        </div>


                        <div className="prescription-appointment">

                            <p>

                                <strong>
                                    Patient ID:
                                </strong>{" "}

                                {selectedPatient.patient_id}

                            </p>


                            <p>

                                <strong>
                                    Appointment ID:
                                </strong>{" "}

                                {selectedPatient.appointment_id}

                            </p>

                        </div>


                        <form
                            onSubmit={
                                handleAddPrescription
                            }
                        >


                            {/* DATE */}

                            <div className="prescription-form-group">

                                <label>
                                    Prescription Date
                                </label>

                                <input
                                    type="date"
                                    value={
                                        prescriptionDate
                                    }
                                    onChange={(e) =>
                                        setPrescriptionDate(
                                            e.target.value
                                        )
                                    }
                                    required
                                />

                            </div>


                            {/* MEDICINES */}

                            <div className="prescription-medicines-section">

                                <div className="medicine-section-header">

                                    <div>

                                        <h3>
                                            Medicines
                                        </h3>

                                        <p>
                                            Enter medicine names with
                                            dosage, frequency and duration.
                                        </p>

                                    </div>


                                    <button
                                        type="button"
                                        className="add-medicine-button"
                                        onClick={
                                            addMedicineRow
                                        }
                                    >
                                        ➕ Add Medicine
                                    </button>

                                </div>


                                {prescriptionMedicines.map(
                                    (
                                        medicine,
                                        index
                                    ) => (

                                    <div
                                        className="prescription-medicine-row"
                                        key={
                                            `prescription-medicine-${index}`
                                        }
                                    >


                                        {/* MEDICINE NAME */}

                                        <div className="prescription-form-group">

                                            <label>
                                                Medicine Name
                                            </label>

                                            <input
                                                type="text"
                                                placeholder="Enter medicine name"
                                                value={
                                                    medicine.medicine_name
                                                }
                                                onChange={(e) =>
                                                    updateMedicineRow(
                                                        index,
                                                        "medicine_name",
                                                        e.target.value
                                                    )
                                                }
                                                required
                                            />

                                        </div>


                                        {/* DOSAGE */}

                                        <div className="prescription-form-group">

                                            <label>
                                                Dosage
                                            </label>

                                            <input
                                                type="text"
                                                placeholder="e.g. 500 mg / 1 tablet"
                                                value={
                                                    medicine.dosage
                                                }
                                                onChange={(e) =>
                                                    updateMedicineRow(
                                                        index,
                                                        "dosage",
                                                        e.target.value
                                                    )
                                                }
                                                required
                                            />

                                        </div>


                                        {/* FREQUENCY */}

                                        <div className="prescription-form-group">

                                            <label>
                                                Frequency
                                            </label>

                                            <input
                                                type="text"
                                                placeholder="e.g. Twice daily"
                                                value={
                                                    medicine.frequency
                                                }
                                                onChange={(e) =>
                                                    updateMedicineRow(
                                                        index,
                                                        "frequency",
                                                        e.target.value
                                                    )
                                                }
                                                required
                                            />

                                        </div>


                                        {/* DURATION */}

                                        <div className="prescription-form-group">

                                            <label>
                                                Duration
                                            </label>

                                            <input
                                                type="text"
                                                placeholder="e.g. 7 days"
                                                value={
                                                    medicine.duration
                                                }
                                                onChange={(e) =>
                                                    updateMedicineRow(
                                                        index,
                                                        "duration",
                                                        e.target.value
                                                    )
                                                }
                                                required
                                            />

                                        </div>


                                        {/* REMOVE */}

                                        {prescriptionMedicines.length >
                                            1 && (

                                            <button
                                                type="button"
                                                className="remove-medicine-button"
                                                onClick={() =>
                                                    removeMedicineRow(
                                                        index
                                                    )
                                                }
                                            >
                                                ✕ Remove
                                            </button>

                                        )}

                                    </div>

                                ))}

                            </div>


                            {/* NOTES */}

                            <div className="prescription-form-group">

                                <label>
                                    Notes / Instructions
                                </label>

                                <textarea
                                    value={notes}
                                    onChange={(e) =>
                                        setNotes(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter additional instructions, advice or notes for the patient..."
                                    rows="5"
                                />

                            </div>


                            {/* MESSAGE */}

                            {prescriptionMessage && (

                                <div
                                    className={
                                        prescriptionMessage.includes(
                                            "successfully"
                                        )
                                            ? "prescription-success"
                                            : "prescription-error"
                                    }
                                >
                                    {prescriptionMessage}
                                </div>

                            )}


                            {/* ACTIONS */}

                            <div className="prescription-form-actions">

                                <button
                                    type="button"
                                    className="cancel-prescription-button"
                                    onClick={
                                        closePrescriptionForm
                                    }
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="save-prescription-button"
                                    disabled={
                                        prescriptionLoading
                                    }
                                >
                                    {prescriptionLoading
                                        ? "Saving..."
                                        : "Save Prescription"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* ===================================================== */}
            {/* PRESCRIPTION HISTORY MODAL */}
            {/* ===================================================== */}

            {showPrescriptionHistory &&
                selectedPrescriptionPatient && (

                <div className="prescription-modal-overlay">

                    <div className="prescription-modal">


                        {/* HISTORY HEADER */}

                        <div className="prescription-modal-header">

                            <div>

                                <h2>
                                    Prescription History
                                </h2>

                                <p>
                                    {`${selectedPrescriptionPatient.first_name || ""} ${selectedPrescriptionPatient.last_name || ""}`
                                        .trim() ||
                                        "Patient"}
                                </p>

                            </div>


                            <button
                                type="button"
                                className="close-prescription-button"
                                onClick={
                                    closePrescriptionHistory
                                }
                            >
                                ✕
                            </button>

                        </div>


                        {/* PATIENT INFORMATION */}

                        <div className="prescription-appointment">

                            <p>

                                <strong>
                                    Patient ID:
                                </strong>{" "}

                                {
                                    selectedPrescriptionPatient.patient_id
                                }

                            </p>


                            <p>

                                <strong>
                                    Phone:
                                </strong>{" "}

                                {
                                    selectedPrescriptionPatient.phone ||
                                    "Not provided"
                                }

                            </p>


                            <p>

                                <strong>
                                    Gender:
                                </strong>{" "}

                                {
                                    selectedPrescriptionPatient.gender ||
                                    "Not provided"
                                }

                            </p>


                            <p>

                                <strong>
                                    Date of Birth:
                                </strong>{" "}

                                {
                                    selectedPrescriptionPatient.date_of_birth ||
                                    "Not provided"
                                }

                            </p>

                        </div>


                        {/* LOADING */}

                        {prescriptionHistoryLoading ? (

                            <div className="prescription-history-loading">

                                Loading prescription history...

                            </div>


                        ) : prescriptionHistoryError ? (

                            <div className="prescription-error">

                                {prescriptionHistoryError}

                            </div>


                        ) : doctorPrescriptions.length === 0 ? (

                            <div className="no-medicine">

                                No previous prescriptions found
                                for this patient.

                            </div>


                        ) : (

                            <div className="doctor-prescription-history">

                                {doctorPrescriptions.map(
                                    (prescription) => (

                                    <div
                                        className="doctor-history-card"
                                        key={
                                            `${prescription.prescription_id}-${prescription.prescription_detail_id}`
                                        }
                                    >


                                        {/* PRESCRIPTION HEADER */}

                                        <div className="doctor-history-header">

                                            <div>

                                                <h3>
                                                    Prescription #
                                                    {
                                                        prescription.prescription_id
                                                    }
                                                </h3>

                                                <p>
                                                    Appointment ID:{" "}
                                                    {
                                                        prescription.appointment_id ||
                                                        "Not linked"
                                                    }
                                                </p>

                                            </div>


                                            <span>

                                                {
                                                    prescription.prescription_date ||
                                                    "No date"
                                                }

                                            </span>

                                        </div>


                                        {/* PATIENT */}

                                        <div className="doctor-history-patient">

                                            <p>

                                                <strong>
                                                    Patient:
                                                </strong>{" "}

                                                {
                                                    prescription.patient_first_name
                                                }{" "}

                                                {
                                                    prescription.patient_last_name
                                                }

                                            </p>


                                            <p>

                                                <strong>
                                                    Patient ID:
                                                </strong>{" "}

                                                {
                                                    prescription.patient_id
                                                }

                                            </p>

                                        </div>


                                        {/* MEDICINE */}

                                        {prescription.prescription_detail_id ? (

                                            <div className="doctor-history-medicine">

                                                <h4>
                                                    💊 Medicine
                                                </h4>


                                                <div className="history-medicine-grid">


                                                    <div>

                                                        <span>
                                                            Medicine
                                                        </span>

                                                        <strong>
                                                            {
                                                                prescription.medicine_name ||
                                                                "Not provided"
                                                            }
                                                        </strong>

                                                    </div>


                                                    <div>

                                                        <span>
                                                            Dosage
                                                        </span>

                                                        <strong>
                                                            {
                                                                prescription.dosage ||
                                                                "Not provided"
                                                            }
                                                        </strong>

                                                    </div>


                                                    <div>

                                                        <span>
                                                            Frequency
                                                        </span>

                                                        <strong>
                                                            {
                                                                prescription.frequency ||
                                                                "Not provided"
                                                            }
                                                        </strong>

                                                    </div>


                                                    <div>

                                                        <span>
                                                            Duration
                                                        </span>

                                                        <strong>
                                                            {
                                                                prescription.duration ||
                                                                "Not provided"
                                                            }
                                                        </strong>

                                                    </div>

                                                </div>

                                            </div>

                                        ) : (

                                            <div className="no-medicine">

                                                No medicine details available.

                                            </div>

                                        )}


                                        {/* NOTES */}

                                        <div className="doctor-history-notes">

                                            <strong>
                                                📝 Notes / Instructions
                                            </strong>

                                            <p>

                                                {
                                                    prescription.notes ||
                                                    "No notes added."
                                                }

                                            </p>

                                        </div>


                                    </div>

                                ))}

                            </div>

                        )}


                        {/* CLOSE BUTTON */}

                        <div className="prescription-form-actions">

                            <button
                                type="button"
                                className="cancel-prescription-button"
                                onClick={
                                    closePrescriptionHistory
                                }
                            >
                                Close
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

export default DoctorPatients;