
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  MapPin,
  Package,
  Search,
  ShieldCheck,
  Truck,
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Easy tracking",
    text: "Enter your tracking number and instantly see the latest status of your shipment.",
  },
  {
    icon: MapPin,
    title: "Know where it is",
    text: "See the latest shipment location, origin, destination, and estimated delivery.",
  },
  {
    icon: Clock3,
    title: "Follow every update",
    text: "See a complete timeline of important shipment events from pickup to delivery.",
  },
  {
    icon: ShieldCheck,
    title: "Secure information",
    text: "Your shipment information is protected while public tracking only shows customer-safe details.",
  },
];

const statuses = [
  "Created",
  "Picked up",
  "In transit",
  "Out for delivery",
  "Delivered",
];

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-harbor text-white">
        <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-signal/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 py-20 sm:py-28 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/85 backdrop-blur">
              <Truck size={16} />
              Simple, reliable shipment tracking
            </div>

            <h1 className="max-w-3xl font-display text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Know where your shipment is.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-white/75 sm:text-xl">
              Track your package from pickup to delivery with a clear,
              simple view of its current status and journey.
            </p>

            <div className="mt-9">
              <Link
                to="/track"
                className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-signal px-7 text-base font-bold text-ink shadow-lg transition hover:brightness-95 sm:w-auto"
              >
                Track your shipment
                <Search size={19} />
              </Link>
            </div>

            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/65">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 size={16} className="text-signal" />
                No account required
              </span>

              <span className="inline-flex items-center gap-2">
                <CheckCircle2 size={16} className="text-signal" />
                Real-time status
              </span>

              <span className="inline-flex items-center gap-2">
                <CheckCircle2 size={16} className="text-signal" />
                Mobile friendly
              </span>
            </div>
          </div>

          {/* Shipment preview */}
          <div className="rounded-3xl border border-white/10 bg-white p-6 text-ink shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4 border-b border-line pb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">
                  Tracking
                </p>

                <p className="mt-1 font-mono text-lg font-bold text-harbor">
                  SF-7K3M92PX
                </p>
              </div>

              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                In transit
              </span>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-ink/45">
                  From
                </p>

                <p className="mt-1 font-semibold">
                  New York
                </p>
              </div>

              <div className="flex flex-1 items-center justify-center px-4">
                <div className="h-px flex-1 bg-line" />
                <Truck
                  size={20}
                  className="mx-3 shrink-0 text-harbor"
                />
                <div className="h-px flex-1 bg-line" />
              </div>

              <div className="text-right">
                <p className="text-xs font-medium text-ink/45">
                  To
                </p>

                <p className="mt-1 font-semibold">
                  Berlin
                </p>
              </div>
            </div>

            <div className="mt-8">
              {statuses.map((status, index) => {
                const completed = index < 2;
                const current = index === 2;

                return (
                  <div
                    key={status}
                    className="relative flex gap-4 pb-5 last:pb-0"
                  >
                    {index < statuses.length - 1 && (
                      <div
                        className={`absolute left-[15px] top-8 h-[calc(100%-8px)] w-px ${
                          index < 2
                            ? "bg-harbor"
                            : "bg-line"
                        }`}
                      />
                    )}

                    <div
                      className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        completed || current
                          ? "bg-harbor text-white"
                          : "bg-steel text-ink/30"
                      }`}
                    >
                      {completed ? (
                        <CheckCircle2 size={17} />
                      ) : (
                        <span className="text-xs font-bold">
                          {index + 1}
                        </span>
                      )}
                    </div>

                    <div className="pt-1">
                      <p
                        className={`text-sm font-semibold ${
                          current
                            ? "text-harbor"
                            : "text-ink"
                        }`}
                      >
                        {status}
                      </p>

                      {current && (
                        <p className="mt-1 text-xs text-ink/50">
                          Leipzig distribution hub
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 rounded-xl bg-steel p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink/45">
                Estimated delivery
              </p>

              <p className="mt-1 font-display text-lg font-bold">
                October 7, 2026
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tracking CTA */}
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <div className="rounded-2xl border border-line bg-steel p-6 sm:p-8">
            <div className="grid items-center gap-7 lg:grid-cols-[1fr_auto]">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-harbor text-white">
                    <Search size={19} />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-harbor">
                      Shipment tracking
                    </p>

                    <h2 className="font-display text-2xl font-bold">
                      Where is your package?
                    </h2>
                  </div>
                </div>

                <p className="mt-3 max-w-2xl text-ink/65">
                  Use your tracking number to see the latest shipment
                  status, location, estimated delivery, and tracking
                  history.
                </p>
              </div>

              <Link
                to="/track"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-ink px-6 font-semibold text-white transition hover:bg-harbor"
              >
                Track shipment
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-wider text-harbor">
              Built for customers
            </p>

            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              Everything you need to follow your delivery
            </h2>

            <p className="mt-4 text-lg leading-8 text-ink/65">
              ShipFlow gives customers a clear view of their shipment
              without making tracking complicated.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-line bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-steel text-harbor">
                    <Icon size={22} />
                  </div>

                  <h3 className="mt-5 font-display text-xl font-bold">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-ink/65">
                    {feature.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How tracking works */}
      <section className="bg-steel">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-harbor">
              Simple tracking
            </p>

            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              Follow your shipment in three steps
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-ink/65">
              No complicated setup. No customer account required.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <Step
              number="1"
              icon={<Package size={20} />}
              title="Get your tracking number"
              text="Your sender or shipping team provides you with a unique ShipFlow tracking number."
            />

            <Step
              number="2"
              icon={<Search size={20} />}
              title="Enter it on ShipFlow"
              text="Open the tracking page and enter your tracking number to find your shipment."
            />

            <Step
              number="3"
              icon={<MapPin size={20} />}
              title="Follow the journey"
              text="See the latest status, location, estimated delivery, and complete tracking history."
            />
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-steel text-harbor">
                <ShieldCheck size={25} />
              </div>

              <p className="mt-6 text-sm font-bold uppercase tracking-wider text-harbor">
                Secure tracking
              </p>

              <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
                See what you need.
                <br />
                Nothing you don't.
              </h2>

              <p className="mt-5 max-w-xl text-lg leading-8 text-ink/65">
                Public tracking is designed to show useful delivery
                information while keeping administrative and sensitive
                account information private.
              </p>
            </div>

            <div className="rounded-2xl border border-line p-6 sm:p-8">
              <div className="space-y-5">
                <TrustItem
                  title="No account required"
                  text="Track a shipment directly with its tracking number."
                />

                <TrustItem
                  title="Clear shipment status"
                  text="Understand exactly where your package is in its journey."
                />

                <TrustItem
                  title="Customer-safe information"
                  text="Public tracking does not expose administrative data."
                />

                <TrustItem
                  title="Mobile friendly"
                  text="Track shipments easily from your phone, tablet, or computer."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Carrier infrastructure */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-5 pb-20">
          <div className="rounded-3xl bg-harbor p-8 text-white sm:p-12">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-wider text-white/55">
                Shipping infrastructure
              </p>

              <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
                One simple tracking experience
              </h2>

              <p className="mt-4 leading-7 text-white/70">
                ShipFlow is designed with a provider-based architecture
                so shipping carriers can be integrated behind one
                consistent tracking experience.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {["DHL", "FedEx", "UPS", "USPS"].map((carrier) => (
                <span
                  key={carrier}
                  className="rounded-lg border border-white/15 bg-white/10 px-5 py-3 font-semibold"
                >
                  {carrier}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-6xl px-5 py-20 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
            <Search size={25} />
          </div>

          <h2 className="mt-6 font-display text-3xl font-bold sm:text-4xl">
            Ready to find your shipment?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-white/60">
            Enter your tracking number and see where your package is
            right now.
          </p>

          <div className="mt-8">
            <Link
              to="/track"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-signal px-7 font-bold text-ink transition hover:brightness-95"
            >
              Track your shipment
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Step({
  number,
  icon,
  title,
  text,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-7">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-harbor font-bold text-white">
          {number}
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-steel text-harbor">
          {icon}
        </div>
      </div>

      <h3 className="mt-6 font-display text-xl font-bold">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-ink/65">
        {text}
      </p>
    </div>
  );
}

function TrustItem({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-4">
      <CheckCircle2
        size={21}
        className="mt-0.5 shrink-0 text-harbor"
      />

      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-ink/60">
          {text}
        </p>
      </div>
    </div>
  );
}
