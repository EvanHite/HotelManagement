import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthShell } from "../components/AuthShell";
import { getDefaultRoute } from "../config/navigation";
import { useHotelApp } from "../context/HotelAppContext";

const roleOptions = [
  { label: "Reception", value: "reception" },
  { label: "Housekeeping", value: "housekeeping" },
  { label: "Maintenance", value: "maintenance" },
];

export function StaffSignInPage() {
  const { hotels, loginAs, metrics } = useHotelApp();
  const navigate = useNavigate();
  const [hotelId, setHotelId] = useState(hotels[0]?.id ?? "");
  const [role, setRole] = useState("reception");
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (!employeeId.trim() || !password.trim()) {
      setError("Enter your employee ID and password.");
      return;
    }

    loginAs(role);
    navigate(getDefaultRoute(role));
  }

  return (
    <AuthShell
      activePortal="staff"
      title="Staff Sign In"
      subtitle="Reception, housekeeping, and maintenance"
      metrics={[
        { label: "Arrivals", value: metrics.arrivalsToday },
        { label: "Cleaning", value: metrics.roomsNeedingCleaning },
        { label: "Open issues", value: metrics.openMaintenanceCount },
      ]}
      actions={
        <Link className="btn-secondary" to="/">
          Back
        </Link>
      }
    >
      <form className="max-w-[420px] space-y-4" onSubmit={handleSubmit}>
        <label>
          <span className="field-label">Property</span>
          <select
            className="input-base"
            value={hotelId}
            onChange={(event) => setHotelId(event.target.value)}
          >
            {hotels.map((hotel) => (
              <option key={hotel.id} value={hotel.id}>
                {hotel.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="field-label">Role</span>
          <select
            className="input-base"
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="field-label">Employee ID</span>
          <input
            className="input-base"
            value={employeeId}
            onChange={(event) => setEmployeeId(event.target.value)}
            placeholder="Enter employee ID"
          />
        </label>

        <label>
          <span className="field-label">Password</span>
          <input
            className="input-base"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter password"
          />
        </label>

        <div className="flex items-center justify-between gap-3 pt-1">
          <p className="text-sm text-rose-600">{error}</p>
          <button className="btn-primary" type="submit">
            Sign in
          </button>
        </div>
      </form>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link className="btn-secondary" to="/management/sign-in">
          Management sign in
        </Link>
      </div>
    </AuthShell>
  );
}
