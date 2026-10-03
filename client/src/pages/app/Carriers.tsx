import { useQuery } from "@tanstack/react-query";
import { listProviders } from "../../api/providers";

export default function Carriers() {
  const { data, isLoading, error } = useQuery({ queryKey: ["providers"], queryFn: listProviders });
  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-3xl font-bold">Carriers</h1>
      <p className="mt-2 max-w-2xl text-ink/70">Carrier connections are optional. ShipFlow's own shipments and tracking work without them. API keys are set in the server's environment, never in the browser.</p>
      {isLoading && <p className="mt-4 text-ink/70">Loading carriers…</p>}
      {error && <p role="alert" className="mt-4 rounded-md bg-red-50 p-4 text-red-900">{(error as Error).message}</p>}
      {data && (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {data.map((p) => (
            <li key={p.name} className="rounded-lg border border-line p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-xl font-bold">{p.name}</h2>
                <span className={`rounded-full px-3 py-1 text-sm font-semibold ${p.configured ? "bg-emerald-100 text-emerald-900" : "bg-steel text-ink"}`}>{p.configured ? "API key found" : "Not configured"}</span>
              </div>
              <p className="mt-2 text-sm text-ink/70">
                {p.configured ? "A key is set on the server. Live rates and carrier tracking aren't switched on yet." : `Set the ${p.name.toUpperCase()}_API_KEY variable on the server to prepare this carrier.`}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
