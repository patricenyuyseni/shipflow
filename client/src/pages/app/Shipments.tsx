import { useState } from "react";
import { Link } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Download,
  Filter,
  Package,
  PackagePlus,
  Search,
  SlidersHorizontal,
  Truck,
} from "lucide-react";
import {
  fetchAllShipments,
  listShipments,
  type Shipment,
} from "../../api/shipments";
import { downloadCsv, toCsv } from "../../utils/csv";
import { StatusBadge } from "../../components/TrackingTimeline";
import { formatDate } from "../../utils/date";

const STATUSES = [
  "CREATED",
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

const fmtDate = formatDate;

function statusLabel(status: string) {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function ShipmentCard({ shipment }: { shipment: Shipment }) {
  return (
    <Link
      to={`/app/shipments/${shipment.id}`}
      className="group block rounded-2xl border border-line bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-harbor/30 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-steel text-harbor">
            <Package size={18} />
          </div>

          <div className="min-w-0">
            <p className="font-mono text-sm font-bold text-harbor">
              {shipment.trackingNumber}
            </p>
            <p className="mt-0.5 truncate text-xs text-ink/50">
              Created {fmtDate(shipment.createdAt)}
            </p>
          </div>
        </div>

        <StatusBadge status={shipment.status} />
      </div>

      <div className="mt-5 rounded-xl bg-steel/50 p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/40">
          Route
        </p>

        <p className="mt-2 text-sm font-semibold">
          {shipment.origin}
          <span className="mx-2 text-ink/30">→</span>
          {shipment.destination}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/40">
            Recipient
          </p>
          <p className="mt-1 text-sm font-medium">{shipment.recipientName}</p>
        </div>

        <ArrowRight
          size={18}
          className="text-ink/30 transition group-hover:translate-x-1 group-hover:text-harbor"
        />
      </div>
    </Link>
  );
}

export default function Shipments() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState<string | null>(null);

  async function exportCsv() {
    setExporting(true);
    setExportMsg(null);

    try {
      const { rows, truncated } = await fetchAllShipments({
        status,
        search,
      });

      const csv = toCsv(rows as unknown as Record<string, unknown>[], [
        { key: "trackingNumber", header: "Tracking number" },
        { key: "status", header: "Status" },
        { key: "senderName", header: "Sender" },
        { key: "recipientName", header: "Recipient" },
        { key: "origin", header: "Origin" },
        { key: "destination", header: "Destination" },
        { key: "currentLocation", header: "Current location" },
        {
          key: "estimatedDelivery",
          header: "Estimated delivery",
        },
        { key: "createdAt", header: "Created" },
      ]);

      downloadCsv(
        `shipments-${new Date().toISOString().slice(0, 10)}.csv`,
        csv,
      );

      setExportMsg(
        truncated
          ? `Exported the first ${rows.length} shipments. Narrow your filters to export the rest.`
          : `Exported ${rows.length} shipments.`,
      );
    } catch (e) {
      setExportMsg(
        (e as Error).message || "Export failed. Please try again.",
      );
    } finally {
      setExporting(false);
    }
  }

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["shipments", page, status, search],
    queryFn: () => listShipments({ page, status, search }),
    placeholderData: keepPreviousData,
  });

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(input.trim());
  }

  function clearFilters() {
    setInput("");
    setSearch("");
    setStatus("");
    setPage(1);
  }

  const hasFilters = Boolean(search || status);

  return (
    <div className="mx-auto w-full max-w-7xl">
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-harbor/70">
            Operations
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Shipments
            </h1>

            {data && (
              <span className="rounded-full bg-steel px-3 py-1 text-xs font-bold text-ink/65">
                {data.total} total
              </span>
            )}
          </div>

          <p className="mt-2 max-w-2xl text-sm text-ink/60 sm:text-base">
            Search, monitor, and manage every shipment in your operation.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={exportCsv}
            disabled={exporting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 text-sm font-semibold shadow-sm transition hover:bg-steel disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download size={17} />
            {exporting ? "Exporting…" : "Export CSV"}
          </button>

          <Link
            to="/app/shipments/new"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-ink px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-harbor"
          >
            <PackagePlus size={17} />
            New shipment
          </Link>
        </div>
      </div>

      {/* Export message */}
      {exportMsg && (
        <div
          role="status"
          className="mt-5 rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink/70 shadow-sm"
        >
          {exportMsg}
        </div>
      )}

      {/* Filters */}
      <section className="mt-7 rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-steel text-harbor">
            <SlidersHorizontal size={16} />
          </div>

          <div>
            <h2 className="text-sm font-bold">Find shipments</h2>
            <p className="text-xs text-ink/50">
              Search by tracking number, sender, or recipient.
            </p>
          </div>
        </div>

        <form
          className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_210px_auto]"
          onSubmit={submitSearch}
        >
          <label className="relative">
            <span className="sr-only">Search shipments</span>

            <Search
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35"
            />

            <input
              id="q"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tracking number, sender or recipient"
              className="h-11 w-full rounded-lg border border-line bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-ink/35 focus:border-harbor focus:ring-2 focus:ring-signal/30"
            />
          </label>

          <label className="relative">
            <span className="sr-only">Filter by status</span>

            <Filter
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35"
            />

            <select
              id="st"
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value);
              }}
              className="h-11 w-full appearance-none rounded-lg border border-line bg-white pl-10 pr-3 text-sm outline-none transition focus:border-harbor focus:ring-2 focus:ring-signal/30"
            >
              <option value="">All statuses</option>

              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {statusLabel(s)}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className="h-11 rounded-lg bg-harbor px-6 text-sm font-semibold text-white transition hover:bg-ink"
          >
            Search
          </button>
        </form>

        {hasFilters && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-ink/50">
              Active filters:
            </span>

            {search && (
              <span className="rounded-full bg-steel px-3 py-1 text-xs font-semibold">
                Search: {search}
              </span>
            )}

            {status && (
              <span className="rounded-full bg-steel px-3 py-1 text-xs font-semibold">
                {statusLabel(status)}
              </span>
            )}

            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-semibold text-harbor hover:underline"
            >
              Clear all
            </button>
          </div>
        )}
      </section>

      {/* Results */}
      <section
        className="mt-6"
        aria-live="polite"
        aria-busy={isFetching}
      >
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-24 animate-pulse rounded-2xl border border-line bg-white"
              />
            ))}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900"
          >
            <p className="font-semibold">Unable to load shipments</p>

            <p className="mt-1 text-sm text-red-800/75">
              {(error as Error).message}
            </p>

            <button
              onClick={() => refetch()}
              className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-red-100"
            >
              Try again
            </button>
          </div>
        )}

        {data && data.items.length === 0 && (
          <div className="rounded-2xl border border-line bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-steel text-harbor">
              <Package size={24} />
            </div>

            <h2 className="mt-5 font-display text-xl font-bold">
              {hasFilters
                ? "No shipments match your filters"
                : "No shipments yet"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink/55">
              {hasFilters
                ? "Try changing your search or status filter."
                : "Create your first shipment to begin managing your delivery operation."}
            </p>

            {hasFilters ? (
              <button
                onClick={clearFilters}
                className="mt-5 rounded-lg border border-line px-4 py-2.5 text-sm font-semibold hover:bg-steel"
              >
                Clear filters
              </button>
            ) : (
              <Link
                to="/app/shipments/new"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-harbor"
              >
                <PackagePlus size={17} />
                Create shipment
              </Link>
            )}
          </div>
        )}

        {data && data.items.length > 0 && (
          <>
            {/* Result summary */}
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-ink/55">
                Showing{" "}
                <span className="font-semibold text-ink">
                  {(data.page - 1) * data.limit + 1}
                </span>{" "}
                –{" "}
                <span className="font-semibold text-ink">
                  {Math.min(data.page * data.limit, data.total)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-ink">
                  {data.total}
                </span>{" "}
                shipments
              </p>

              {isFetching && (
                <span className="text-xs font-medium text-harbor">
                  Updating…
                </span>
              )}
            </div>

            {/* Mobile */}
            <div className="space-y-3 md:hidden">
              {data.items.map((shipment) => (
                <ShipmentCard key={shipment.id} shipment={shipment} />
              ))}
            </div>

            {/* Desktop */}
            <div className="hidden overflow-hidden rounded-2xl border border-line bg-white shadow-sm md:block">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-line bg-steel/60">
                    <tr>
                      <th
                        scope="col"
                        className="px-5 py-4 text-xs font-bold uppercase tracking-[0.08em] text-ink/50"
                      >
                        Shipment
                      </th>

                      <th
                        scope="col"
                        className="px-5 py-4 text-xs font-bold uppercase tracking-[0.08em] text-ink/50"
                      >
                        Recipient
                      </th>

                      <th
                        scope="col"
                        className="px-5 py-4 text-xs font-bold uppercase tracking-[0.08em] text-ink/50"
                      >
                        Route
                      </th>

                      <th
                        scope="col"
                        className="px-5 py-4 text-xs font-bold uppercase tracking-[0.08em] text-ink/50"
                      >
                        Status
                      </th>

                      <th
                        scope="col"
                        className="px-5 py-4 text-xs font-bold uppercase tracking-[0.08em] text-ink/50"
                      >
                        Created
                      </th>

                      <th
                        scope="col"
                        className="px-5 py-4 text-right text-xs font-bold uppercase tracking-[0.08em] text-ink/50"
                      >
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {data.items.map((shipment) => (
                      <tr
                        key={shipment.id}
                        className="group border-b border-line last:border-0 hover:bg-steel/30"
                      >
                        <td className="px-5 py-4">
                          <Link
                            to={`/app/shipments/${shipment.id}`}
                            className="block"
                          >
                            <p className="font-mono text-sm font-bold text-harbor">
                              {shipment.trackingNumber}
                            </p>

                            <p className="mt-1 text-xs text-ink/45">
                              {shipment.packageWeight} kg
                            </p>
                          </Link>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-medium">
                            {shipment.recipientName}
                          </p>

                          {shipment.recipientEmail && (
                            <p className="mt-1 max-w-44 truncate text-xs text-ink/45">
                              {shipment.recipientEmail}
                            </p>
                          )}
                        </td>

                        <td className="max-w-64 px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Truck
                              size={15}
                              className="shrink-0 text-ink/30"
                            />

                            <span className="truncate text-sm">
                              {shipment.origin}
                              <span className="mx-2 text-ink/30">→</span>
                              {shipment.destination}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge status={shipment.status} />
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-ink/55">
                          {fmtDate(shipment.createdAt)}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <Link
                            to={`/app/shipments/${shipment.id}`}
                            className="inline-flex h-9 items-center gap-1 rounded-lg px-3 text-sm font-semibold text-harbor transition hover:bg-steel"
                          >
                            View
                            <ArrowRight
                              size={15}
                              className="transition group-hover:translate-x-0.5"
                            />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <nav
              className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              aria-label="Shipment pagination"
            >
              <p className="text-sm text-ink/55">
                Page{" "}
                <span className="font-semibold text-ink">
                  {data.page}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-ink">
                  {Math.max(data.totalPages, 1)}
                </span>
              </p>

              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="h-10 rounded-lg border border-line bg-white px-4 text-sm font-semibold transition hover:bg-steel disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <button
                  disabled={page >= data.totalPages}
                  onClick={() => setPage(page + 1)}
                  className="h-10 rounded-lg border border-line bg-white px-4 text-sm font-semibold transition hover:bg-steel disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </nav>
          </>
        )}
      </section>
    </div>
  );
}
