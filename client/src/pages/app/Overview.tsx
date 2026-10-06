import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Package,
  PackagePlus,
  Truck,
  XCircle,
} from "lucide-react";
import { getStats } from "../../api/shipments";
import { StatusBadge } from "../../components/TrackingTimeline";
import type { ShipmentStatus } from "../../api/tracking";
import { formatDateTime } from "../../utils/date";

const STATUS_CARDS: {
  key: ShipmentStatus;
  label: string;
  icon: typeof Package;
  description: string;
}[] = [
  {
    key: "CREATED",
    label: "Created",
    icon: Package,
    description: "Awaiting pickup",
  },
  {
    key: "IN_TRANSIT",
    label: "In transit",
    icon: Truck,
    description: "Moving through network",
  },
  {
    key: "OUT_FOR_DELIVERY",
    label: "Out for delivery",
    icon: Clock3,
    description: "Final delivery stage",
  },
  {
    key: "DELIVERED",
    label: "Delivered",
    icon: CheckCircle2,
    description: "Successfully delivered",
  },
];

export default function Overview() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["stats"],
    queryFn: getStats,
  });

  const total = data?.total ?? 0;

  return (
    <div className="mx-auto w-full max-w-7xl">
      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-harbor/70">
            Operations
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-ink/60 sm:text-base">
            Monitor shipments, delivery progress, and your shipping operation
            from one place.
          </p>
        </div>

        <Link
          to="/app/shipments/new"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-ink px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-harbor"
        >
          <PackagePlus size={18} />
          Create shipment
        </Link>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-36 animate-pulse rounded-2xl border border-line bg-white"
            />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="mt-8 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-5 text-red-900 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-semibold">Unable to load dashboard</p>
            <p className="mt-1 text-sm text-red-800/80">
              {(error as Error).message}
            </p>
          </div>

          <button
            onClick={() => refetch()}
            className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-red-100"
          >
            Try again
          </button>
        </div>
      )}

      {data && (
        <>
          {/* Total */}
          <section className="mt-8">
            <div className="rounded-2xl bg-harbor p-6 text-white shadow-sm sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-white/70">
                    Total shipments
                  </p>
                  <p className="mt-2 font-display text-4xl font-bold tracking-tight">
                    {total}
                  </p>
                  <p className="mt-2 text-sm text-white/65">
                    All shipments currently managed by ShipFlow
                  </p>
                </div>

                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/10">
                  <Package size={23} />
                </div>
              </div>

              <Link
                to="/app/shipments"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-signal"
              >
                View all shipments
                <ArrowRight size={16} />
              </Link>
            </div>
          </section>

          {/* Status cards */}
          <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STATUS_CARDS.map((card) => {
              const Icon = card.icon;
              const value = data.byStatus[card.key] ?? 0;

              return (
                <Link
                  key={card.key}
                  to={`/app/shipments?status=${card.key}`}
                  className="group rounded-2xl border border-line bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-harbor/30 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-steel text-harbor">
                      <Icon size={19} />
                    </div>

                    <ArrowRight
                      size={17}
                      className="text-ink/30 transition group-hover:translate-x-1 group-hover:text-harbor"
                    />
                  </div>

                  <p className="mt-5 text-sm font-medium text-ink/60">
                    {card.label}
                  </p>

                  <p className="mt-1 font-display text-3xl font-bold">
                    {value}
                  </p>

                  <p className="mt-1 text-xs text-ink/50">
                    {card.description}
                  </p>
                </Link>
              );
            })}
          </section>

          {/* Recent shipments */}
          <section className="mt-8 overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <h2 className="font-display text-xl font-bold">
                  Recent shipments
                </h2>
                <p className="mt-1 text-sm text-ink/55">
                  The latest shipments created in your operation.
                </p>
              </div>

              <Link
                to="/app/shipments"
                className="inline-flex items-center gap-1 text-sm font-semibold text-harbor hover:underline"
              >
                View all
                <ArrowRight size={15} />
              </Link>
            </div>

            {data.recent.length === 0 ? (
              <div className="p-10 text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-steel text-harbor">
                  <Package size={24} />
                </div>
                <h3 className="mt-4 font-semibold">No shipments yet</h3>
                <p className="mx-auto mt-1 max-w-sm text-sm text-ink/55">
                  Create your first shipment to start tracking your operation.
                </p>
                <Link
                  to="/app/shipments/new"
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-white hover:bg-harbor"
                >
                  <PackagePlus size={17} />
                  Create shipment
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-line">
                {data.recent.map((shipment) => (
                  <Link
                    key={shipment.id}
                    to={`/app/shipments/${shipment.id}`}
                    className="group block p-5 transition hover:bg-steel/40 sm:p-6"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-start gap-4">
                        <div className="hidden h-10 w-10 shrink-0 place-items-center rounded-lg bg-steel text-harbor sm:grid">
                          <Truck size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="font-mono text-sm font-semibold text-harbor">
                            {shipment.trackingNumber}
                          </p>

                          <p className="mt-1 truncate text-sm font-medium">
                            {shipment.origin}
                            <span className="mx-2 text-ink/30">→</span>
                            {shipment.destination}
                          </p>

                          <p className="mt-1 text-xs text-ink/50">
                            Created {formatDateTime(shipment.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 sm:justify-end">
                        <StatusBadge status={shipment.status} />
                        <ArrowRight
                          size={17}
                          className="text-ink/30 transition group-hover:translate-x-1 group-hover:text-harbor"
                        />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Quick actions */}
          <section className="mt-8 grid gap-4 sm:grid-cols-2">
            <Link
              to="/app/shipments/new"
              className="group rounded-2xl border border-line bg-white p-5 shadow-sm transition hover:border-harbor/30 hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-signal text-ink">
                  <PackagePlus size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold">Create a shipment</h3>
                  <p className="mt-1 text-sm text-ink/55">
                    Register a new package and generate its tracking number.
                  </p>
                </div>
                <ArrowRight
                  size={18}
                  className="shrink-0 text-ink/30 transition group-hover:translate-x-1"
                />
              </div>
            </Link>

            <Link
              to="/app/shipments"
              className="group rounded-2xl border border-line bg-white p-5 shadow-sm transition hover:border-harbor/30 hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-steel text-harbor">
                  <Truck size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold">Manage shipments</h3>
                  <p className="mt-1 text-sm text-ink/55">
                    Search, update, and manage every shipment.
                  </p>
                </div>
                <ArrowRight
                  size={18}
                  className="shrink-0 text-ink/30 transition group-hover:translate-x-1"
                />
              </div>
            </Link>
          </section>

          {/* Cancellation warning */}
          {(data.byStatus.CANCELLED ?? 0) > 0 && (
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-900">
              <XCircle size={19} className="shrink-0" />
              <p className="text-sm">
                <span className="font-semibold">
                  {data.byStatus.CANCELLED} cancelled shipment
                  {data.byStatus.CANCELLED === 1 ? "" : "s"}.
                </span>{" "}
                Review cancelled shipments from the shipments section.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
