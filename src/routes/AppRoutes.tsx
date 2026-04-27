import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import VendorManagement from "../pages/VendorManagement";
import CustomerDirectory from "../pages/CustomerDirectory";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/vendors" element={<VendorManagement />} />
      <Route path="/customers" element={<CustomerDirectory />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      {/* Fallback for undefined routes */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRoutes;