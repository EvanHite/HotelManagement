import { useState } from "react";
import { FilterTabs, SectionHeading } from "../components/ui";
import { GuestsSection } from "./GuestsPage";
import { ReservationsSection } from "./ReservationsPage";
import { RoomsSection } from "./RoomsPage";

const frontDeskTabs = [
  { label: "Reservations", value: "reservations" },
  { label: "Guests", value: "guests" },
  { label: "Rooms", value: "rooms" },
];

export function FrontDeskPage() {
  const [activeTab, setActiveTab] = useState("reservations");

  return (
    <>
      <SectionHeading title="Front Desk" />
      <FilterTabs fill options={frontDeskTabs} value={activeTab} onChange={setActiveTab} />

      {activeTab === "reservations" && <ReservationsSection showHeading={false} />}
      {activeTab === "guests" && <GuestsSection showHeading={false} />}
      {activeTab === "rooms" && <RoomsSection showHeading={false} />}
    </>
  );
}
