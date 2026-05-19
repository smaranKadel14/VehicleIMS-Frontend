import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import VendorManagement from "../pages/admin/VendorManagement";
import CustomerDirectory from "../pages/staff/CustomerDirectory";
import InventoryManagement from "../pages/admin/InventoryManagement";
import ProfilePage from "../pages/customer/ProfilePage";
import CustomerDashboard from "../pages/customer/Dashboard";
import AdminDashboard from "../pages/admin/AdminDashboard";
import StaffManagement from "../pages/admin/StaffManagement";
import StaffDashboard from "../pages/staff/StaffDashboard";
import StaffReports from "../pages/staff/StaffReports";
import StaffAppointments from "../pages/staff/StaffAppointments";
import StaffPOS from "../pages/staff/StaffPOS";
import PurchaseManagement from "../pages/admin/PurchaseManagement";
import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      {/* Protected Customer Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <CustomerDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } 
      />

      {/* Protected Admin/Staff Routes */}
      <Route 
        path="/vendors" 
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <VendorManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/inventory" 
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <InventoryManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/staff/customers" 
        element={
          <ProtectedRoute allowedRoles={['Admin', 'Staff']}>
            <CustomerDirectory />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/staff/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['Admin', 'Staff']}>
            <StaffDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/staff/reports" 
        element={
          <ProtectedRoute allowedRoles={['Admin', 'Staff']}>
            <StaffReports />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/staff/appointments" 
        element={
          <ProtectedRoute allowedRoles={['Admin', 'Staff']}>
            <StaffAppointments />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/staff/pos" 
        element={
          <ProtectedRoute allowedRoles={['Admin', 'Staff']}>
            <StaffPOS />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin-dashboard" 
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/staff-management" 
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <StaffManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/purchases" 
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <PurchaseManagement />
          </ProtectedRoute>
        } 
      />

      <Route path="/" element={<Navigate to="/login" replace />} />
      {/* Fallback for undefined routes */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRoutes;