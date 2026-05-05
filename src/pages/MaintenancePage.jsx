import { useMemo, useState } from "react";
import { DataTable } from "../components/DataTable";
import { FilterTabs } from "../components/ui";
import { Panel } from "../components/ui";
import { SectionHeading } from "../components/ui";
import { StatusBadge } from "../components/ui";
import { useHotelApp } from "../context/HotelAppContext";
import { matchesSearch } from "../utils/formatters";

const statusOptions = [
  { label: "All", value: "all" },
  { label: "Open", value: "open" },
  { label: "In Progress", value: "in-progress" },
  { label: "Resolved", value: "resolved" },
];

export function MaintenanceSection({ showHeading = true } = {}) {
  const {
    createMaintenanceRequest,
    deleteMaintenanceRequest,
    maintenanceRequests,
    roomViews,
    searchQuery,
    session,
    updateMaintenanceRequest,
  } = useHotelApp();
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequestId, setSelectedRequestId] = useState(maintenanceRequests[0]?.id ?? "");
  const [newRequest, setNewRequest] = useState({
    roomId: roomViews[0]?.id ?? "",
    issueType: "Plumbing",
    issue: "",
    priority: "medium",
    assignedTo: "Theo Grant",
  });

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

  async function handleCreateRequest(event) {
    event.preventDefault();

    const createdRequest = await createMaintenanceRequest(newRequest);

    if (!createdRequest) {
      return;
    }

    setSelectedRequestId(createdRequest.id);
    setNewRequest({
      roomId: roomViews[0]?.id ?? "",
      issueType: "Plumbing",
      issue: "",
      priority: "medium",
      assignedTo: "Theo Grant",
    });
  }

  function handleDeleteRequest() {
    if (!selectedRequest || !window.confirm("Delete this maintenance request?")) {
      return;
    }

    deleteMaintenanceRequest(selectedRequest.id);
    setSelectedRequestId("");
  }

  return (
    <>
      {showHeading && <SectionHeading title="Maintenance" />}

      <FilterTabs options={statusOptions} value={statusFilter} onChange={setStatusFilter} />

      <Panel title="Create request">
        <form className="grid gap-3 md:grid-cols-5" onSubmit={handleCreateRequest}>
          <label>
            <span className="field-label">Room</span>
            <select
              className="input-base"
              value={newRequest.roomId}
              onChange={(event) =>
                setNewRequest((current) => ({ ...current, roomId: event.target.value }))
              }
            >
              {roomViews.map((room) => (
                <option key={room.id} value={room.id}>
                  Room {room.number}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="field-label">Type</span>
            <select
              className="input-base"
              value={newRequest.issueType}
              onChange={(event) =>
                setNewRequest((current) => ({ ...current, issueType: event.target.value }))
              }
            >
              <option value="Plumbing">Plumbing</option>
              <option value="HVAC">HVAC</option>
              <option value="Electrical">Electrical</option>
              <option value="Furniture">Furniture</option>
              <option value="Electronics">Electronics</option>
            </select>
          </label>
          <label>
            <span className="field-label">Priority</span>
            <select
              className="input-base"
              value={newRequest.priority}
              onChange={(event) =>
                setNewRequest((current) => ({ ...current, priority: event.target.value }))
              }
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          <label>
            <span className="field-label">Assignee</span>
            <input
              className="input-base"
              value={newRequest.assignedTo}
              onChange={(event) =>
                setNewRequest((current) => ({ ...current, assignedTo: event.target.value }))
              }
            />
          </label>
          <label>
            <span className="field-label">Issue</span>
            <input
              className="input-base"
              required
              placeholder="Describe the problem"
              value={newRequest.issue}
              onChange={(event) =>
                setNewRequest((current) => ({ ...current, issue: event.target.value }))
              }
            />
          </label>
          <div className="md:col-span-5">
            <button className="btn-primary" type="submit">
              Create request
            </button>
          </div>
        </form>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_360px]">
        <Panel title="Issue queue">
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
            rowClassName={(row) => (row.status === "resolved" ? "opacity-60" : "")}
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
              {["maintenance", "management"].includes(session.role) && (
                <div className="border-t border-slate-200 pt-4">
                  <button className="btn-danger" type="button" onClick={handleDeleteRequest}>
                    Delete request
                  </button>
                </div>
              )}
            </div>
          </Panel>
        )}
      </div>
    </>
  );
}
