import { useState } from "react";
import { Link } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchAllShipments, listShipments, type Shipment } from "../../api/shipments";
import { downloadCsv, toCsv } from "../../utils/csv";
import { StatusBadge } from "../../components/TrackingTimeline";
import { formatDate } from "../../utils/date";

const STATUSES = ["CREATED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];
const fmtDate = formatDate;

function Card({ s }: { s: Shipment }) {
  return (
    <li className="rounded-lg border border-line p-4">
      <div className="flex items-start justify-between gap-3">
        <Link to={`/app/shipments/${s.id}`} className="font-mono font-medium text-harbor underline">{s.trackingNumber}</Link>
        <StatusBadge status={s.status} />
      </div>
      <p className="mt-2 text-sm">{s.origin} → {s.destination}</p>
      <p className="mt-1 text-sm text-ink/60">{s.recipientName} · {fmtDate(s.createdAt)}</p>
    </li>
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
      const { rows, truncated } = await fetchAllShipments({ status, search });
      const csv = toCsv(rows as unknown as Record<string, unknown>[], [
        { key: "trackingNumber", header: "Tracking number" }, { key: "status", header: "Status" },
        { key: "senderName", header: "Sender" }, { key: "recipientName", header: "Recipient" },
        { key: "origin", header: "Origin" }, { key: "destination", header: "Destination" },
        { key: "currentLocation", header: "Current location" }, { key: "estimatedDelivery", header: "Estimated delivery" },
        { key: "createdAt", header: "Created" },
      ]);
      downloadCsv(`shipments-${new Date().toISOString().slice(0, 10)}.csv`, csv);
      setExportMsg(truncated ? `Exported the first ${rows.length} shipments. Narrow your filters to export the rest.` : `Exported ${rows.length} shipments.`);
    } catch (e) {
      setExportMsg((e as Error).message || "Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["shipments", page, status, search],
    queryFn: () => listShipments({ page, status, search }),
    placeholderData: keepPreviousData,
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold">Shipments</h1>
        <div className="flex gap-2">
          <button onClick={exportCsv} disabled={exporting} className="inline-flex h-11 items-center rounded-md border border-line px-4 font-medium hover:bg-steel disabled:opacity-60">{exporting ? "Exporting…" : "Export CSV"}</button>
          <Link to="/app/shipments/new" className="inline-flex h-11 items-center rounded-md bg-signal px-5 font-semibold hover:brightness-95">New shipment</Link>
        </div>
      </div>
      {exportMsg && <p role="status" className="mt-3 text-sm text-ink/70">{exportMsg}</p>}

      <form className="mt-6 grid gap-3 sm:grid-cols-[1fr_200px_auto]" onSubmit={(e) => { e.preventDefault(); setPage(1); setSearch(input.trim()); }}>
        <label className="sr-only" htmlFor="q">Search shipments</label>
        <input id="q" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Tracking number, sender or recipient" className="h-11 rounded-md border border-line px-4" />
        <label className="sr-only" htmlFor="st">Filter by status</label>
        <select id="st" value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }} className="h-11 rounded-md border border-line bg-white px-3">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}</option>)}
        </select>
        <button className="h-11 rounded-md bg-ink px-5 font-semibold text-white hover:bg-harbor">Search</button>
      </form>

      <section className="mt-6" aria-live="polite" aria-busy={isFetching}>
        {isLoading && <p className="text-ink/70">Loading shipments…</p>}
        {error && <p role="alert" className="rounded-md bg-red-50 p-4 text-red-900">{(error as Error).message}</p>}
        {data && data.items.length === 0 && (
          <div className="rounded-lg bg-steel p-8 text-center">
            <p className="font-semibold">{search || status ? "No shipments match your filters." : "No shipments yet."}</p>
            {!search && !status && <Link to="/app/shipments/new" className="mt-2 inline-block font-medium text-harbor underline">Create your first shipment</Link>}
          </div>
        )}
        {data && data.items.length > 0 && (
          <>
            <ul className="space-y-3 md:hidden">{data.items.map((s) => <Card key={s.id} s={s} />)}</ul>
            <div className="hidden overflow-x-auto rounded-lg border border-line md:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-steel text-xs">
                  <tr>{["Tracking number", "Recipient", "Route", "Status", "Created"].map((h) => <th key={h} scope="col" className="px-4 py-3 font-semibold">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {data.items.map((s) => (
                    <tr key={s.id} className="border-t border-line">
                      <td className="px-4 py-3"><Link to={`/app/shipments/${s.id}`} className="font-mono font-medium text-harbor underline">{s.trackingNumber}</Link></td>
                      <td className="px-4 py-3">{s.recipientName}</td>
                      <td className="px-4 py-3">{s.origin} → {s.destination}</td>
                      <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                      <td className="px-4 py-3 text-ink/70">{fmtDate(s.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <nav className="mt-5 flex items-center justify-between text-sm" aria-label="Pagination">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="h-11 rounded-md border border-line px-4 font-medium disabled:opacity-40">Previous</button>
              <span className="text-ink/70">Page {data.page} of {Math.max(data.totalPages, 1)} · {data.total} total</span>
              <button disabled={page >= data.totalPages} onClick={() => setPage(page + 1)} className="h-11 rounded-md border border-line px-4 font-medium disabled:opacity-40">Next</button>
            </nav>
          </>
        )}
      </section>
    </div>
  );
}
