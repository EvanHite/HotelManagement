import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthShell } from "../components/AuthShell";
import { getDefaultRoute } from "../config/navigation";
import { useHotelApp } from "../context/HotelAppContext";

export function ManagementSignInPage() {
  const { hotels, loginManagement } = useHotelApp();
  const navigate = useNavigate();
  const [hotelId, setHotelId] = useState(hotels[0]?.id ?? "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Enter your work email and password.");
      return;
    }

    const user = await loginManagement(email, password);

    if (!user) {
      setError("Email or password did not match.");
      return;
    }

    navigate(getDefaultRoute("management"));
  }

  return (
    <AuthShell
      activePortal="management"
      title="Management Sign In"
      subtitle="Authorized manager access"
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
          <span className="field-label">Work email</span>
          <input
            className="input-base"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="manager@hotel.example"
          />
        </label>

        <label>
          <span className="field-label">Password</span>
          <input
            className="input-base"
            type="password"
            required
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
        <Link className="btn-secondary" to="/staff/sign-in">
          Staff sign in
        </Link>
      </div>
    </AuthShell>
  );
}
