import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DoctorDashboard.css";
import "./HeartDiseasePrediction.css";

function HeartDiseasePrediction() {

    const navigate = useNavigate();

    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        male: 1,
        age: "",
        education: 2,
        currentSmoker: 0,
        cigsPerDay: 0,
        BPMeds: 0,
        prevalentStroke: 0,
        prevalentHyp: 0,
        diabetes: 0,
        totChol: "",
        sysBP: "",
        diaBP: "",
        BMI: "",
        heartRate: "",
        glucose: ""
    });

    const [result, setResult] = useState(null);
    const [predicting, setPredicting] = useState(false);

    // Get doctor information
    useEffect(() => {

        const token = localStorage.getItem("access_token");

        if (!token) {
            navigate("/login");
            return;
        }

        fetch(`${import.meta.env.VITE_API_URL}/doctors/me`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
        .then(async (response) => {

            if (response.status === 401) {
                localStorage.removeItem("access_token");
                localStorage.removeItem("user_email");
                localStorage.removeItem("user_role");
                localStorage.removeItem("user_id");
                localStorage.removeItem("sessionExpiresAt");

                navigate("/login", {
                    state: { sessionTimedOut: true }
                });

                return;
            }

            if (response.status === 403) {
                throw new Error("You do not have permission to access this page.");
            }

            if (!response.ok) {
                throw new Error("Failed to load doctor information.");
            }

            return response.json();
        })
        .then((data) => {
            if (data) {
                setDoctor(data);
            }
        })
        .catch((err) => {
            setError(err.message);
        })
        .finally(() => {
            setLoading(false);
        });

    }, [navigate]);


    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });

    };


    const handlePredict = async (e) => {

        e.preventDefault();

        setError("");
        setResult(null);
        setPredicting(true);

        try {

            const token = localStorage.getItem("access_token");

            const dataToSend = {
                male: Number(formData.male),
                age: Number(formData.age),
                education: Number(formData.education),
                currentSmoker: Number(formData.currentSmoker),
                cigsPerDay: Number(formData.cigsPerDay),
                BPMeds: Number(formData.BPMeds),
                prevalentStroke: Number(formData.prevalentStroke),
                prevalentHyp: Number(formData.prevalentHyp),
                diabetes: Number(formData.diabetes),
                totChol: Number(formData.totChol),
                sysBP: Number(formData.sysBP),
                diaBP: Number(formData.diaBP),
                BMI: Number(formData.BMI),
                heartRate: Number(formData.heartRate),
                glucose: Number(formData.glucose)
            };

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/heart/predict`,
                {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(dataToSend)
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.detail || "Prediction failed."
                );
            }

            const data = await response.json();

            setResult(data);

        } catch (err) {

            setError(err.message);

        } finally {

            setPredicting(false);

        }

    };


    const getRiskMessage = () => {

        if (!result) {
            return "";
        }

        const percentage = (result.probability * 100).toFixed(2);

        if (result.prediction === 1) {

            return `Based on the provided patient information, there is an estimated ${percentage}% probability that the patient may develop coronary heart disease within the next 10 years.`;

        }

        return `Based on the provided patient information, there is an estimated ${percentage}% probability that the patient may develop coronary heart disease within the next 10 years.`;

    };


    if (loading) {
        return (
            <div className="doctor-dashboard">
                <div className="dashboard-content">
                    <p>Loading...</p>
                </div>
            </div>
        );
    }


    return (

        <div className="doctor-dashboard">

            {/* SIDEBAR */}
            <aside className="sidebar">

                <div className="sidebar-logo">
                    <h2>HMS</h2>
                </div>

                <div className="sidebar-menu">

                    <button
                        className="menu-item"
                        onClick={() => navigate("/doctor-dashboard")}
                    >
                        🏠 Dashboard
                    </button>

                    <button
                        className="menu-item"
                        onClick={() => navigate("/doctor-profile")}
                    >
                        👤 My Profile
                    </button>

                    <button
                        className="menu-item"
                        onClick={() => navigate("/doctor-appointments")}
                    >
                        📅 Appointments
                    </button>

                    <button
                        className="menu-item"
                        onClick={() => navigate("/doctor-patients")}
                    >
                        👥 My Patients
                    </button>

                    <button
                        className="menu-item active"
                        onClick={() => navigate("/heart-disease-prediction")}
                    >
                        ❤️ Heart Disease Prediction
                    </button>

                </div>

                <button
                    className="menu-item logout-button"
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


            {/* MAIN CONTENT */}
            <main className="dashboard-content">

                {/* HEADER */}
                <div className="dashboard-header">

                    <div>
                        <h1>10-Year CHD Risk Prediction</h1>
                        <p>
                            Estimate the patient's risk of developing coronary heart disease
                        </p>
                    </div>

                    <div className="patient-info">

                        <div className="profile-circle">
                            👨‍⚕️
                        </div>

                        <div>
                            <strong>
                                {doctor?.doctor_name || "Doctor"}
                            </strong>

                            <span>
                                {doctor?.email || "Doctor Account"}
                            </span>
                        </div>

                    </div>

                </div>


                {error && (
                    <div className="prediction-error">
                        {error}
                    </div>
                )}


                {/* PREDICTION FORM */}
                <div className="prediction-section">

                    <div className="section-header">
                        <h2>Patient Information</h2>
                        <p>
                            Enter the patient's clinical information below.
                        </p>
                    </div>


                    <form onSubmit={handlePredict}>

                        <div className="prediction-grid">

                            <div className="prediction-field">
                                <label>Gender</label>

                                <select
                                    name="male"
                                    value={formData.male}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="1">Male</option>
                                    <option value="0">Female</option>
                                </select>
                            </div>


                            <div className="prediction-field">
                                <label>Age</label>

                                <input
                                    type="number"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleChange}
                                    required
                                />
                            </div>


                            <div className="prediction-field">
                                <label>Education Level</label>

                                <select
                                    name="education"
                                    value={formData.education}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="1">Level 1</option>
                                    <option value="2">Level 2</option>
                                    <option value="3">Level 3</option>
                                    <option value="4">Level 4</option>
                                </select>
                            </div>


                            <div className="prediction-field">
                                <label>Current Smoker</label>

                                <select
                                    name="currentSmoker"
                                    value={formData.currentSmoker}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="0">No</option>
                                    <option value="1">Yes</option>
                                </select>
                            </div>


                            <div className="prediction-field">
                                <label>Cigarettes Per Day</label>

                                <input
                                    type="number"
                                    name="cigsPerDay"
                                    value={formData.cigsPerDay}
                                    onChange={handleChange}
                                    min="0"
                                    required
                                />
                            </div>


                            <div className="prediction-field">
                                <label>Blood Pressure Medication</label>

                                <select
                                    name="BPMeds"
                                    value={formData.BPMeds}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="0">No</option>
                                    <option value="1">Yes</option>
                                </select>
                            </div>


                            <div className="prediction-field">
                                <label>Prevalent Stroke</label>

                                <select
                                    name="prevalentStroke"
                                    value={formData.prevalentStroke}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="0">No</option>
                                    <option value="1">Yes</option>
                                </select>
                            </div>


                            <div className="prediction-field">
                                <label>Prevalent Hypertension</label>

                                <select
                                    name="prevalentHyp"
                                    value={formData.prevalentHyp}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="0">No</option>
                                    <option value="1">Yes</option>
                                </select>
                            </div>


                            <div className="prediction-field">
                                <label>Diabetes</label>

                                <select
                                    name="diabetes"
                                    value={formData.diabetes}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="0">No</option>
                                    <option value="1">Yes</option>
                                </select>
                            </div>


                            <div className="prediction-field">
                                <label>Total Cholesterol (mg/dL)</label>

                                <input
                                    type="number"
                                    step="0.1"
                                    name="totChol"
                                    value={formData.totChol}
                                    onChange={handleChange}
                                    required
                                />
                            </div>


                            <div className="prediction-field">
                                <label>Systolic BP (mmHg)</label>

                                <input
                                    type="number"
                                    step="0.1"
                                    name="sysBP"
                                    value={formData.sysBP}
                                    onChange={handleChange}
                                    required
                                />
                            </div>


                            <div className="prediction-field">
                                <label>Diastolic BP (mmHg)</label>

                                <input
                                    type="number"
                                    step="0.1"
                                    name="diaBP"
                                    value={formData.diaBP}
                                    onChange={handleChange}
                                    required
                                />
                            </div>


                            <div className="prediction-field">
                                <label>BMI</label>

                                <input
                                    type="number"
                                    step="0.01"
                                    name="BMI"
                                    value={formData.BMI}
                                    onChange={handleChange}
                                    required
                                />
                            </div>


                            <div className="prediction-field">
                                <label>Heart Rate (bpm)</label>

                                <input
                                    type="number"
                                    name="heartRate"
                                    value={formData.heartRate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>


                            <div className="prediction-field">
                                <label>Glucose (mg/dL)</label>

                                <input
                                    type="number"
                                    step="0.1"
                                    name="glucose"
                                    value={formData.glucose}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                        </div>


                        <button
                            type="submit"
                            className="predict-button"
                            disabled={predicting}
                        >
                            {predicting
                                ? "Calculating Risk..."
                                : "Predict 10-Year CHD Risk"}
                        </button>

                    </form>

                </div>


                {/* RESULT */}
                {result && (

                    <div className="prediction-result">

                        <div className="result-header">
                            <h2>10-Year Coronary Heart Disease Risk</h2>
                        </div>


                        <div className="risk-percentage">
                            {(result.probability * 100).toFixed(2)}%
                        </div>


                        <p className="risk-message">
                            {getRiskMessage()}
                        </p>


                        <div className="prediction-status">

                            {result.prediction === 1
                                ? "⚠️ Higher Risk Prediction"
                                : "✓ Lower Risk Prediction"}

                        </div>


                        <p className="medical-note">
                            This prediction is an ML-based risk estimate and is
                            not a medical diagnosis. Clinical assessment should
                            be performed by a qualified healthcare professional.
                        </p>

                    </div>

                )}

            </main>

        </div>

    );
}

export default HeartDiseasePrediction;