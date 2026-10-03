import path from "path";
import dotenv from "dotenv";
import { z } from "zod";

// Root .env lives two levels above src/ (works from src/ and dist/).
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  CLIENT_URL: z.string().url().default("http://localhost:5173"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("15m"),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  const missing = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
  throw new Error(`Invalid server environment – ${missing}`);
}
export const env = parsed.data;
