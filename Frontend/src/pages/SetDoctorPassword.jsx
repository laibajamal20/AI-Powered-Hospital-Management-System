import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./SetDoctorPassword.css";


function SetDoctorPassword() {

    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);


    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");

        if (password.length < 6) {

            setError(
                "Password must be at least 6 characters."
            );

            return;
        }

        if (password !== confirmPassword) {

            setError(
                "Passwords do not match."
            );

            return;
        }

        setLoading(true);

        try {

            const response = await fetch(
                `http://127.0.0.1:8000/doctors/set-password/${token}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        password: password
                    })
                }
            );

            const data = await response.json();

            console.log(
                "SET PASSWORD STATUS:",
                response.status
            );

            console.log(
                "SET PASSWORD DATA:",
                data
            );


            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    "Failed to create password."
                );
            }


            setSuccess(
                "Password created successfully. Redirecting to login..."
            );


            setTimeout(() => {

                navigate("/login");

            }, 2000);


        } catch (error) {

            console.error(
                "SET PASSWORD ERROR:",
                error
            );

            setError(error.message);

        } finally {

            setLoading(false);
        }
    };


    return (

        <div className="set-password-page">

            <div className="set-password-card">

                <div className="set-password-header">

                    <h1>
                        HMS
                    </h1>

                    <p>
                        Hospital Management System
                    </p>

                </div>


                <div className="set-password-content">

                    <h2>
                        Create Your Password
                    </h2>

                    <p>
                        Your doctor account has been created.
                        Please create a password to access your account.
                    </p>


                    {error && (

                        <div className="set-password-error">
                            {error}
                        </div>

                    )}


                    {success && (

                        <div className="set-password-success">
                            {success}
                        </div>

                    )}


                    <form onSubmit={handleSubmit}>

                        <div className="set-password-field">

                           <label>
                             New Password
                           </label>

                            <div className="password-input-container">

                              <input
                                 type={
                                   showPassword
                                      ? "text"
                                      : "password"
                                    }
                                  value={password}
                                  onChange={(e) =>
                                  setPassword(e.target.value)
                                   }
                                  placeholder="Enter your password"
                                  required
                                />

                                 <button
                                   type="button"
                                   className="password-eye-button"
                                   onClick={() =>
                                     setShowPassword(!showPassword)
                                      }
                                >
                                    {showPassword ? "🙈" : "👁️"}
                               </button>

                            </div>

                        </div>


                        <div className="set-password-field">

    <label>
        Confirm Password
    </label>

    <div className="password-input-container">

        <input
            type={
                showConfirmPassword
                    ? "text"
                    : "password"
            }
            value={confirmPassword}
            onChange={(e) =>
                setConfirmPassword(e.target.value)
            }
            placeholder="Confirm your password"
            required
        />

        <button
            type="button"
            className="password-eye-button"
            onClick={() =>
                setShowConfirmPassword(
                    !showConfirmPassword
                )
            }
        >
            {showConfirmPassword ? "🙈" : "👁️"}
        </button>

    </div>

</div>


                        <button
                            type="submit"
                            className="set-password-button"
                            disabled={loading}
                        >

                            {loading
                                ? "Creating Password..."
                                : "Create Password"}

                        </button>

                    </form>

                </div>

            </div>

        </div>
    );
}


export default SetDoctorPassword;