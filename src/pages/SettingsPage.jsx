import { Panel } from "../components/ui";
import { SectionHeading } from "../components/ui";
import { useHotelApp } from "../context/HotelAppContext";

export function SettingsPage() {
  const { resetDemoData, settings, updateSettings } = useHotelApp();

  function changeSetting(field, value) {
    updateSettings({ [field]: value });
  }

  return (
    <>
      <SectionHeading
        title="Settings"
        actions={
          <button className="btn-danger" type="button" onClick={resetDemoData}>
            Reset demo data
          </button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Hotel profile">
          <div className="grid gap-4">
            <label>
              <span className="field-label">Hotel name</span>
              <input
                className="input-base"
                value={settings.hotelName}
                onChange={(event) => changeSetting("hotelName", event.target.value)}
              />
            </label>
            <label>
              <span className="field-label">Operations email</span>
              <input
                className="input-base"
                value={settings.contactEmail}
                onChange={(event) => changeSetting("contactEmail", event.target.value)}
              />
            </label>
          </div>
        </Panel>

        <Panel title="Stay defaults">
          <div className="grid gap-4 sm:grid-cols-3">
            <label>
              <span className="field-label">Check-in</span>
              <input
                className="input-base"
                type="time"
                value={settings.checkInTime}
                onChange={(event) => changeSetting("checkInTime", event.target.value)}
              />
            </label>
            <label>
              <span className="field-label">Check-out</span>
              <input
                className="input-base"
                type="time"
                value={settings.checkOutTime}
                onChange={(event) => changeSetting("checkOutTime", event.target.value)}
              />
            </label>
            <label>
              <span className="field-label">Quiet hours</span>
              <input
                className="input-base"
                type="time"
                value={settings.quietHours}
                onChange={(event) => changeSetting("quietHours", event.target.value)}
              />
            </label>
          </div>
        </Panel>

        <Panel title="Notification preferences">
          <div className="space-y-3">
            <label className="flex items-center justify-between gap-3 rounded-md border border-slate-200 px-4 py-3">
              <span className="text-sm text-slate-700">Arrival and departure alerts</span>
              <input
                type="checkbox"
                checked={settings.arrivalAlerts}
                onChange={() => changeSetting("arrivalAlerts", !settings.arrivalAlerts)}
              />
            </label>
            <label className="flex items-center justify-between gap-3 rounded-md border border-slate-200 px-4 py-3">
              <span className="text-sm text-slate-700">Inventory threshold alerts</span>
              <input
                type="checkbox"
                checked={settings.inventoryAlerts}
                onChange={() => changeSetting("inventoryAlerts", !settings.inventoryAlerts)}
              />
            </label>
            <label className="flex items-center justify-between gap-3 rounded-md border border-slate-200 px-4 py-3">
              <span className="text-sm text-slate-700">Maintenance issue alerts</span>
              <input
                type="checkbox"
                checked={settings.maintenanceAlerts}
                onChange={() => changeSetting("maintenanceAlerts", !settings.maintenanceAlerts)}
              />
            </label>
          </div>
        </Panel>

        <Panel title="Role access">
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
