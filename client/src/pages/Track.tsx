
import { useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Loader2,
  MapPin,
  Package,
  Search,
  ShieldCheck,
} from "lucide-react";
import { z } from "zod";
import { getTracking } from "../api/tracking";
import TrackingTimeline, {
  StatusBadge,
} from "../components/TrackingTimeline";
import { formatLongDate } from "../utils/date";

const schema = z
  .string()
  .trim()
  .regex(
    /^[A-Za-z0-9-]{6,40}$/,
    "Enter a valid tracking number, for example SF-ABC12345.",
  );

function Detail({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-line bg-white p-4">
      <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-ink/50">
        {icon}
        {label}
      </dt>
      <dd className="mt-2 break-words font-semibold text-ink">
        {value}
      </dd>
    </div>
  );
}

function TrackingEmptyState() {
  return (
    <div className="mt-10 rounded-xl border border-line bg-steel/40 p-8 text-center sm:p-12">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
        <Package size={25} className="text-harbor" />
      </div>

      <h2 className="mt-5 font-display text-2xl font-bold">
        Enter your tracking number
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink/65">
        Your shipment status, current location, estimated delivery,
        and tracking history will appear here.
      </p>
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

    if (!parsed.success) {
      setFormError(parsed.error.issues[0].message);
      return;
    }

    setFormError(null);
    navigate(`/track/${parsed.data.toUpperCase()}`);
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-6 sm:py-16">
      {/* Hero */}
      <section className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-steel">
          <Package size={26} className="text-harbor" />
        </div>

        <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-harbor">
          Shipment tracking
        </p>

        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Where is your package?
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-ink/65 sm:text-lg">
          Enter your tracking number to see the latest shipment status,
          location, estimated delivery, and complete tracking history.
        </p>
      </section>

      {/* Search */}
      <section className="mx-auto mt-8 max-w-3xl">
        <form
          onSubmit={submit}
          noValidate
          className="rounded-xl border border-line bg-white p-3 shadow-sm sm:p-4"
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="min-w-0 flex-1">
              <label
                htmlFor="tracking-number"
                className="sr-only"
              >
                Tracking number
              </label>

              <input
                id="tracking-number"
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  if (formError) setFormError(null);
                }}
                placeholder="Enter your tracking number"
                autoComplete="off"
                spellCheck={false}
                aria-invalid={!!formError}
                aria-describedby={
                  formError ? "tracking-error" : undefined
                }
                className="h-12 w-full rounded-lg border border-line bg-steel/30 px-4 font-mono text-base uppercase outline-none transition focus:border-harbor focus:bg-white"
              />
            </div>

            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-ink px-6 font-semibold text-white transition hover:bg-harbor active:scale-[0.99]"
            >
              <Search size={18} />
              Track package
            </button>
          </div>

          {formError && (
            <p
              id="tracking-error"
              role="alert"
              className="mt-2 px-1 text-sm font-medium text-red-700"
            >
              {formError}
            </p>
          )}
        </form>

        <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-ink/55">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck size={14} />
            No account required
          </span>

          <span className="inline-flex items-center gap-1.5">
            <Clock3 size={14} />
            Updated tracking information
          </span>

          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 size={14} />
            Secure lookup
          </span>
        </div>
      </section>

      {/* Results */}
      <section className="mt-12" aria-live="polite">
        {isFetching && (
          <div className="rounded-xl border border-line bg-white p-10 text-center shadow-sm">
            <Loader2
              className="mx-auto animate-spin text-harbor"
              size={28}
            />

            <p className="mt-4 font-semibold">
              Looking up your shipment…
            </p>

            <p className="mt-1 text-sm text-ink/60">
              Please wait while we retrieve the latest tracking
              information.
            </p>
          </div>
        )}

        {!isFetching && error && (
          <div
            role="alert"
            className="mx-auto max-w-2xl rounded-xl border border-red-200 bg-red-50 p-6 text-center"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white">
              <Search size={20} className="text-red-700" />
            </div>

            <h2 className="mt-4 font-display text-xl font-bold text-red-950">
              Shipment not found
            </h2>

            <p className="mt-2 text-sm leading-6 text-red-900/75">
              {(error as Error).message ||
                "We couldn't find a shipment with that tracking number."}
            </p>

            <button
              type="button"
              onClick={() => {
                setValue("");
                setFormError(null);
                navigate("/track");
              }}
              className="mt-5 rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-harbor"
            >
              Try another number
            </button>
          </div>
        )}

        {!isFetching && !error && !trackingNumber && (
          <TrackingEmptyState />
        )}

        {!isFetching && data && (
          <article className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
            {/* Status header */}
            <div className="border-b border-line bg-steel/30 p-5 sm:p-7">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink/50">
                    Tracking number
                  </p>

                  <p className="mt-1 font-mono text-xl font-bold tracking-wide sm:text-2xl">
                    {data.trackingNumber}
                  </p>
                </div>

                <div className="self-start sm:self-auto">
                  <StatusBadge status={data.status} />
                </div>
              </div>
            </div>

            {/* Route */}
            <div className="border-b border-line p-5 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink/50">
                Shipment route
              </p>

              <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-harbor" />
                    <p className="text-xs font-medium text-ink/50">
                      FROM
                    </p>
                  </div>

                  <p className="mt-2 break-words font-semibold">
                    {data.origin}
                  </p>
                </div>

                <ArrowRight
                  size={22}
                  className="text-ink/35"
                />

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-signal" />
                    <p className="text-xs font-medium text-ink/50">
                      TO
                    </p>
                  </div>

                  <p className="mt-2 break-words font-semibold">
                    {data.destination}
                  </p>
                </div>
              </div>
            </div>

            {/* Shipment details */}
            <div className="grid grid-cols-1 gap-3 border-b border-line p-5 sm:grid-cols-2 sm:p-7">
              <Detail
                label="Current location"
                value={
                  data.currentLocation ??
                  "Not available yet"
                }
                icon={<MapPin size={14} />}
              />

              <Detail
                label="Estimated delivery"
                value={
                  data.estimatedDelivery
                    ? formatLongDate(
                        data.estimatedDelivery,
                      )
                    : "To be confirmed"
                }
                icon={<Clock3 size={14} />}
              />

              <Detail
                label="Shipment status"
                value={data.status.replace(/_/g, " ")}
                icon={<CheckCircle2 size={14} />}
              />
            </div>

            {/* Timeline */}
            <div className="p-5 sm:p-7">
              <div className="mb-6">
                <h2 className="font-display text-2xl font-bold">
                  Tracking history
                </h2>

                <p className="mt-1 text-sm text-ink/60">
                  Follow every recorded update for this shipment.
                </p>
              </div>

              <TrackingTimeline
                status={data.status}
                history={data.history}
              />
            </div>
          </article>
        )}
      </section>

      {/* Trust footer */}
      <section className="mx-auto mt-10 max-w-3xl rounded-xl border border-line bg-steel/30 p-6 text-center sm:p-8">
        <ShieldCheck
          size={24}
          className="mx-auto text-harbor"
        />

        <h2 className="mt-3 font-display text-xl font-bold">
          Your tracking information is protected
        </h2>

        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-ink/60">
          ShipFlow only displays customer-safe shipment information
          on this public tracking page. No account is required to
          check your delivery status.
        </p>
      </section>
    </div>
  );
}
