
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
    icon: Package,
    title: "Create shipments",
    text: "Create and manage shipments with recipient details, package information, delivery addresses, and internal notes.",
  },
  {
    icon: MapPin,
    title: "Track every delivery",
    text: "Follow each shipment from creation to delivery with a clear timeline and current location.",
  },
  {
    icon: Clock3,
    title: "Real-time status",
    text: "Keep your team and customers informed with every important shipment status update.",
  },
  {
    icon: ShieldCheck,
    title: "Secure management",
    text: "Keep shipment and customer information protected with authenticated access and role-based controls.",
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
      <section className="bg-harbor text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 sm:py-28 lg:grid-cols-2">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/80">
              <Truck size={16} />
              Simple shipment management
            </div>

            <h1 className="font-display text-4xl font-bold leading-tight sm:text-6xl">
              Ship smarter.
              <br />
              Track everything.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-white/80">
              ShipFlow helps businesses create shipments, manage deliveries,
              and give customers a simple way to track every package.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/app/shipments/new"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-signal px-6 font-semibold text-ink transition hover:brightness-95"
              >
                Create a shipment
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/track"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-white/30 px-6 font-semibold transition hover:bg-white/10"
              >
                Track a package
                <Search size={18} />
              </Link>
            </div>
          </div>

          {/* Shipment preview */}
          <div className="rounded-2xl bg-white p-6 text-ink shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-5">
              <div>
                <p className="text-sm text-ink/50">Shipment</p>
                <p className="mt-1 font-display text-xl font-bold">
                  EXO-2026-000001
                </p>
              </div>

              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700">
                In transit
              </span>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-ink/50">From</p>
                  <p className="mt-1 font-semibold">Hong Kong</p>
                </div>

                <Truck className="text-harbor" size={22} />

                <div className="text-right">
                  <p className="text-ink/50">To</p>
                  <p className="mt-1 font-semibold">Berlin</p>
                </div>
              </div>

              <div className="mt-8 space-y-5">
                {statuses.map((status, index) => {
                  const completed = index < 2;
                  const current = index === 2;

                  return (
                    <div key={status} className="flex items-center gap-4">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
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

                      <div>
                        <p
                          className={`font-medium ${
                            current ? "text-harbor" : "text-ink"
                          }`}
                        >
                          {status}
                        </p>

                        {current && (
                          <p className="mt-0.5 text-sm text-ink/50">
                            Leipzig distribution hub
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tracking CTA */}
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-6xl px-5 py-12">
          <div className="rounded-2xl bg-steel p-6 sm:p-8">
            <div className="grid items-center gap-6 lg:grid-cols-[1fr_auto]">
              <div>
                <div className="flex items-center gap-2">
                  <Search size={20} className="text-harbor" />
                  <h2 className="font-display text-2xl font-bold">
                    Track your shipment
                  </h2>
                </div>

                <p className="mt-2 text-ink/65">
                  Enter your tracking number to see the latest delivery
                  status and shipment history.
                </p>
              </div>

              <Link
                to="/track"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-ink px-5 font-semibold text-white transition hover:opacity-90"
              >
                Open tracking
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
              Everything in one place
            </p>

            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              Everything you need to manage shipments
            </h2>

            <p className="mt-4 text-lg leading-8 text-ink/65">
              Keep your shipments organized from the moment they are created
              until they reach their destination.
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

      {/* How it works */}
      <section className="bg-steel">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-harbor">
              How it works
            </p>

            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              From shipment to delivery
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-ink/65">
              ShipFlow keeps the entire delivery journey organized and easy
              to understand.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-7">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-harbor font-bold text-white">
                1
              </div>

              <h3 className="mt-5 font-display text-xl font-bold">
                Create your shipment
              </h3>

              <p className="mt-3 leading-7 text-ink/65">
                Add the sender, recipient, package, and delivery information
                to create a shipment.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-7">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-harbor font-bold text-white">
                2
              </div>

              <h3 className="mt-5 font-display text-xl font-bold">
                Manage the delivery
              </h3>

              <p className="mt-3 leading-7 text-ink/65">
                Update the shipment status and location as the package moves
                through its journey.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-7">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-harbor font-bold text-white">
                3
              </div>

              <h3 className="mt-5 font-display text-xl font-bold">
                Keep customers informed
              </h3>

              <p className="mt-3 leading-7 text-ink/65">
                Customers can use their tracking number to view the current
                status and complete shipment history.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Carrier integrations */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="rounded-2xl bg-harbor p-8 text-white sm:p-12">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-wider text-white/60">
                Carrier integrations
              </p>

              <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
                Connect the carriers your business uses
              </h2>

              <p className="mt-4 leading-7 text-white/70">
                ShipFlow uses a provider-based architecture so carrier
                integrations can be added without changing your shipment and
                tracking workflow.
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
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Ready to manage your shipments?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-white/65">
            Create a shipment, manage your deliveries, and give your
            customers a simple tracking experience.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/app/shipments/new"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-signal px-6 font-semibold text-ink transition hover:brightness-95"
            >
              Create a shipment
              <ArrowRight size={18} />
            </Link>

            <Link
              to="/track"
              className="inline-flex h-12 items-center justify-center rounded-md border border-white/25 px-6 font-semibold transition hover:bg-white/10"
            >
              Track a package
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
