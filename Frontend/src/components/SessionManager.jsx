import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { startSessionTimer } from "../utils/session";


function SessionManager() {

    const navigate = useNavigate();
    const location = useLocation();


    useEffect(() => {

        // Pages where the user does not need a session
        const publicPages = [
            "/login",
            "/register",
            "/verify-otp"
        ];


        // Don't start a session timer on public pages
        if (publicPages.includes(location.pathname)) {
            return;
        }


        // Start timer for logged-in pages
        const timer = startSessionTimer(navigate);


        // Clear old timer when changing pages
        return () => {

            if (timer) {
                clearTimeout(timer);
            }

        };

    }, [location.pathname, navigate]);


    return null;
}


export default SessionManager;