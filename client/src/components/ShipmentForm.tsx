import { useForm, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { NewShipment } from "../api/shipments";

const req = z.string().trim().min(1, "Required");
const opt = z.string().trim().optional();
const optEmail = z.string().trim().email("Enter a valid email").optional().or(z.literal(""));
const dim = z.number({ invalid_type_error: "Enter a number" }).positive("Must be greater than 0");

const schema = z.object({
  senderName: req, senderEmail: optEmail, senderPhone: opt,
  recipientName: req, recipientEmail: optEmail, recipientPhone: opt,
  origin: req, destination: req,
  packageWeight: dim, packageLength: dim, packageWidth: dim, packageHeight: dim,
  estimatedDelivery: opt,
});
export type ShipmentFormValues = z.infer<typeof schema>;
type FormApi = ReturnType<typeof useForm<ShipmentFormValues>>;

function Field({ label, name, form, type = "text", number = false, hint }: { label: string; name: Path<ShipmentFormValues>; form: FormApi; type?: string; number?: boolean; hint?: string }) {
  const err = form.formState.errors[name];
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium">{label}</label>
      <input id={name} type={type} step={number ? "any" : undefined} inputMode={number ? "decimal" : undefined} aria-invalid={!!err}
        className="mt-1 h-12 w-full rounded-md border border-line px-4" {...form.register(name, number ? { valueAsNumber: true } : undefined)} />
      {hint && !err && <p className="mt-1 text-xs text-ink/55">{hint}</p>}
      {err && <p className="mt-1 text-sm text-red-700">{err.message as string}</p>}
    </div>
  );
}

interface Props {
  defaultValues?: Partial<ShipmentFormValues>;
  submitLabel: string;
  pendingLabel: string;
  pending: boolean;
  error: string | null;
  onSubmit: (payload: NewShipment) => void;
}

export default function ShipmentForm({ defaultValues, submitLabel, pendingLabel, pending, error, onSubmit }: Props) {
  const form = useForm<ShipmentFormValues>({ resolver: zodResolver(schema), defaultValues });

  const submit = form.handleSubmit((v) => {
    const clean = Object.fromEntries(Object.entries(v).filter(([, val]) => val !== "" && val !== undefined));
    onSubmit({ ...clean, estimatedDelivery: v.estimatedDelivery ? new Date(v.estimatedDelivery).toISOString() : undefined } as NewShipment);
  });

  const group = "rounded-lg border border-line p-5";
  return (
    <form onSubmit={submit} noValidate>
      {error && <p role="alert" className="mt-5 rounded-md bg-red-50 p-4 text-red-900">{error}</p>}
      <fieldset className={`${group} mt-6`}>
        <legend className="px-2 font-semibold">Sender</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" name="senderName" form={form} />
          <Field label="Email" name="senderEmail" type="email" form={form} />
          <Field label="Phone" name="senderPhone" type="tel" form={form} />
          <Field label="Origin" name="origin" form={form} hint="City and country" />
        </div>
      </fieldset>
      <fieldset className={`${group} mt-5`}>
        <legend className="px-2 font-semibold">Recipient</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" name="recipientName" form={form} />
          <Field label="Email" name="recipientEmail" type="email" form={form} />
          <Field label="Phone" name="recipientPhone" type="tel" form={form} />
          <Field label="Destination" name="destination" form={form} hint="City and country" />
        </div>
      </fieldset>
      <fieldset className={`${group} mt-5`}>
        <legend className="px-2 font-semibold">Package</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Weight (kg)" name="packageWeight" number form={form} />
          <Field label="Length (cm)" name="packageLength" number form={form} />
          <Field label="Width (cm)" name="packageWidth" number form={form} />
          <Field label="Height (cm)" name="packageHeight" number form={form} />
          <Field label="Estimated delivery" name="estimatedDelivery" type="date" form={form} />
        </div>
      </fieldset>
      <button disabled={pending} className="mt-6 h-12 w-full rounded-md bg-ink px-8 font-semibold text-white hover:bg-harbor disabled:opacity-60 sm:w-auto">
        {pending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
}
