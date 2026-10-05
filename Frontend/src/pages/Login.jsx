import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import "./Login.css";

function Login() {
  const [role, setRole] = useState("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const sessionTimedOut = location.state?.sessionTimedOut;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password,
          role: role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || "Login failed");
        return;
      }

      console.log("Login successful:", data);

      if (data.requires_2fa) {
        navigate("/verify-otp", {
          state: {
            email: data.email,
            role: data.role
          }
        });
      }

    } catch (error) {
      console.error("Login Error:", error);
      alert("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail);
        return;
      }

      console.log("Google Login Successful:", data);
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user_role", data.role);
      localStorage.setItem("user_email", data.email);
      localStorage.setItem("user_id", data.user_id);

      console.log("Saved token:", localStorage.getItem("access_token"));
      console.log("Saved role:", localStorage.getItem("user_role"));
      navigate("/patient-dashboard");

    } catch (error) {
      console.error("Google Login Error:", error);
      alert("Something went wrong while logging in with Google.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <h1>Hospital Management System</h1>

        <p className="login-subtitle">
          Login to your account
        </p>

        {sessionTimedOut && (
          <div className="session-timeout">
            Your session has timed out. Please login again.
          </div>
        )}

        <div className="role-buttons">

          <button
            className={role === "patient" ? "active" : ""}
            onClick={() => setRole("patient")}
            type="button"
          >
            Patient
          </button>

          <button
            className={role === "doctor" ? "active" : ""}
            onClick={() => setRole("doctor")}
            type="button"
          >
            Doctor
          </button>

          <button
            className={role === "admin" ? "active" : ""}
            onClick={() => setRole("admin")}
            type="button"
          >
            Admin
          </button>

        </div>

        <form onSubmit={handleLogin}>

          <label>Email</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="login-button" type="submit" disabled={loading}>
            {loading ? "Sending OTP..." : "Login"}
          </button>

        </form>

        {role === "patient" && (
          <div className="register-section">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => {
                console.log("Google Login Failed");
                alert("Google Login Failed");
              }}
                width="330"
            />

            <p>Don't have an account?</p>

            <button
              type="button"
              onClick={() => navigate("/register")}
            >
              Register as Patient
            </button>

          </div>
        )}

      </div>
    </div>
  );
}

export default Login;