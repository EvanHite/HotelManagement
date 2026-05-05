import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Panel } from "../components/ui";
import { getDefaultRoute } from "../config/navigation";
import { useHotelApp } from "../context/HotelAppContext";

export function GuestSignInPage() {
  const { loginGuest } = useHotelApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    const guest = await loginGuest(email, password);

    if (!guest) {
      setError("Email or password did not match.");
      return;
    }

    navigate(getDefaultRoute("guest"));
  }

  return (
    <div className="min-h-screen bg-[#f7f7f6] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[520px]">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-950">Guest Access</p>
            <p className="text-sm text-slate-500">Loyalty and reservations</p>
          </div>
          <div className="flex items-center gap-2">
            <Link className="btn-secondary" to="/">
              Book a room
            </Link>
            <Link className="btn-secondary hidden sm:inline-flex" to="/staff/sign-in">
              Staff portal
            </Link>
          </div>
        </div>

        <Panel title="Guest Sign In">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="field-label">Email</span>
              <input
                className="input-base"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="ava.bennett@example.com"
              />
            </label>

            <label className="block">
              <span className="field-label">Password</span>
              <input
                className="input-base"
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="guest123"
              />
            </label>

            <div className="flex items-center justify-between gap-3 pt-1">
              <p className="text-sm text-rose-600">{error}</p>
              <button className="btn-primary" type="submit">
                Sign in
              </button>
            </div>
          </form>
        </Panel>
      </div>
    </div>
  );
}
