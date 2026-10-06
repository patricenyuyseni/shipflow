
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import QRCode from "qrcode";
import { ArrowLeft, Printer } from "lucide-react";
import { getShipment } from "../../api/shipments";
import { formatDateTime, formatLongDate } from "../../utils/date";
import { StatusBadge } from "../../components/TrackingTimeline";

const PUBLIC_APP_URL = "https://shipflow-gray.vercel.app";

export default function ShipmentReceipt() {
  const { id = "" } = useParams();
  const [qrCode, setQrCode] = useState("");

  const shipment = useQuery({
    queryKey: ["shipment", id],
    queryFn: () => getShipment(id),
  });

  const s = shipment.data;

  useEffect(() => {
    if (!s) return;

    const trackingUrl = `${PUBLIC_APP_URL}/track/${encodeURIComponent(
      s.trackingNumber,
    )}`;

    QRCode.toDataURL(trackingUrl, {
      width: 180,
      margin: 2,
      errorCorrectionLevel: "M",
    })
      .then(setQrCode)
      .catch(() => setQrCode(""));
  }, [s]);

  if (shipment.isLoading) {
    return (
      <div className="mx-auto max-w-4xl py-12">
        <p className="text-ink/70">Loading receipt…</p>
      </div>
    );
  }

  if (shipment.error || !s) {
    return (
      <div className="mx-auto max-w-4xl py-12">
        <p className="rounded-lg bg-red-50 p-5 text-red-900">
          {(shipment.error as Error)?.message ??
            "Shipment not found."}
        </p>
      </div>
    );
  }

  const printReceipt = () => window.print();

  const serviceLabel = {
    STANDARD: "Standard",
    EXPRESS: "Express",
    PRIORITY: "Priority",
  }[s.serviceLevel];

  const paymentLabel = {
    PENDING: "Pending",
    PAID: "Paid",
    UNPAID: "Unpaid",
  }[s.paymentStatus];

  const formattedCost = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: s.currency,
    minimumFractionDigits: 2,
  }).format(s.shippingCost);

  return (
    <div className="min-h-screen bg-slate-100 py-6 sm:py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link
            to={`/app/shipments/${s.id}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-harbor hover:underline"
          >
            <ArrowLeft size={16} />
            Back to shipment
          </Link>

          <button
            type="button"
            onClick={printReceipt}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-ink px-5 text-sm font-semibold text-white hover:bg-harbor"
          >
            <Printer size={17} />
            Print / Save PDF
          </button>
        </div>

        <article className="overflow-hidden rounded-2xl bg-white shadow-xl print:rounded-none print:shadow-none">
          <header className="border-b border-line px-6 py-7 sm:px-10">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <p className="font-display text-3xl font-black tracking-tight text-ink">
                  ShipFlow
                </p>

                <p className="mt-1 text-sm text-ink/60">
                  Shipment receipt
                </p>

                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/50">
                    Receipt number
                  </p>

                  <p className="mt-1 font-mono text-sm font-bold text-ink">
                    {s.receiptNumber ?? "Not assigned"}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/50">
                  Tracking number
                </p>

                <p className="mt-1 font-mono text-xl font-bold text-harbor">
                  {s.trackingNumber}
                </p>

                <div className="mt-2 flex justify-end">
                  <StatusBadge status={s.status} />
                </div>
              </div>
            </div>
          </header>

          <div className="px-6 py-7 sm:px-10">
            <div className="grid gap-5 sm:grid-cols-3">
              <Info
                label="Created"
                value={formatDateTime(s.createdAt)}
              />

              <Info
                label="Estimated delivery"
                value={
                  s.estimatedDelivery
                    ? formatLongDate(s.estimatedDelivery)
                    : "Not specified"
                }
              />

              <Info
                label="Current location"
                value={s.currentLocation ?? "Not specified"}
              />
            </div>

            <section className="mt-8 rounded-xl border border-line">
              <div className="border-b border-line px-5 py-4">
                <h2 className="font-display text-lg font-bold">
                  Shipping & payment
                </h2>
              </div>

              <div className="grid gap-0 sm:grid-cols-4">
                <Info
                  label="Service level"
                  value={serviceLabel}
                />

                <Info
                  label="Shipping cost"
                  value={formattedCost}
                />

                <Info
                  label="Currency"
                  value={s.currency}
                />

                <Info
                  label="Payment status"
                  value={paymentLabel}
                />
              </div>
            </section>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <Party
                title="Sender"
                name={s.senderName}
                email={s.senderEmail}
                phone={s.senderPhone}
                location={s.origin}
              />

              <Party
                title="Recipient"
                name={s.recipientName}
                email={s.recipientEmail}
                phone={s.recipientPhone}
                location={s.destination}
              />
            </div>

            <section className="mt-8 rounded-xl border border-line">
              <div className="border-b border-line px-5 py-4">
                <h2 className="font-display text-lg font-bold">
                  Package information
                </h2>
              </div>

              <div className="grid gap-0 sm:grid-cols-4">
                <Info
                  label="Weight"
                  value={`${s.packageWeight} kg`}
                />

                <Info
                  label="Length"
                  value={`${s.packageLength} cm`}
                />

                <Info
                  label="Width"
                  value={`${s.packageWidth} cm`}
                />

                <Info
                  label="Height"
                  value={`${s.packageHeight} cm`}
                />
              </div>
            </section>

            <section className="mt-8 border-t border-line pt-8">
              <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-center sm:text-left">
                {qrCode ? (
                  <img
                    src={qrCode}
                    alt={`QR code for tracking ${s.trackingNumber}`}
                    className="h-36 w-36 rounded-lg border border-line"
                  />
                ) : null}

                <div>
                  <h2 className="font-display text-xl font-bold">
                    Track this shipment
                  </h2>

                  <p className="mt-2 max-w-md text-sm leading-6 text-ink/65">
                    Scan the QR code to open the public ShipFlow
                    tracking page. Customers can follow the shipment
                    without accessing the administrative dashboard.
                  </p>

                  <p className="mt-3 break-all font-mono text-xs text-ink/50">
                    {PUBLIC_APP_URL}/track/{s.trackingNumber}
                  </p>
                </div>
              </div>
            </section>
          </div>

          <footer className="border-t border-line bg-slate-50 px-6 py-6 text-center sm:px-10">
            <p className="text-sm font-semibold text-ink">
              ShipFlow
            </p>

            <p className="mt-1 text-xs text-ink/55">
              Professional shipment management and tracking
            </p>
          </footer>
        </article>

        <div className="mt-5 text-center text-xs text-ink/45 print:hidden">
          Receipt generated from the ShipFlow administration system.
        </div>
      </div>

      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 12mm;
          }

          body {
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-ink">
        {value}
      </p>
    </div>
  );
}

function Party({
  title,
  name,
  email,
  phone,
  location,
}: {
  title: string;
  name: string;
  email: string | null;
  phone: string | null;
  location: string;
}) {
  return (
    <section className="rounded-xl border border-line p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">
        {title}
      </p>

      <h2 className="mt-2 font-display text-lg font-bold">
        {name}
      </h2>

      <div className="mt-3 space-y-1 text-sm text-ink/65">
        {email && <p className="break-all">{email}</p>}
        {phone && <p>{phone}</p>}
        <p className="font-medium text-ink">{location}</p>
      </div>
    </section>
  );
}
