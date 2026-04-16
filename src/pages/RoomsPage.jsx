import { useMemo, useState } from "react";
import { DataTable } from "../components/DataTable";
import { FilterTabs } from "../components/FilterTabs";
import { Panel } from "../components/Panel";
import { SectionHeading } from "../components/SectionHeading";
import { StatusBadge } from "../components/StatusBadge";
import { useHotelApp } from "../context/HotelAppContext";
import { formatDateRange, formatMoney, matchesSearch } from "../utils/formatters";

const statusOptions = [
  { label: "All", value: "all" },
  { label: "Available", value: "available" },
  { label: "Occupied", value: "occupied" },
  { label: "Cleaning", value: "cleaning" },
  { label: "Out of Service", value: "maintenance" },
];

export function RoomsPage() {
  const { roomTypeOptions, roomViews, searchQuery } = useHotelApp();
  const [statusFilter, setStatusFilter] = useState("all");
  const [roomTypeFilter, setRoomTypeFilter] = useState("all");
  const [selectedRoomId, setSelectedRoomId] = useState(roomViews[0]?.id ?? "");

  const filteredRooms = useMemo(
    () =>
      roomViews.filter((room) => {
        const matchesStatus =
          statusFilter === "all" ? true : room.displayStatus === statusFilter;
        const matchesRoomType =
          roomTypeFilter === "all" ? true : room.type === roomTypeFilter;
        const matchesTerm = matchesSearch(
          `${room.number} ${room.type} ${room.displayStatus} ${room.notes}`,
          searchQuery,
        );
        return matchesStatus && matchesRoomType && matchesTerm;
      }),
    [roomTypeFilter, roomViews, searchQuery, statusFilter],
  );

  const selectedRoom =
    filteredRooms.find((room) => room.id === selectedRoomId) ??
    roomViews.find((room) => room.id === selectedRoomId) ??
    filteredRooms[0] ??
    null;

  return (
    <>
      <SectionHeading
        title="Rooms"
        description="Room inventory, readiness state, and active occupancy context."
      />

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <FilterTabs options={statusOptions} value={statusFilter} onChange={setStatusFilter} />
        <select
          className="input-base min-w-[200px]"
          value={roomTypeFilter}
          onChange={(event) => setRoomTypeFilter(event.target.value)}
        >
          <option value="all">All room types</option>
          {roomTypeOptions.map((roomType) => (
            <option key={roomType} value={roomType}>
              {roomType}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_380px]">
        <Panel title="Room inventory" description="Select a room to review active context and readiness.">
          <DataTable
            columns={[
              { key: "number", header: "Room", render: (row) => `Room ${row.number}` },
              { key: "type", header: "Type" },
              { key: "readiness", header: "Readiness", render: (row) => <StatusBadge value={row.readiness} /> },
              {
                key: "displayStatus",
                header: "Status",
                render: (row) => <StatusBadge value={row.displayStatus} />,
              },
              {
                key: "currentGuestName",
                header: "Current guest",
                render: (row) => row.currentGuestName ?? "Vacant",
              },
              {
                key: "rate",
                header: "Rate",
                render: (row) => formatMoney(row.rate),
              },
            ]}
            rows={filteredRooms}
            onRowClick={(row) => setSelectedRoomId(row.id)}
            emptyTitle="No rooms match"
            emptyDescription="Adjust the filters to review room inventory."
          />
        </Panel>

        {selectedRoom && (
          <Panel title={`Room ${selectedRoom.number}`} description={selectedRoom.type}>
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-slate-500">Status</p>
                  <div className="mt-1">
                    <StatusBadge value={selectedRoom.displayStatus} />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Readiness</p>
                  <div className="mt-1">
                    <StatusBadge value={selectedRoom.readiness} />
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Capacity</p>
                <p className="mt-1 text-sm text-slate-700">
                  {selectedRoom.capacity} guests / {selectedRoom.beds} bed(s)
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Current guest</p>
                <p className="mt-1 text-sm text-slate-700">
                  {selectedRoom.currentGuestName ?? "No active guest"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Housekeeping</p>
                <p className="mt-1 text-sm text-slate-700">{selectedRoom.housekeepingState}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Maintenance</p>
                <p className="mt-1 text-sm text-slate-700">{selectedRoom.maintenanceState}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Reservation context</p>
                <p className="mt-1 text-sm text-slate-700">
                  {selectedRoom.activeReservation
                    ? formatDateRange(
                        selectedRoom.activeReservation.checkIn,
                        selectedRoom.activeReservation.checkOut,
                      )
                    : "No active reservation"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Notes</p>
                <p className="mt-1 text-sm text-slate-700">{selectedRoom.notes}</p>
              </div>
            </div>
          </Panel>
        )}
      </div>
    </>
  );
}
