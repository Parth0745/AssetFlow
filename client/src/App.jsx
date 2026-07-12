import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AppShell from "./layout/AppShell";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import OrganizationSetupPage from "./pages/OrganizationSetupPage";
import AssetsPage from "./pages/AssetsPage";
import AllocationTransferPage from "./pages/AllocationTransferPage";
import ResourceBookingPage from "./pages/ResourceBookingPage";
import MaintenancePage from "./pages/MaintenancePage";
import AuditPage from "./pages/AuditPage";
import ReportsPage from "./pages/ReportsPage";
import NotificationsPage from "./pages/NotificationsPage";
import ActivityLogsPage from "./pages/ActivityLogsPage";
import SettingsPage from "./pages/SettingsPage";

function ProtectedApp({ page }) {
  return (
    <ProtectedRoute>
      <AppShell>{page}</AppShell>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/dashboard" element={<ProtectedApp page={<DashboardPage />} />} />
      <Route path="/organization-setup" element={<ProtectedApp page={<OrganizationSetupPage />} />} />
      <Route path="/assets" element={<ProtectedApp page={<AssetsPage />} />} />
      <Route path="/allocation-transfer" element={<ProtectedApp page={<AllocationTransferPage />} />} />
      <Route path="/resource-booking" element={<ProtectedApp page={<ResourceBookingPage />} />} />
      <Route path="/maintenance" element={<ProtectedApp page={<MaintenancePage />} />} />
      <Route path="/audit" element={<ProtectedApp page={<AuditPage />} />} />
      <Route path="/reports" element={<ProtectedApp page={<ReportsPage />} />} />
      <Route path="/notifications" element={<ProtectedApp page={<NotificationsPage />} />} />
      <Route path="/activity-logs" element={<ProtectedApp page={<ActivityLogsPage />} />} />
      <Route path="/settings" element={<ProtectedApp page={<SettingsPage />} />} />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
