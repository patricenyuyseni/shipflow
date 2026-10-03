import type { ZodTypeAny, z } from "zod";
import { AppError } from "../utils/errors";

export function parse<T extends ZodTypeAny>(schema: T, data: unknown): z.infer<T> {
  const r = schema.safeParse(data);
  if (!r.success) {
    throw new AppError(400, "VALIDATION_ERROR", "Invalid request data", r.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })));
  }
  return r.data;
}
