import { Check, CircleAlert, CircleX } from "lucide-react";
import type { ShipmentStatus, TrackingEvent } from "../api/tracking";

export const STEPS: { status: ShipmentStatus; label: string }[] = [
  { status: "CREATED", label: "Shipment created" },
  { status: "PICKED_UP", label: "Picked up" },
  { status: "IN_TRANSIT", label: "In transit" },
  { status: "OUT_FOR_DELIVERY", label: "Out for delivery" },
  { status: "DELIVERED", label: "Delivered" },
];

export const STATUS_STYLE: Record<ShipmentStatus, string> = {
  CREATED: "bg-steel text-ink",
  PICKED_UP: "bg-sky-100 text-sky-900",
  IN_TRANSIT: "bg-harbor text-white",
  OUT_FOR_DELIVERY: "bg-signal text-ink",
  DELIVERED: "bg-emerald-100 text-emerald-900",
  CANCELLED: "bg-red-100 text-red-900",
};

export function StatusBadge({ status }: { status: ShipmentStatus }) {
  const label = status === "CANCELLED" ? "Cancelled" : STEPS.find((s) => s.status === status)?.label ?? status;
  return <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${STATUS_STYLE[status]}`}>{label}</span>;
}

const fmt = (iso: string) => new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

export default function TrackingTimeline({ status, history }: { status: ShipmentStatus; history: TrackingEvent[] }) {
  const cancelled = status === "CANCELLED";
  const reached = STEPS.findIndex((s) => s.status === status);
  const byStatus = new Map(history.map((h) => [h.newStatus, h]));
  return (
    <ol className="relative">
      {STEPS.map((step, i) => {
        const done = !cancelled && i <= reached;
        const current = !cancelled && i === reached;
        const ev = byStatus.get(step.status);
        return (
          <li key={step.status} className="relative flex gap-4 pb-8 last:pb-0" aria-current={current ? "step" : undefined}>
            {i < STEPS.length - 1 && <span aria-hidden className={`absolute left-[15px] top-8 h-[calc(100%-2rem)] w-0.5 ${done && i < reached ? "bg-harbor" : "bg-line"}`} />}
            <span className={`z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 ${done ? "border-harbor bg-harbor text-white" : "border-line bg-white text-transparent"} ${current ? "ring-4 ring-signal/60" : ""}`}>
              <Check size={16} />
            </span>
            <div className="min-w-0">
              <p className={`font-semibold ${done ? "text-ink" : "text-ink/45"}`}>{step.label}</p>
              {ev && (
                <p className="mt-0.5 text-sm text-ink/70">
                  {[ev.description, ev.location].filter(Boolean).join(" – ")}
                  <span className="block font-mono text-xs text-ink/50">{fmt(ev.createdAt)}</span>
                </p>
              )}
            </div>
          </li>
        );
      })}
      {cancelled && (
        <li className="mt-6 flex items-center gap-3 rounded-md bg-red-50 p-4 text-red-900">
          <CircleX /> This shipment was cancelled.
        </li>
      )}
    </ol>
  );
}

export function ExceptionNote({ text }: { text: string }) {
  return <p className="flex items-center gap-2 text-sm text-red-800"><CircleAlert size={16} />{text}</p>;
}
