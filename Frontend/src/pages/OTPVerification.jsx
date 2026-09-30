import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./OTPVerification.css";

function OTPVerification() {
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const location = useLocation();
    const navigate = useNavigate();

    const email = location.state?.email;
    const role = location.state?.role;

    // Redirect to login if email is missing (e.g. direct access or hard reload)
    useEffect(() => {
        if (!email) {
            navigate("/login");
        }
    }, [email, navigate]);

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        setStatusMessage("");

        const cleanOtp = otp.trim();
        if (cleanOtp.length !== 6) {
            setErrorMessage("Please enter a valid 6-digit OTP.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/auth/verify-otp`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: email,
                        otp: cleanOtp,
                    }),
                }
            );

            const data = await response.json();

            // =========================
            // OTP ERROR
            // =========================
            if (!response.ok) {
                const errDetail = typeof data.detail === "string" ? data.detail : "Invalid OTP.";
                setErrorMessage(errDetail);
                alert(errDetail);
                return;
            }

            // =========================
            // GET JWT
            // =========================
            const token = data.access_token;
            if (!token) {
                setErrorMessage("Login failed: access token was not received.");
                alert("Login failed: access token was not received.");
                return;
            }

            // =========================
            // DECODE JWT
            // =========================
            const decodedToken = jwtDecode(token);
            console.log("DECODED JWT:", decodedToken);

            const expiresAt = decodedToken.exp * 1000;

            // =========================
            // SAVE JWT TOKEN & SESSION
            // =========================
            localStorage.setItem("access_token", token);
            localStorage.setItem("sessionExpiresAt", expiresAt.toString());
            localStorage.setItem("user_email", data.email);
            localStorage.setItem("user_role", data.role);
            localStorage.setItem("user_id", data.user_id);

            console.log("OTP verified successfully");

            // =========================
            // REDIRECT BY ROLE
            // =========================
            const userRole = data.role || role;
            if (userRole === "patient") {
                navigate("/patient-dashboard");
            } else if (userRole === "doctor") {
                navigate("/doctor-dashboard");
            } else if (userRole === "admin") {
                navigate("/admin-dashboard");
            } else {
                navigate("/login");
            }

        } catch (error) {
            console.error("OTP Verification Error:", error);
            setErrorMessage("Unable to connect to the server.");
            alert("Unable to connect to the server.");
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (!email || resending) return;

        setResending(true);
        setErrorMessage("");
        setStatusMessage("");

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/auth/resend-otp`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: email,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                const errDetail = typeof data.detail === "string" ? data.detail : "Failed to resend OTP.";
                setErrorMessage(errDetail);
                alert(errDetail);
                return;
            }

            setStatusMessage("A new verification code has been sent to your email.");
            setOtp("");
        } catch (error) {
            console.error("Resend OTP Error:", error);
            setErrorMessage("Failed to resend OTP. Check server connection.");
        } finally {
            setResending(false);
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData("text").trim().replace(/\D/g, "");
        setOtp(pastedText.slice(0, 6));
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <h1>Hospital Management System</h1>

                <p className="login-subtitle">
                    Two-Factor Authentication
                </p>

                <p className="otp-instruction">
                    We have sent a verification code to:
                </p>

                <p className="otp-email">
                    {email}
                </p>

                {errorMessage && (
                    <div style={{
                        backgroundColor: "#fee2e2",
                        color: "#b91c1c",
                        border: "1px solid #fca5a5",
                        padding: "10px",
                        borderRadius: "6px",
                        marginBottom: "15px",
                        fontSize: "14px",
                        textAlign: "center"
                    }}>
                        {errorMessage}
                    </div>
                )}

                {statusMessage && (
                    <div style={{
                        backgroundColor: "#dcfce7",
                        color: "#15803d",
                        border: "1px solid #86efac",
                        padding: "10px",
                        borderRadius: "6px",
                        marginBottom: "15px",
                        fontSize: "14px",
                        textAlign: "center"
                    }}>
                        {statusMessage}
                    </div>
                )}

                <form onSubmit={handleVerifyOTP}>
                    <label>
                        Verification Code
                    </label>

                    <input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.trim().replace(/\D/g, "").slice(0, 6))}
                        onPaste={handlePaste}
                        maxLength="6"
                        required
                        autoFocus
                    />

                    <button
                        className="login-button"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Verifying..." : "Verify OTP"}
                    </button>
                </form>

                <div style={{ marginTop: "18px", textAlign: "center" }}>
                    <p style={{ color: "#666", fontSize: "14px", marginBottom: "8px" }}>
                        Didn't receive the code or need a new one?
                    </p>
                    <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={resending}
                        style={{
                            background: "none",
                            border: "none",
                            color: "#2563eb",
                            cursor: resending ? "not-allowed" : "pointer",
                            fontWeight: "600",
                            fontSize: "14px",
                            textDecoration: "underline"
                        }}
                    >
                        {resending ? "Sending new OTP..." : "Resend OTP"}
                    </button>
                </div>

                <p className="otp-expiry" style={{ marginTop: "15px", fontSize: "12px", color: "#888", textAlign: "center" }}>
                    Your verification code will expire in 5 minutes.
                </p>
            </div>
        </div>
    );
}

export default OTPVerification;
