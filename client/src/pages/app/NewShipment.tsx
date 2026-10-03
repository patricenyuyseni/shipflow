import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createShipment } from "../../api/shipments";
import ShipmentForm from "../../components/ShipmentForm";

export default function NewShipment() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const m = useMutation({
    mutationFn: createShipment,
    onSuccess: (s) => { qc.invalidateQueries({ queryKey: ["shipments"] }); qc.invalidateQueries({ queryKey: ["stats"] }); navigate(`/app/shipments/${s.id}`, { state: { created: true } }); },
    onError: (e: Error) => setError(e.message),
  });

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl font-bold">New shipment</h1>
      <p className="mt-2 text-ink/70">The tracking number is generated automatically when you save.</p>
      <ShipmentForm submitLabel="Create shipment" pendingLabel="Creating…" pending={m.isPending} error={error} onSubmit={(p) => { setError(null); m.mutate(p); }} />
    </div>
  );
}
