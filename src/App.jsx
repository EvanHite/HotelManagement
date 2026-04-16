import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { getDefaultRoute } from "./config/navigation";
import { useHotelApp } from "./context/HotelAppContext";
import { AmenitiesPage } from "./pages/AmenitiesPage";
import { BookStayPage } from "./pages/BookStayPage";
import { BookingConfirmationPage } from "./pages/BookingConfirmationPage";
import { CheckInPage } from "./pages/CheckInPage";
import { DashboardPage } from "./pages/DashboardPage";
import { GuestsPage } from "./pages/GuestsPage";
import { HousekeepingPage } from "./pages/HousekeepingPage";
import { InventoryPage } from "./pages/InventoryPage";
import { LandingPage } from "./pages/LandingPage";
import { MaintenancePage } from "./pages/MaintenancePage";
import { ManagementSignInPage } from "./pages/ManagementSignInPage";
import { MyStaysPage } from "./pages/MyStaysPage";
import { ReportsPage } from "./pages/ReportsPage";
import { ReservationsPage } from "./pages/ReservationsPage";
import { RoomsPage } from "./pages/RoomsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { StaffSignInPage } from "./pages/StaffSignInPage";
import { GuestSignInPage } from "./pages/GuestSignInPage";

function ProtectedShell() {
  const { session } = useHotelApp();

  if (!session) {
    return <Navigate to="/" replace />;
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
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(session.role)) {
    return <Navigate to={getDefaultRoute(session.role)} replace />;
  }

  return element;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/staff/sign-in" element={<StaffSignInPage />} />
      <Route path="/management/sign-in" element={<ManagementSignInPage />} />
      <Route path="/guest/sign-in" element={<GuestSignInPage />} />

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
          path="reservations"
          element={
            <RoleRoute
              allowedRoles={["reception", "management"]}
              element={<ReservationsPage />}
            />
          }
        />
        <Route
          path="guests"
          element={
            <RoleRoute
              allowedRoles={["reception", "management"]}
              element={<GuestsPage />}
            />
          }
        />
        <Route
          path="rooms"
          element={
            <RoleRoute
              allowedRoles={["reception", "housekeeping", "maintenance", "management"]}
              element={<RoomsPage />}
            />
          }
        />
        <Route
          path="housekeeping"
          element={
            <RoleRoute
              allowedRoles={["housekeeping", "management"]}
              element={<HousekeepingPage />}
            />
          }
        />
        <Route
          path="maintenance"
          element={
            <RoleRoute
              allowedRoles={["maintenance", "management"]}
              element={<MaintenancePage />}
            />
          }
        />
        <Route
          path="inventory"
          element={
            <RoleRoute
              allowedRoles={["housekeeping", "maintenance", "management"]}
              element={<InventoryPage />}
            />
          }
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
