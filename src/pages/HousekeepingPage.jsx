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
  { label: "Queued", value: "queued" },
  { label: "In Progress", value: "in-progress" },
  { label: "Completed", value: "completed" },
];

export function HousekeepingPage() {
  const { housekeepingTasks, searchQuery, updateHousekeepingTask } = useHotelApp();
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTaskId, setSelectedTaskId] = useState(housekeepingTasks[0]?.id ?? "");

  const filteredTasks = useMemo(
    () =>
      housekeepingTasks.filter((task) => {
        const matchesStatus =
          statusFilter === "all" ? true : task.status === statusFilter;
        const matchesTerm = matchesSearch(
          `${task.roomNumber} ${task.taskType} ${task.assignedTo} ${task.urgency}`,
          searchQuery,
        );
        return matchesStatus && matchesTerm;
      }),
    [housekeepingTasks, searchQuery, statusFilter],
  );

  const selectedTask =
    filteredTasks.find((task) => task.id === selectedTaskId) ??
    housekeepingTasks.find((task) => task.id === selectedTaskId) ??
    filteredTasks[0] ??
    null;

  return (
    <>
      <SectionHeading
        title="Housekeeping"
        description="Task execution, room turnover, and supply readiness for guest rooms."
      />

      <FilterTabs options={statusOptions} value={statusFilter} onChange={setStatusFilter} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_360px]">
        <Panel title="Task list" description="Room-by-room housekeeping workflow.">
          <DataTable
            columns={[
              { key: "roomNumber", header: "Room", render: (row) => `Room ${row.roomNumber}` },
              { key: "taskType", header: "Task" },
              { key: "assignedTo", header: "Assigned" },
              { key: "dueBy", header: "Due" },
              { key: "urgency", header: "Priority", render: (row) => <StatusBadge value={row.urgency} /> },
              { key: "readiness", header: "Readiness", render: (row) => <StatusBadge value={row.readiness} /> },
              {
                key: "suppliesNeeded",
                header: "Supplies",
                render: (row) =>
                  row.suppliesNeeded.length ? row.suppliesNeeded.join(", ") : "None",
              },
            ]}
            rows={filteredTasks}
            onRowClick={(row) => setSelectedTaskId(row.id)}
            emptyTitle="No housekeeping tasks"
            emptyDescription="No tasks match the current filter."
          />
        </Panel>

        {selectedTask && (
          <Panel title={`Room ${selectedTask.roomNumber}`} description={selectedTask.taskType}>
            <div className="space-y-5">
              <div>
                <p className="text-xs font-medium text-slate-500">Assigned staff</p>
                <p className="mt-1 text-sm text-slate-700">{selectedTask.assignedTo}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Due time</p>
                <p className="mt-1 text-sm text-slate-700">{selectedTask.dueBy}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge value={selectedTask.urgency} />
                <StatusBadge value={selectedTask.readiness} />
                <StatusBadge value={selectedTask.status} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Supplies needed</p>
                <p className="mt-1 text-sm text-slate-700">
                  {selectedTask.suppliesNeeded.length
                    ? selectedTask.suppliesNeeded.join(", ")
                    : "No additional supplies needed"}
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={() => updateHousekeepingTask(selectedTask.id, "queued")}
                >
                  Queue
                </button>
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={() => updateHousekeepingTask(selectedTask.id, "in-progress")}
                >
                  Start
                </button>
                <button
                  className="btn-primary"
                  type="button"
                  onClick={() => updateHousekeepingTask(selectedTask.id, "completed")}
                >
                  Complete
                </button>
              </div>
            </div>
          </Panel>
        )}
      </div>
    </>
  );
}
