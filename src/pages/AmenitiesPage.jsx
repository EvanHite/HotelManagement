import { Panel } from "../components/Panel";
import { SectionHeading } from "../components/SectionHeading";
import { amenities } from "../data/mockData";

export function AmenitiesPage() {
  const included = amenities.slice(0, 3);
  const requestable = amenities.slice(3);

  return (
    <>
      <SectionHeading
        title="Amenities"
        description="Service information available during the guest stay."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Included" description="Amenities available as part of the stay.">
          <div className="divide-y divide-slate-200">
            {included.map((item) => (
              <div key={item.name} className="py-4 first:pt-0 last:pb-0">
                <p className="text-sm font-medium text-slate-900">{item.name}</p>
                <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Requestable services" description="Services coordinated through the property staff.">
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
