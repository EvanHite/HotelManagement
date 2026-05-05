import { Panel } from "../components/ui";
import { SectionHeading } from "../components/ui";
import { useHotelApp } from "../context/HotelAppContext";

export function AmenitiesPage() {
  const { amenities } = useHotelApp();
  const included = amenities.filter((item) => item.amenityGroup === "included");
  const requestable = amenities.filter((item) => item.amenityGroup === "requestable");

  return (
    <>
      <SectionHeading title="Amenities" />

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Included">
          <div className="divide-y divide-slate-200">
            {included.map((item) => (
              <div key={item.name} className="py-4 first:pt-0 last:pb-0">
                <p className="text-sm font-medium text-slate-900">{item.name}</p>
                <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Requestable services">
          <div className="divide-y divide-slate-200">
            {requestable.map((item) => (
              <div key={item.name} className="py-4 first:pt-0 last:pb-0">
                <p className="text-sm font-medium text-slate-900">{item.name}</p>
                <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}
