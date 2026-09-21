import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRole }) {

    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("user_role");

    console.log("ProtectedRoute");
    console.log("Token:", token);
    console.log("Role:", role);
    console.log("Allowed Role:", allowedRole);

    // User is not logged in
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // User is logged in but has the wrong role
    if (role !== allowedRole) {
        return (
            <div style={{
                textAlign: "center",
                marginTop: "100px"
            }}>
                <h1>Access Denied</h1>

                <p>
                    You are not permitted to use this page.
                </p>

                <p>
                    Your role: <strong>{role}</strong>
                </p>

                <p>
                    Required role: <strong>{allowedRole}</strong>
                </p>
            </div>
        );
    }

    // Correct role
    return children;
}

export default ProtectedRoute;