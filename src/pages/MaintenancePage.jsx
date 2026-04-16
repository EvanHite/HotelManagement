import { useMemo, useState } from "react";
import { DataTable } from "../components/DataTable";
import { FilterTabs } from "../components/FilterTabs";
import { Panel } from "../components/Panel";
import { SectionHeading } from "../components/SectionHeading";
import { StatusBadge } from "../components/StatusBadge";
import { useHotelApp } from "../context/HotelAppContext";
import { matchesSearch } from "../utils/formatters";

const statusOptions = [
  { label: "All", value: "all" },
  { label: "Open", value: "open" },
  { label: "In Progress", value: "in-progress" },
  { label: "Resolved", value: "resolved" },
];

export function MaintenancePage() {
  const { maintenanceRequests, searchQuery, updateMaintenanceRequest } = useHotelApp();
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequestId, setSelectedRequestId] = useState(maintenanceRequests[0]?.id ?? "");

  const filteredRequests = useMemo(
    () =>
      maintenanceRequests.filter((request) => {
        const matchesStatus =
          statusFilter === "all" ? true : request.status === statusFilter;
        const matchesTerm = matchesSearch(
          `${request.roomNumber} ${request.issueType} ${request.issue} ${request.assignedTo}`,
          searchQuery,
        );
        return matchesStatus && matchesTerm;
      }),
    [maintenanceRequests, searchQuery, statusFilter],
  );

  const selectedRequest =
    filteredRequests.find((request) => request.id === selectedRequestId) ??
    maintenanceRequests.find((request) => request.id === selectedRequestId) ??
    filteredRequests[0] ??
    null;

  return (
    <>
      <SectionHeading
        title="Maintenance"
        description="Issue tracking, room blockers, and repair status management."
      />

      <FilterTabs options={statusOptions} value={statusFilter} onChange={setStatusFilter} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_360px]">
        <Panel title="Issue queue" description="Select an issue to update its status or review location details.">
          <DataTable
            columns={[
              { key: "roomNumber", header: "Room", render: (row) => `Room ${row.roomNumber}` },
              { key: "location", header: "Location" },
              { key: "issueType", header: "Type" },
              { key: "issue", header: "Issue" },
              { key: "assignedTo", header: "Assignee" },
              { key: "submittedDate", header: "Submitted" },
              { key: "priority", header: "Priority", render: (row) => <StatusBadge value={row.priority} /> },
              { key: "status", header: "Status", render: (row) => <StatusBadge value={row.status} /> },
            ]}
            rows={filteredRequests}
            onRowClick={(row) => setSelectedRequestId(row.id)}
            emptyTitle="No maintenance issues"
            emptyDescription="No maintenance requests match the current filter."
          />
        </Panel>

        {selectedRequest && (
          <Panel title={selectedRequest.issueType} description={`Room ${selectedRequest.roomNumber}`}>
            <div className="space-y-5">
              <div>
                <p className="text-xs font-medium text-slate-500">Issue</p>
                <p className="mt-1 text-sm text-slate-700">{selectedRequest.issue}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Location</p>
                <p className="mt-1 text-sm text-slate-700">{selectedRequest.location}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Assignee</p>
                <p className="mt-1 text-sm text-slate-700">{selectedRequest.assignedTo}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge value={selectedRequest.priority} />
                <StatusBadge value={selectedRequest.status} />
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={() => updateMaintenanceRequest(selectedRequest.id, "open")}
                >
                  Open
                </button>
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={() => updateMaintenanceRequest(selectedRequest.id, "in-progress")}
                >
                  Start
                </button>
                <button
                  className="btn-primary"
                  type="button"
                  onClick={() => updateMaintenanceRequest(selectedRequest.id, "resolved")}
                >
                  Resolve
                </button>
              </div>
            </div>
          </Panel>
        )}
      </div>
    </>
  );
}
