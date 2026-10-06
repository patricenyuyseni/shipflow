
import { useForm, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type {
  Currency,
  NewShipment,
  PaymentStatus,
  ServiceLevel,
} from "../api/shipments";

const req = z.string().trim().min(1, "Required");

const opt = z.string().trim().optional();

const optEmail = z
  .string()
  .trim()
  .email("Enter a valid email")
  .optional()
  .or(z.literal(""));

const dim = z
  .number({ invalid_type_error: "Enter a number" })
  .positive("Must be greater than 0");

const schema = z.object({
  senderName: req,
  senderEmail: optEmail,
  senderPhone: opt,

  recipientName: req,
  recipientEmail: optEmail,
  recipientPhone: opt,

  origin: req,
  destination: req,

  packageWeight: dim,
  packageLength: dim,
  packageWidth: dim,
  packageHeight: dim,

  estimatedDelivery: opt,

  serviceLevel: z.enum([
    "STANDARD",
    "EXPRESS",
    "PRIORITY",
  ]),

  shippingCost: z
    .number({ invalid_type_error: "Enter a valid price" })
    .min(0, "Shipping cost cannot be negative"),

  currency: z.enum(["USD", "EUR"]),

  paymentStatus: z.enum([
    "PENDING",
    "PAID",
    "UNPAID",
  ]),
});

export type ShipmentFormValues = z.infer<typeof schema>;

type FormApi = ReturnType<
  typeof useForm<ShipmentFormValues>
>;

function Field({
  label,
  name,
  form,
  type = "text",
  number = false,
  hint,
}: {
  label: string;
  name: Path<ShipmentFormValues>;
  form: FormApi;
  type?: string;
  number?: boolean;
  hint?: string;
}) {
  const err = form.formState.errors[name];

  return (
    <div>
      <label
        htmlFor={name}
        className="text-sm font-medium"
      >
        {label}
      </label>

      <input
        id={name}
        type={type}
        step={number ? "any" : undefined}
        inputMode={
          number ? "decimal" : undefined
        }
        aria-invalid={!!err}
        className="mt-1 h-12 w-full rounded-md border border-line px-4"
        {...form.register(
          name,
          number
            ? {
                valueAsNumber: true,
              }
            : undefined,
        )}
      />

      {hint && !err && (
        <p className="mt-1 text-xs text-ink/55">
          {hint}
        </p>
      )}

      {err && (
        <p className="mt-1 text-sm text-red-700">
          {err.message as string}
        </p>
      )}
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

export default function ShipmentForm({
  defaultValues,
  submitLabel,
  pendingLabel,
  pending,
  error,
  onSubmit,
}: Props) {
  const form = useForm<ShipmentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      serviceLevel: "STANDARD",
      shippingCost: 0,
      currency: "USD",
      paymentStatus: "PENDING",
      ...defaultValues,
    },
  });

  const submit = form.handleSubmit((values) => {
    const clean = Object.fromEntries(
      Object.entries(values).filter(
        ([, value]) =>
          value !== "" &&
          value !== undefined,
      ),
    );

    onSubmit({
      ...clean,
      estimatedDelivery:
        values.estimatedDelivery
          ? new Date(
              values.estimatedDelivery,
            ).toISOString()
          : undefined,
      serviceLevel:
        values.serviceLevel as ServiceLevel,
      shippingCost: values.shippingCost,
      currency: values.currency as Currency,
      paymentStatus:
        values.paymentStatus as PaymentStatus,
    } as NewShipment);
  });

  const group =
    "rounded-lg border border-line p-5";

  return (
    <form onSubmit={submit} noValidate>
      {error && (
        <p
          role="alert"
          className="mt-5 rounded-md bg-red-50 p-4 text-red-900"
        >
          {error}
        </p>
      )}

      <fieldset
        className={`${group} mt-6`}
      >
        <legend className="px-2 font-semibold">
          Sender
        </legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Name"
            name="senderName"
            form={form}
          />

          <Field
            label="Email"
            name="senderEmail"
            type="email"
            form={form}
          />

          <Field
            label="Phone"
            name="senderPhone"
            type="tel"
            form={form}
          />

          <Field
            label="Origin"
            name="origin"
            form={form}
            hint="City and country"
          />
        </div>
      </fieldset>

      <fieldset
        className={`${group} mt-5`}
      >
        <legend className="px-2 font-semibold">
          Recipient
        </legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Name"
            name="recipientName"
            form={form}
          />

          <Field
            label="Email"
            name="recipientEmail"
            type="email"
            form={form}
          />

          <Field
            label="Phone"
            name="recipientPhone"
            type="tel"
            form={form}
          />

          <Field
            label="Destination"
            name="destination"
            form={form}
            hint="City and country"
          />
        </div>
      </fieldset>

      <fieldset
        className={`${group} mt-5`}
      >
        <legend className="px-2 font-semibold">
          Package
        </legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Weight (kg)"
            name="packageWeight"
            number
            form={form}
          />

          <Field
            label="Length (cm)"
            name="packageLength"
            number
            form={form}
          />

          <Field
            label="Width (cm)"
            name="packageWidth"
            number
            form={form}
          />

          <Field
            label="Height (cm)"
            name="packageHeight"
            number
            form={form}
          />

          <Field
            label="Estimated delivery"
            name="estimatedDelivery"
            type="date"
            form={form}
          />
        </div>
      </fieldset>

      <fieldset
        className={`${group} mt-5`}
      >
        <legend className="px-2 font-semibold">
          Shipping & payment
        </legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="serviceLevel"
              className="text-sm font-medium"
            >
              Service level
            </label>

            <select
              id="serviceLevel"
              className="mt-1 h-12 w-full rounded-md border border-line bg-white px-4"
              {...form.register("serviceLevel")}
            >
              <option value="STANDARD">
                Standard
              </option>

              <option value="EXPRESS">
                Express
              </option>

              <option value="PRIORITY">
                Priority
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="shippingCost"
              className="text-sm font-medium"
            >
              Shipping cost
            </label>

            <input
              id="shippingCost"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              className="mt-1 h-12 w-full rounded-md border border-line px-4"
              {...form.register(
                "shippingCost",
                {
                  valueAsNumber: true,
                },
              )}
            />

            {form.formState.errors
              .shippingCost && (
              <p className="mt-1 text-sm text-red-700">
                {
                  form.formState.errors
                    .shippingCost.message
                }
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="currency"
              className="text-sm font-medium"
            >
              Currency
            </label>

            <select
              id="currency"
              className="mt-1 h-12 w-full rounded-md border border-line bg-white px-4"
              {...form.register("currency")}
            >
              <option value="USD">
                USD — US Dollar
              </option>

              <option value="EUR">
                EUR — Euro
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="paymentStatus"
              className="text-sm font-medium"
            >
              Payment status
            </label>

            <select
              id="paymentStatus"
              className="mt-1 h-12 w-full rounded-md border border-line bg-white px-4"
              {...form.register(
                "paymentStatus",
              )}
            >
              <option value="PENDING">
                Pending
              </option>

              <option value="PAID">
                Paid
              </option>

              <option value="UNPAID">
                Unpaid
              </option>
            </select>
          </div>
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={pending}
        className="mt-6 h-12 w-full rounded-md bg-ink px-8 font-semibold text-white hover:bg-harbor disabled:opacity-60 sm:w-auto"
      >
        {pending
          ? pendingLabel
          : submitLabel}
      </button>
    </form>
  );
}
