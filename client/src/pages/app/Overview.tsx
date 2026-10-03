import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getStats } from "../../api/shipments";
import { StatusBadge } from "../../components/TrackingTimeline";
import type { ShipmentStatus } from "../../api/tracking";

const CARDS: { key: "total" | ShipmentStatus; label: string; filter?: ShipmentStatus }[] = [
  { key: "total", label: "All shipments" },
  { key: "CREATED", label: "Created" },
  { key: "IN_TRANSIT", label: "In transit" },
  { key: "OUT_FOR_DELIVERY", label: "Out for delivery" },
  { key: "DELIVERED", label: "Delivered" },
  { key: "CANCELLED", label: "Cancelled" },
];

export default function Overview() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ["stats"], queryFn: getStats });

  return (
    <div className="max-w-5xl">
      <h1 className="font-display text-3xl font-bold">Overview</h1>
      {isLoading && <p className="mt-4 text-ink/70">Loading overview…</p>}
      {error && (
        <div role="alert" className="mt-4 rounded-md bg-red-50 p-4 text-red-900">
          <p>{(error as Error).message}</p>
          <button onClick={() => refetch()} className="mt-2 font-medium underline">Try again</button>
        </div>
      )}
      {data && (
        <>
          <dl className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
            {CARDS.map((c) => (
              <div key={c.key} className="rounded-lg border border-line p-4">
                <dt className="text-sm text-ink/60">{c.label}</dt>
                <dd className="mt-1 font-display text-3xl font-bold">{c.key === "total" ? data.total : data.byStatus[c.key]}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-8 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Latest shipments</h2>
            <Link to="/app/shipments" className="text-sm font-medium text-harbor underline">View all</Link>
          </div>
          {data.recent.length === 0 ? (
            <div className="mt-3 rounded-lg bg-steel p-8 text-center">
              <p className="font-semibold">No shipments yet.</p>
              <Link to="/app/shipments/new" className="mt-2 inline-block font-medium text-harbor underline">Create your first shipment</Link>
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-line rounded-lg border border-line">
              {data.recent.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
                  <div className="min-w-0">
                    <Link to={`/app/shipments/${s.id}`} className="font-mono font-medium text-harbor underline">{s.trackingNumber}</Link>
                    <p className="text-sm text-ink/60">{s.origin} → {s.destination}</p>
                  </div>
                  <StatusBadge status={s.status} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
