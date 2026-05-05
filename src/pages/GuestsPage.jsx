import { useMemo, useState } from "react";
import { DataTable } from "../components/DataTable";
import { Panel } from "../components/ui";
import { SearchInput } from "../components/ui";
import { SectionHeading } from "../components/ui";
import { StatusBadge } from "../components/ui";
import { useHotelApp } from "../context/HotelAppContext";
import { formatDateRange, matchesSearch } from "../utils/formatters";

export function GuestsSection({ showHeading = true } = {}) {
  const { createGuest, guestProfiles, reservations, searchQuery, updateGuest } = useHotelApp();
  const [localSearch, setLocalSearch] = useState("");
  const [selectedGuestId, setSelectedGuestId] = useState(guestProfiles[0]?.id ?? "");
  const [isEditingGuest, setIsEditingGuest] = useState(false);
  const [isNewGuest, setIsNewGuest] = useState(false);
  const [guestDraft, setGuestDraft] = useState({
    name: "",
    email: "",
    phone: "",
    loyaltyTier: "Standard",
    company: "",
    notes: "",
  });
  const [guestFeedback, setGuestFeedback] = useState("");

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

  function startNewGuest() {
    setGuestDraft({
      name: "",
      email: "",
      phone: "",
      loyaltyTier: "Standard",
      company: "",
      notes: "",
    });
    setIsEditingGuest(true);
    setIsNewGuest(true);
    setGuestFeedback("");
  }

  function startEditGuest() {
    setGuestDraft({
      name: selectedGuest.name,
      email: selectedGuest.email,
      phone: selectedGuest.phone,
      loyaltyTier: selectedGuest.loyaltyTier,
      company: selectedGuest.company,
      notes: selectedGuest.notes,
    });
    setIsEditingGuest(true);
    setIsNewGuest(false);
    setGuestFeedback("");
  }

  function updateGuestDraft(field, value) {
    setGuestDraft((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function saveGuest() {
    if (!guestDraft.name.trim() || !guestDraft.email.trim()) {
      setGuestFeedback("Guest name and email are required.");
      return;
    }

    if (!isNewGuest && selectedGuest) {
      updateGuest(selectedGuest.id, guestDraft);
      setGuestFeedback("Guest updated.");
      setIsEditingGuest(false);
      return;
    }

    const createdGuest = await createGuest(guestDraft);

    if (!createdGuest) {
      setGuestFeedback("Guest could not be saved.");
      return;
    }

    setSelectedGuestId(createdGuest.id);
    setGuestFeedback("Guest added.");
    setIsEditingGuest(false);
  }

  return (
    <>
      {showHeading && <SectionHeading title="Guests" />}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button className="btn-primary w-full sm:w-auto" type="button" onClick={startNewGuest}>
          Add guest
        </button>
        <SearchInput
          className="w-full sm:w-[320px]"
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
              {!isEditingGuest ? (
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
                  <button className="btn-secondary" type="button" onClick={startEditGuest}>
                    Edit guest
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <label>
                    <span className="field-label">Name</span>
                    <input
                      className="input-base"
                      value={guestDraft.name}
                      onChange={(event) => updateGuestDraft("name", event.target.value)}
                    />
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label>
                      <span className="field-label">Email</span>
                      <input
                        className="input-base"
                        value={guestDraft.email}
                        onChange={(event) => updateGuestDraft("email", event.target.value)}
                      />
                    </label>
                    <label>
                      <span className="field-label">Phone</span>
                      <input
                        className="input-base"
                        value={guestDraft.phone}
                        onChange={(event) => updateGuestDraft("phone", event.target.value)}
                      />
                    </label>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label>
                      <span className="field-label">Tier</span>
                      <select
                        className="input-base"
                        value={guestDraft.loyaltyTier}
                        onChange={(event) => updateGuestDraft("loyaltyTier", event.target.value)}
                      >
                        <option>Standard</option>
                        <option>Silver</option>
                        <option>Gold</option>
                        <option>Platinum</option>
                      </select>
                    </label>
                    <label>
                      <span className="field-label">Company</span>
                      <input
                        className="input-base"
                        value={guestDraft.company}
                        onChange={(event) => updateGuestDraft("company", event.target.value)}
                      />
                    </label>
                  </div>
                  <label>
                    <span className="field-label">Notes</span>
                    <textarea
                      className="textarea-base min-h-24 resize-none"
                      value={guestDraft.notes}
                      onChange={(event) => updateGuestDraft("notes", event.target.value)}
                    />
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <button className="btn-primary" type="button" onClick={saveGuest}>
                      Save guest
                    </button>
                    <button
                      className="btn-secondary"
                      type="button"
                      onClick={() => setIsEditingGuest(false)}
                    >
                      Cancel
                    </button>
                    {guestFeedback && <p className="text-sm text-slate-500">{guestFeedback}</p>}
                  </div>
                </div>
              )}
            </Panel>

            <Panel title="Stay history">
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
