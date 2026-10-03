import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../auth/AuthContext";
import { Logo } from "../components/Layout";

const schema = z.object({ email: z.string().email("Enter a valid email address"), password: z.string().min(1, "Enter your password") });
type Form = z.infer<typeof schema>;

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? "/app";
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema) });

  if (user) return <Navigate to="/app" replace />;

  const onSubmit = handleSubmit(async (v) => {
    setError(null);
    try { await login(v.email, v.password); navigate(from, { replace: true }); }
    catch (e) { setError((e as Error).message); }
  });

  const input = "mt-1 h-12 w-full rounded-md border border-line px-4";
  return (
    <div className="mx-auto max-w-sm px-5 py-16">
      <Link to="/" aria-label="ShipFlow home"><Logo /></Link>
      <h1 className="mt-8 font-display text-3xl font-bold">Sign in</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
        {error && <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-900">{error}</p>}
        <div>
          <label htmlFor="email" className="text-sm font-medium">Email</label>
          <input id="email" type="email" autoComplete="email" className={input} {...register("email")} />
          {errors.email && <p className="mt-1 text-sm text-red-700">{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="password" className="text-sm font-medium">Password</label>
          <input id="password" type="password" autoComplete="current-password" className={input} {...register("password")} />
          {errors.password && <p className="mt-1 text-sm text-red-700">{errors.password.message}</p>}
        </div>
        <button disabled={isSubmitting} className="h-12 w-full rounded-md bg-ink font-semibold text-white hover:bg-harbor disabled:opacity-60">{isSubmitting ? "Signing in…" : "Sign in"}</button>
      </form>
    </div>
  );
}
