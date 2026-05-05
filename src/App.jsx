import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { getDefaultRoute } from "./config/navigation";
import { useHotelApp } from "./context/HotelAppContext";
import { AmenitiesPage } from "./pages/AmenitiesPage";
import { BookStayPage } from "./pages/BookStayPage";
import { BookingConfirmationPage } from "./pages/BookingConfirmationPage";
import { CheckInPage } from "./pages/CheckInPage";
import { DashboardPage } from "./pages/DashboardPage";
import { FrontDeskPage } from "./pages/FrontDeskPage";
import { GuestSignInPage } from "./pages/GuestSignInPage";
import { ManagementSignInPage } from "./pages/ManagementSignInPage";
import { MyStaysPage } from "./pages/MyStaysPage";
import { OperationsPage } from "./pages/OperationsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { StaffSignInPage } from "./pages/StaffSignInPage";

function ProtectedShell() {
  const { session } = useHotelApp();

  if (!session) {
    return <Navigate to="/guest/sign-in" replace />;
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

function AppIndexRedirect() {
  const { session } = useHotelApp();

  return <Navigate to={getDefaultRoute(session.role)} replace />;
}

function RoleRoute({ allowedRoles, element }) {
  const { session } = useHotelApp();

  if (!session) {
    return <Navigate to="/guest/sign-in" replace />;
  }

  if (!allowedRoles.includes(session.role)) {
    return <Navigate to={getDefaultRoute(session.role)} replace />;
  }

  return element;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<BookStayPage isPublic />} />
      <Route path="/staff/sign-in" element={<StaffSignInPage />} />
      <Route path="/management/sign-in" element={<ManagementSignInPage />} />
      <Route path="/guest/sign-in" element={<GuestSignInPage />} />

      <Route path="/operations" element={<ProtectedShell />}>
        <Route
          index
          element={
            <RoleRoute
              allowedRoles={["housekeeping", "maintenance", "management"]}
              element={<OperationsPage />}
            />
          }
        />
      </Route>

      <Route path="/app" element={<ProtectedShell />}>
        <Route index element={<AppIndexRedirect />} />

        <Route
          path="overview"
          element={
            <RoleRoute
              allowedRoles={["reception", "housekeeping", "maintenance", "management"]}
              element={<DashboardPage />}
            />
          }
        />
        <Route
          path="front-desk"
          element={
            <RoleRoute
              allowedRoles={["reception", "housekeeping", "maintenance", "management"]}
              element={<FrontDeskPage />}
            />
          }
        />
        <Route
          path="operations"
          element={<Navigate to="/operations" replace />}
        />
        <Route
          path="reports"
          element={<RoleRoute allowedRoles={["management"]} element={<ReportsPage />} />}
        />
        <Route
          path="settings"
          element={<RoleRoute allowedRoles={["management"]} element={<SettingsPage />} />}
        />

        <Route path="book" element={<RoleRoute allowedRoles={["guest"]} element={<BookStayPage />} />} />
        <Route
          path="booking-confirmation"
          element={
            <RoleRoute
              allowedRoles={["guest"]}
              element={<BookingConfirmationPage />}
            />
          }
        />
        <Route
          path="amenities"
          element={<RoleRoute allowedRoles={["guest"]} element={<AmenitiesPage />} />}
        />
        <Route
          path="my-stays"
          element={<RoleRoute allowedRoles={["guest"]} element={<MyStaysPage />} />}
        />
        <Route
          path="check-in"
          element={<RoleRoute allowedRoles={["guest"]} element={<CheckInPage />} />}
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
