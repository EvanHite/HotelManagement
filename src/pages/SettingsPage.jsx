import { useState } from "react";
import { Panel } from "../components/Panel";
import { SectionHeading } from "../components/SectionHeading";

export function SettingsPage() {
  const [hotelName, setHotelName] = useState("Harbor House Milledgeville");
  const [contactEmail, setContactEmail] = useState("ops@harborhouse.example");
  const [checkInTime, setCheckInTime] = useState("15:00");
  const [checkOutTime, setCheckOutTime] = useState("11:00");
  const [quietHours, setQuietHours] = useState("22:00");
  const [arrivalAlerts, setArrivalAlerts] = useState(true);
  const [inventoryAlerts, setInventoryAlerts] = useState(true);
  const [maintenanceAlerts, setMaintenanceAlerts] = useState(true);

  return (
    <>
      <SectionHeading
        title="Settings"
        description="Hotel profile, operating defaults, notifications, and role configuration."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Hotel profile" description="Property-facing information shown across the platform.">
          <div className="grid gap-4">
            <label>
              <span className="field-label">Hotel name</span>
              <input
                className="input-base"
                value={hotelName}
                onChange={(event) => setHotelName(event.target.value)}
              />
            </label>
            <label>
              <span className="field-label">Operations email</span>
              <input
                className="input-base"
                value={contactEmail}
                onChange={(event) => setContactEmail(event.target.value)}
              />
            </label>
          </div>
        </Panel>

        <Panel title="Stay defaults" description="Working defaults for guest arrival and departure.">
          <div className="grid gap-4 sm:grid-cols-3">
            <label>
              <span className="field-label">Check-in</span>
              <input
                className="input-base"
                type="time"
                value={checkInTime}
                onChange={(event) => setCheckInTime(event.target.value)}
              />
            </label>
            <label>
              <span className="field-label">Check-out</span>
              <input
                className="input-base"
                type="time"
                value={checkOutTime}
                onChange={(event) => setCheckOutTime(event.target.value)}
              />
            </label>
            <label>
              <span className="field-label">Quiet hours</span>
              <input
                className="input-base"
                type="time"
                value={quietHours}
                onChange={(event) => setQuietHours(event.target.value)}
              />
            </label>
          </div>
        </Panel>

        <Panel title="Notification preferences" description="Operational alerts routed to staff and management.">
          <div className="space-y-3">
            <label className="flex items-center justify-between gap-3 rounded-md border border-slate-200 px-4 py-3">
              <span className="text-sm text-slate-700">Arrival and departure alerts</span>
              <input type="checkbox" checked={arrivalAlerts} onChange={() => setArrivalAlerts((value) => !value)} />
            </label>
            <label className="flex items-center justify-between gap-3 rounded-md border border-slate-200 px-4 py-3">
              <span className="text-sm text-slate-700">Inventory threshold alerts</span>
              <input type="checkbox" checked={inventoryAlerts} onChange={() => setInventoryAlerts((value) => !value)} />
            </label>
            <label className="flex items-center justify-between gap-3 rounded-md border border-slate-200 px-4 py-3">
              <span className="text-sm text-slate-700">Maintenance issue alerts</span>
              <input type="checkbox" checked={maintenanceAlerts} onChange={() => setMaintenanceAlerts((value) => !value)} />
            </label>
          </div>
        </Panel>

        <Panel title="Role access" description="Current role coverage in this frontend MVP.">
          <div className="divide-y divide-slate-200 text-sm">
            <div className="grid grid-cols-[180px_minmax(0,1fr)] gap-4 py-3">
              <p className="font-medium text-slate-900">Reception</p>
              <p className="text-slate-500">Overview, reservations, guests, and room readiness.</p>
            </div>
            <div className="grid grid-cols-[180px_minmax(0,1fr)] gap-4 py-3">
              <p className="font-medium text-slate-900">Housekeeping</p>
              <p className="text-slate-500">Overview, rooms, housekeeping queue, and inventory.</p>
            </div>
            <div className="grid grid-cols-[180px_minmax(0,1fr)] gap-4 py-3">
              <p className="font-medium text-slate-900">Maintenance</p>
              <p className="text-slate-500">Overview, rooms, maintenance queue, and inventory.</p>
            </div>
            <div className="grid grid-cols-[180px_minmax(0,1fr)] gap-4 py-3">
              <p className="font-medium text-slate-900">Management</p>
              <p className="text-slate-500">Full access across operations, reporting, and settings.</p>
            </div>
          </div>
        </Panel>
      </div>
    </>
  );
}
