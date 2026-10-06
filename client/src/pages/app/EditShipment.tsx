
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getShipment,
  updateShipment,
} from "../../api/shipments";
import ShipmentForm from "../../components/ShipmentForm";

export default function EditShipment() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [error, setError] = useState<string | null>(
    null,
  );

  const {
    data: s,
    isLoading,
    error: loadError,
  } = useQuery({
    queryKey: ["shipment", id],
    queryFn: () => getShipment(id),
  });

  const m = useMutation({
    mutationFn: (
      payload: Parameters<typeof updateShipment>[1],
    ) => updateShipment(id, payload),

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["shipment", id],
      });

      qc.invalidateQueries({
        queryKey: ["shipments"],
      });

      qc.invalidateQueries({
        queryKey: ["stats"],
      });

      navigate(`/app/shipments/${id}`);
    },

    onError: (e: Error) => {
      setError(e.message);
    },
  });

  if (isLoading) {
    return (
      <p className="text-ink/70">
        Loading shipment…
      </p>
    );
  }

  if (loadError || !s) {
    return (
      <p
        role="alert"
        className="rounded-md bg-red-50 p-4 text-red-900"
      >
        {(loadError as Error)?.message ??
          "Shipment not found."}
      </p>
    );
  }

  return (
    <div className="max-w-3xl">
      <Link
        to={`/app/shipments/${id}`}
        className="text-sm font-medium text-harbor underline"
      >
        Back to {s.trackingNumber}
      </Link>

      <h1 className="mt-3 font-display text-3xl font-bold">
        Edit shipment
      </h1>

      <p className="mt-2 text-ink/70">
        Update shipment information, pricing,
        service level, or payment status. To change
        delivery status, use “Update status” on the
        shipment page so the change is recorded in
        tracking history.
      </p>

      <ShipmentForm
        submitLabel="Save changes"
        pendingLabel="Saving…"
        pending={m.isPending}
        error={error}
        defaultValues={{
          senderName: s.senderName,
          senderEmail: s.senderEmail ?? "",
          senderPhone: s.senderPhone ?? "",

          recipientName: s.recipientName,
          recipientEmail:
            s.recipientEmail ?? "",
          recipientPhone:
            s.recipientPhone ?? "",

          origin: s.origin,
          destination: s.destination,

          packageWeight: s.packageWeight,
          packageLength: s.packageLength,
          packageWidth: s.packageWidth,
          packageHeight: s.packageHeight,

          estimatedDelivery:
            s.estimatedDelivery
              ? s.estimatedDelivery.slice(0, 10)
              : "",

          serviceLevel: s.serviceLevel,
          shippingCost: s.shippingCost,
          currency: s.currency,
          paymentStatus: s.paymentStatus,
        }}
        onSubmit={(payload) => {
          setError(null);
          m.mutate(payload);
        }}
      />
    </div>
  );
}
