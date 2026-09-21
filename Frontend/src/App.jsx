import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import OTPVerification from "./pages/OTPVerification";
                {/* PATIENT */}

import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientProfile from "./pages/patient/PatientProfile";
import PatientAppointments from "./pages/patient/PatientAppointments";
import BookAppointment from "./pages/patient/BookAppointment";
import PatientPrescriptions from "./pages/patient/PatientPrescriptions";
import BookAppointmentForm from "./pages/patient/BookAppointmentForm";


                {/* Doctor */}
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorProfile from "./pages/doctor/DoctorProfile";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";
import DoctorPatients from "./pages/doctor/DoctorPatients";
import HeartDiseasePrediction from "./pages/doctor/HeartDiseasePrediction";


                {/* Admin */}
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProfile from "./pages/admin/AdminProfile";
import PatientApproval from "./pages/admin/PatientApproval";
import DoctorList from "./pages/admin/DoctorList";
import RegisterDoctor from "./pages/admin/RegisterDoctor";
import DoctorAvailability  from "./pages/admin/DoctorAvailability";

import SetDoctorPassword from "./pages/SetDoctorPassword";
import ProtectedRoute from "./utils/protectedroute";

import SessionManager from "./components/SessionManager";

function App() {
    return (
        <BrowserRouter>
            <SessionManager />

            <Routes>

                {/* PUBLIC */}

                <Route
                    path="/"
                    element={<Navigate to="/login" />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/verify-otp"
                    element={<OTPVerification />}
                />


                {/* PATIENT */}
                
                <Route
                    path="/patient-dashboard"
                    element={
                        <ProtectedRoute allowedRole="patient">
                            <PatientDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/patient-profile"
                    element={
                        <ProtectedRoute allowedRole="patient">
                            <PatientProfile />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/patient-appointments"
                    element={
                        <ProtectedRoute allowedRole="patient">
                            <PatientAppointments />
                        </ProtectedRoute>
                    }
                />

                    <Route
                    path="/book-appointment"
                    element={
                        <ProtectedRoute allowedRole="patient">
                            <BookAppointment />
                        </ProtectedRoute>
                    }
                />

                    <Route
                    path="/patient-prescriptions"
                    element={
                        <ProtectedRoute allowedRole="patient">
                            <PatientPrescriptions />
                        </ProtectedRoute>
                    }
                />


                  <Route
                    path="/book-appointment-form"
                    element={
                        <ProtectedRoute allowedRole="patient">
                            <BookAppointmentForm />
                        </ProtectedRoute>
                    }
                />

                {/* DOCTOR */}

                <Route
                    path="/doctor-dashboard"
                    element={
                        <ProtectedRoute allowedRole="doctor">
                            <DoctorDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/doctor-profile"
                    element={
                        <ProtectedRoute allowedRole="doctor">
                            <DoctorProfile />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/doctor-appointments"
                    element={
                        <ProtectedRoute allowedRole="doctor">
                            <DoctorAppointments />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/doctor-patients"
                    element={
                        <ProtectedRoute allowedRole="doctor">
                            <DoctorPatients />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/heart-disease-prediction"
                    element={
                        <ProtectedRoute allowedRole="doctor">
                            <HeartDiseasePrediction />
                        </ProtectedRoute>
                    }
                />



                 {/* ADMIN */}
                
                <Route
                    path="/admin-dashboard"
                    element={
                        <ProtectedRoute allowedRole="admin">
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin-profile"
                    element={
                        <ProtectedRoute allowedRole="admin">
                            <AdminProfile />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/patient-approval"
                    element={
                        <ProtectedRoute allowedRole="admin">
                            <PatientApproval />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/doctor-list"
                    element={
                        <ProtectedRoute allowedRole="admin">
                            <DoctorList />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/doctor-availability"
                    element={
                        <ProtectedRoute allowedRole="admin">
                            <DoctorAvailability />
                        </ProtectedRoute>
                    }
                />


                <Route
                    path="/register-doctor"
                    element={
                        <ProtectedRoute allowedRole="admin">
                            <RegisterDoctor />
                        </ProtectedRoute>
                    }
                />

                <Route
                   path="/set-password/:token"
                   element={<SetDoctorPassword />}
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;