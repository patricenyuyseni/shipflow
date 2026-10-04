import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, ExternalLink } from "lucide-react";
import { changeStatus, deleteShipment, getHistory, getShipment, NEXT_STATUSES } from "../../api/shipments";
import type { ShipmentStatus } from "../../api/tracking";
import { StatusBadge } from "../../components/TrackingTimeline";
import { formatDateTime, formatLongDate } from "../../utils/date";

const label = (s: string) => s.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
const dt = formatDateTime;

export default function ShipmentDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const created = (useLocation().state as { created?: boolean } | null)?.created;
  const [copied, setCopied] = useState(false);
  const [next, setNext] = useState<ShipmentStatus | "">("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const ship = useQuery({ queryKey: ["shipment", id], queryFn: () => getShipment(id) });
  const hist = useQuery({ queryKey: ["history", id], queryFn: () => getHistory(id) });

  const update = useMutation({
    mutationFn: () => changeStatus(id, { status: next as ShipmentStatus, location: location.trim() || undefined, description: description.trim() || undefined }),
    onSuccess: () => { setMsg({ ok: true, text: "Status updated." }); setNext(""); setLocation(""); setDescription(""); qc.invalidateQueries({ queryKey: ["shipment", id] }); qc.invalidateQueries({ queryKey: ["history", id] }); qc.invalidateQueries({ queryKey: ["shipments"] }); },
    onError: (e: Error) => setMsg({ ok: false, text: e.message }),
  });
  const remove = useMutation({
    mutationFn: () => deleteShipment(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["shipments"] }); navigate("/app/shipments"); },
    onError: (e: Error) => setMsg({ ok: false, text: e.message }),
  });

  if (ship.isLoading) return <p className="text-ink/70">Loading shipment…</p>;
  if (ship.error || !ship.data) return <p role="alert" className="rounded-md bg-red-50 p-4 text-red-900">{(ship.error as Error)?.message ?? "Shipment not found."}</p>;
  const s = ship.data;
  const options = NEXT_STATUSES[s.status];
  const publicUrl = `${window.location.origin}/track/${s.trackingNumber}`;

  const rows: [string, string][] = [
    ["Sender", [s.senderName, s.senderEmail, s.senderPhone].filter(Boolean).join(" · ")],
    ["Recipient", [s.recipientName, s.recipientEmail, s.recipientPhone].filter(Boolean).join(" · ")],
    ["Route", `${s.origin} → ${s.destination}`],
    ["Current location", s.currentLocation ?? "—"],
    ["Package", `${s.packageWeight} kg · ${s.packageLength} × ${s.packageWidth} × ${s.packageHeight} cm`],
    ["Estimated delivery", s.estimatedDelivery ? formatLongDate(s.estimatedDelivery) : "—"],
  ];

  return (
    <div className="max-w-4xl">
      <Link to="/app/shipments" className="text-sm font-medium text-harbor underline">All shipments</Link>
      {created && <p role="status" className="mt-4 rounded-md bg-emerald-50 p-4 text-emerald-900">Shipment created. Share the tracking number with your customer.</p>}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-mono text-2xl font-medium sm:text-3xl">{s.trackingNumber}</h1>
        <StatusBadge status={s.status} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={() => { navigator.clipboard.writeText(s.trackingNumber); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="inline-flex h-11 items-center gap-2 rounded-md border border-line px-4 text-sm font-medium"><Copy size={16} /> {copied ? "Copied" : "Copy tracking number"}</button>
        <Link to={`/app/shipments/${id}/edit`} className="inline-flex h-11 items-center rounded-md border border-line px-4 text-sm font-medium">Edit details</Link>
        <a href={publicUrl} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-2 rounded-md border border-line px-4 text-sm font-medium"><ExternalLink size={16} /> Open public page</a>
      </div>

      <dl className="mt-6 divide-y divide-line rounded-lg border border-line">
        {rows.map(([k, v]) => (
          <div key={k} className="grid gap-1 p-4 sm:grid-cols-[180px_1fr]"><dt className="text-sm text-ink/60">{k}</dt><dd className="break-words font-medium">{v}</dd></div>
        ))}
      </dl>

      <section className="mt-8 rounded-lg border border-line p-5" aria-labelledby="upd">
        <h2 id="upd" className="font-display text-xl font-bold">Update status</h2>
        {options.length === 0 ? (
          <p className="mt-2 text-ink/70">This shipment is {s.status === "DELIVERED" ? "delivered" : "cancelled"}, so its status can't change.</p>
        ) : (
          <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); setMsg(null); if (next) update.mutate(); }}>
            <div>
              <label htmlFor="ns" className="text-sm font-medium">New status</label>
              <select id="ns" value={next} onChange={(e) => setNext(e.target.value as ShipmentStatus)} className="mt-1 h-12 w-full rounded-md border border-line bg-white px-3">
                <option value="">Choose a status</option>
                {options.map((o) => <option key={o} value={o}>{label(o)}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="loc" className="text-sm font-medium">Location</label>
              <input id="loc" value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1 h-12 w-full rounded-md border border-line px-4" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="desc" className="text-sm font-medium">Note for the tracking history</label>
              <input id="desc" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} className="mt-1 h-12 w-full rounded-md border border-line px-4" />
            </div>
            <div className="sm:col-span-2">
              <button disabled={!next || update.isPending} className="h-12 rounded-md bg-ink px-6 font-semibold text-white hover:bg-harbor disabled:opacity-50">{update.isPending ? "Saving…" : "Save status"}</button>
            </div>
          </form>
        )}
        {msg && <p role={msg.ok ? "status" : "alert"} className={`mt-4 rounded-md p-3 text-sm ${msg.ok ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-900"}`}>{msg.text}</p>}
      </section>

      <section className="mt-8" aria-labelledby="hist">
        <h2 id="hist" className="font-display text-xl font-bold">History</h2>
        {hist.isLoading && <p className="mt-2 text-ink/70">Loading history…</p>}
        {hist.error && <p role="alert" className="mt-2 text-red-800">{(hist.error as Error).message}</p>}
        <ol className="mt-3 space-y-3">
          {[...(hist.data ?? [])].reverse().map((h) => (
            <li key={h.id} className="rounded-lg border border-line p-4">
              <p className="font-semibold">{h.previousStatus ? `${label(h.previousStatus)} → ${label(h.newStatus)}` : label(h.newStatus)}</p>
              <p className="text-sm text-ink/70">{[h.description, h.location].filter(Boolean).join(" – ") || "No note"}</p>
              <p className="mt-1 font-mono text-xs text-ink/50">{dt(h.createdAt)}{h.createdBy ? ` · ${h.createdBy.name}` : ""}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-10 border-t border-line pt-6">
        <button onClick={() => { if (window.confirm(`Delete ${s.trackingNumber}? This also removes its history and can't be undone.`)) remove.mutate(); }} className="h-11 rounded-md border border-red-300 px-4 text-sm font-medium text-red-800 hover:bg-red-50">Delete shipment</button>
      </div>
    </div>
  );
}
