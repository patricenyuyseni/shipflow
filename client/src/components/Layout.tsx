import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 font-display text-xl font-bold ${light ? "text-white" : "text-ink"}`}>
      <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
        <rect width="28" height="28" rx="6" fill="#0b3c5d" />
        <path d="M6 18h9a4 4 0 0 0 0-8H9" stroke="#f2c230" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <circle cx="21" cy="19" r="2.2" fill="#fff" />
      </svg>
      ShipFlow
    </span>
  );
}

const links = [
  { to: "/#rates", label: "Rates" },
  { to: "/#tracking", label: "Tracking" },
  { to: "/#customs", label: "Customs" },
  { to: "/#teams", label: "Who it's for" },
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { user } = useAuth();
  const account = user ? { to: "/app", label: "Dashboard" } : { to: "/login", label: "Sign in" };
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link to="/" aria-label="ShipFlow home"><Logo /></Link>
          <nav className="hidden items-center gap-7 text-sm font-medium md:flex" aria-label="Main">
            {links.map((l) => (
              <a key={l.to} href={l.to} className="hover:text-harbor">{l.label}</a>
            ))}
            <Link to={account.to} className="hover:text-harbor">{account.label}</Link>
            <NavLink to="/track" className={({ isActive }) => `rounded-md px-4 py-2 font-semibold ${isActive || pathname.startsWith("/track") ? "bg-ink text-white" : "bg-signal text-ink hover:brightness-95"}`}>
              Track a package
            </NavLink>
          </nav>
          <button className="grid h-11 w-11 place-items-center md:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open && (
          <nav className="border-t border-line bg-white px-5 pb-5 md:hidden" aria-label="Mobile">
            {links.map((l) => (
              <a key={l.to} href={l.to} onClick={() => setOpen(false)} className="block border-b border-steel py-3.5 font-medium">{l.label}</a>
            ))}
            <Link to={account.to} onClick={() => setOpen(false)} className="block border-b border-steel py-3.5 font-medium">{account.label}</Link>
            <Link to="/track" onClick={() => setOpen(false)} className="mt-4 block rounded-md bg-signal py-3.5 text-center font-semibold">Track a package</Link>
          </nav>
        )}
      </header>
      <main className="flex-1"><Outlet /></main>
      <footer className="bg-ink text-white/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 text-sm sm:flex-row sm:items-center sm:justify-between">
          <Logo light />
          <p>© {new Date().getFullYear()} ShipFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
