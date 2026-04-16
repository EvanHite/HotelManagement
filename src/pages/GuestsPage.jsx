import { useMemo, useState } from "react";
import { DataTable } from "../components/DataTable";
import { Panel } from "../components/Panel";
import { SectionHeading } from "../components/SectionHeading";
import { StatusBadge } from "../components/StatusBadge";
import { useHotelApp } from "../context/HotelAppContext";
import { formatDateRange, matchesSearch } from "../utils/formatters";

export function GuestsPage() {
  const { guestProfiles, reservations, searchQuery } = useHotelApp();
  const [localSearch, setLocalSearch] = useState("");
  const [selectedGuestId, setSelectedGuestId] = useState(guestProfiles[0]?.id ?? "");

  const guestRows = useMemo(
    () =>
      guestProfiles
        .map((guest) => {
          const stays = reservations.filter((reservation) => reservation.guestId === guest.id);
          const nextStay = stays.find((reservation) =>
            ["pending", "confirmed", "checked-in"].includes(reservation.status),
          );

          return {
            ...guest,
            stayCount: stays.length,
            nextStay,
          };
        })
        .filter((guest) =>
          matchesSearch(
            `${guest.name} ${guest.email} ${guest.company} ${guest.loyaltyTier}`,
            `${searchQuery} ${localSearch}`.trim(),
          ),
        ),
    [guestProfiles, localSearch, reservations, searchQuery],
  );

  const selectedGuest =
    guestRows.find((guest) => guest.id === selectedGuestId) ??
    guestProfiles.find((guest) => guest.id === selectedGuestId) ??
    guestRows[0] ??
    null;
  const stayHistory = reservations.filter((reservation) => reservation.guestId === selectedGuest?.id);

  return (
    <>
      <SectionHeading title="Guests" />

      <div className="flex justify-end">
        <input
          className="input-base min-w-[280px]"
          value={localSearch}
          onChange={(event) => setLocalSearch(event.target.value)}
          placeholder="Search guest, company, or email"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_420px]">
        <Panel
          title="Guest records"
          action={<span className="text-sm text-slate-500">{guestRows.length}</span>}
        >
          <DataTable
            compact
            columns={[
              {
                key: "name",
                header: "Name",
                truncate: true,
                minWidthClass: "min-w-[156px]",
                cellClassName: "font-medium text-slate-900",
              },
              {
                key: "email",
                header: "Email",
                truncate: true,
                minWidthClass: "min-w-[176px]",
              },
              { key: "company", header: "Company", truncate: true, minWidthClass: "min-w-[132px]" },
              {
                key: "loyaltyTier",
                header: "Tier",
                render: (row) => <StatusBadge value={row.loyaltyTier} />,
                nowrap: true,
                minWidthClass: "min-w-[84px]",
              },
              { key: "stayCount", header: "Stays", nowrap: true, minWidthClass: "min-w-[68px]" },
              {
                key: "nextStay",
                header: "Next stay",
                render: (row) =>
                  row.nextStay ? formatDateRange(row.nextStay.checkIn, row.nextStay.checkOut) : "None",
                nowrap: true,
                minWidthClass: "min-w-[140px]",
              },
            ]}
            rows={guestRows}
            onRowClick={(row) => setSelectedGuestId(row.id)}
            emptyTitle="No guests match"
            emptyDescription="Adjust the search to see matching guest records."
          />
        </Panel>

        {selectedGuest && (
          <div className="space-y-6">
            <Panel title={selectedGuest.name} description={selectedGuest.company}>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">Contact</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{selectedGuest.email}</p>
                  <p className="text-sm text-slate-600">{selectedGuest.phone}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Loyalty</p>
                  <div className="mt-1">
                    <StatusBadge value={selectedGuest.loyaltyTier} />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Preferences</p>
                  <p className="mt-1 text-sm text-slate-600">{selectedGuest.notes}</p>
                </div>
              </div>
            </Panel>

            <Panel title="Stay history" description="Completed and upcoming reservations for this guest.">
              <div className="space-y-3">
                {stayHistory.map((reservation) => (
                  <div key={reservation.id} className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          Room {reservation.roomNumber} / {reservation.roomType}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {formatDateRange(reservation.checkIn, reservation.checkOut)}
                        </p>
                      </div>
                      <StatusBadge value={reservation.status} />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        )}
      </div>
    </>
  );
}
