import { jwtDecode } from "jwt-decode";


export function getTokenExpiration(token) {

    try {

        const decoded = jwtDecode(token);

        return decoded.exp * 1000;

    } catch (error) {

        console.error("Invalid JWT:", error);

        return null;
    }
}


export function logoutUser(navigate) {

    // Remove existing authentication data
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_id");
    localStorage.removeItem("sessionExpiresAt");

    // Go to login page
    navigate("/login", {
        replace: true,
        state: {
            sessionExpired: true
        }
    });
}


export function startSessionTimer(navigate) {

    // Use your existing token name
    const token = localStorage.getItem("access_token");

    if (!token) {
        return null;
    }


    const expirationTime = getTokenExpiration(token);

    if (!expirationTime) {

        logoutUser(navigate);

        return null;
    }


    const remainingTime =
        expirationTime - Date.now();


    if (remainingTime <= 0) {

        logoutUser(navigate);

        return null;
    }


    console.log(
        "Session timer started."
    );

    console.log(
        "Session expires in:",
        Math.round(remainingTime / 1000),
        "seconds"
    );


    const timer = setTimeout(() => {

        alert(
            "Session expired. Please login again."
        );

        logoutUser(navigate);

    }, remainingTime);


    return timer;
}