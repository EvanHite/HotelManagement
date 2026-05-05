import { useState } from "react";
import { FilterTabs, SectionHeading } from "../components/ui";
import { HousekeepingSection } from "./HousekeepingPage";
import { InventorySection } from "./InventoryPage";
import { MaintenanceSection } from "./MaintenancePage";

const operationsTabs = [
  { label: "Housekeeping", value: "housekeeping" },
  { label: "Maintenance", value: "maintenance" },
  { label: "Inventory", value: "inventory" },
];

export function OperationsPage() {
  const [activeTab, setActiveTab] = useState("housekeeping");

  return (
    <>
      <SectionHeading title="Operations" />
      <FilterTabs fill options={operationsTabs} value={activeTab} onChange={setActiveTab} />

      {activeTab === "housekeeping" && <HousekeepingSection showHeading={false} />}
      {activeTab === "maintenance" && <MaintenanceSection showHeading={false} />}
      {activeTab === "inventory" && <InventorySection showHeading={false} />}
    </>
  );
}
