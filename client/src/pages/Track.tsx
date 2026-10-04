import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search } from "lucide-react";
import { z } from "zod";
import { getTracking } from "../api/tracking";
import TrackingTimeline, { StatusBadge } from "../components/TrackingTimeline";
import { formatLongDate } from "../utils/date";

const schema = z.string().trim().regex(/^[A-Za-z0-9-]{6,40}$/, "Enter a valid tracking number, for example EXO-2026-000001.");

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-ink/55">{label}</dt>
      <dd className="mt-0.5 font-semibold break-words">{value}</dd>
    </div>
  );
}

export default function Track() {
  const { trackingNumber } = useParams();
  const navigate = useNavigate();
  const [value, setValue] = useState(trackingNumber ?? "");
  const [formError, setFormError] = useState<string | null>(null);

  const { data, isFetching, error } = useQuery({
    queryKey: ["tracking", trackingNumber],
    queryFn: () => getTracking(trackingNumber!),
    enabled: !!trackingNumber,
    retry: false,
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(value);
    if (!parsed.success) return setFormError(parsed.error.issues[0].message);
    setFormError(null);
    navigate(`/track/${parsed.data.toUpperCase()}`);
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <h1 className="font-display text-4xl font-bold sm:text-5xl">Track a package</h1>
      <p className="mt-3 text-ink/70">No account needed. Enter the tracking number from your confirmation email.</p>

      <form onSubmit={submit} className="mt-8 flex flex-col gap-3 sm:flex-row" noValidate>
        <div className="flex-1">
          <label htmlFor="tn" className="sr-only">Tracking number</label>
          <input id="tn" value={value} onChange={(e) => setValue(e.target.value)} placeholder="EXO-2026-000001" autoComplete="off"
            aria-invalid={!!formError} aria-describedby={formError ? "tn-err" : undefined}
            className="h-12 w-full rounded-md border border-line px-4 font-mono text-base" />
          {formError && <p id="tn-err" className="mt-2 text-sm text-red-700">{formError}</p>}
        </div>
        <button type="submit" className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-ink px-6 font-semibold text-white hover:bg-harbor">
          <Search size={18} /> Track package
        </button>
      </form>

      <section className="mt-10" aria-live="polite">
        {isFetching && <p className="flex items-center gap-2 text-ink/70"><Loader2 className="animate-spin" size={18} /> Looking up your shipment…</p>}
        {!isFetching && error && (
          <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-5 text-red-900">
            <p className="font-semibold">{(error as Error).message}</p>
            <p className="mt-1 text-sm">Check the number and try again.</p>
          </div>
        )}
        {!isFetching && !error && !trackingNumber && (
          <p className="rounded-md bg-steel p-5 text-ink/70">Your shipment's progress will appear here.</p>
        )}
        {!isFetching && data && (
          <article className="rounded-lg border border-line">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-5">
              <div>
                <p className="text-xs font-medium text-ink/55">Tracking number</p>
                <p className="font-mono text-lg font-medium">{data.trackingNumber}</p>
              </div>
              <StatusBadge status={data.status} />
            </div>
            <dl className="grid grid-cols-1 gap-5 border-b border-line p-5 sm:grid-cols-2">
              <Detail label="From" value={data.origin} />
              <Detail label="To" value={data.destination} />
              <Detail label="Current location" value={data.currentLocation ?? "Not available yet"} />
              <Detail label="Estimated delivery" value={data.estimatedDelivery ? formatLongDate(data.estimatedDelivery) : "To be confirmed"} />
            </dl>
            <div className="p-5 sm:p-6"><TrackingTimeline status={data.status} history={data.history} /></div>
          </article>
        )}
      </section>
    </div>
  );
}
