import { useState } from "react";
import { Link, Navigate, NavLink, Outlet, useLocation } from "react-router-dom";
import { Building2, LayoutDashboard, LogOut, Menu, PackagePlus, Truck, Users, X } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { Logo } from "./Layout";

export default function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  if (loading) return <p className="p-10 text-ink/70">Loading…</p>;
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  if (user.role !== "ADMIN") {
    return (
      <div className="mx-auto max-w-md px-6 py-24">
        <h1 className="font-display text-3xl font-bold">No access</h1>
        <p className="mt-3 text-ink/70">Your account doesn't have permission to manage shipments. Ask an administrator for access.</p>
        <button onClick={logout} className="mt-6 font-medium text-harbor underline">Sign out</button>
      </div>
    );
  }

  const item = "flex h-11 items-center gap-3 rounded-md px-3 font-medium";
  const nav = (
    <nav className="space-y-1" aria-label="Dashboard">
      <NavLink end to="/app" onClick={() => setOpen(false)} className={({ isActive }) => `${item} ${isActive ? "bg-harbor text-white" : "hover:bg-steel"}`}><LayoutDashboard size={18} /> Overview</NavLink>
      <NavLink end to="/app/shipments" onClick={() => setOpen(false)} className={({ isActive }) => `${item} ${isActive ? "bg-harbor text-white" : "hover:bg-steel"}`}><Truck size={18} /> Shipments</NavLink>
      <NavLink to="/app/shipments/new" onClick={() => setOpen(false)} className={({ isActive }) => `${item} ${isActive ? "bg-harbor text-white" : "hover:bg-steel"}`}><PackagePlus size={18} /> New shipment</NavLink>
      <NavLink to="/app/users" onClick={() => setOpen(false)} className={({ isActive }) => `${item} ${isActive ? "bg-harbor text-white" : "hover:bg-steel"}`}><Users size={18} /> Users</NavLink>
      <NavLink to="/app/carriers" onClick={() => setOpen(false)} className={({ isActive }) => `${item} ${isActive ? "bg-harbor text-white" : "hover:bg-steel"}`}><Building2 size={18} /> Carriers</NavLink>
    </nav>
  );

  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <aside className="hidden border-r border-line p-4 md:block">
        <Link to="/" className="mb-8 block px-2" aria-label="ShipFlow home"><Logo /></Link>
        {nav}
      </aside>
      <div className="min-w-0">
        <header className="flex h-16 items-center justify-between border-b border-line px-4 sm:px-6">
          <button className="grid h-11 w-11 place-items-center md:hidden" aria-label="Open menu" onClick={() => setOpen(true)}><Menu /></button>
          <span className="hidden text-sm text-ink/60 md:block">Signed in as {user.email}</span>
          <button onClick={logout} className="inline-flex h-11 items-center gap-2 rounded-md px-3 text-sm font-medium hover:bg-steel"><LogOut size={16} /> Sign out</button>
        </header>
        <main className="p-4 sm:p-6"><Outlet /></main>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setOpen(false)} />
          <div className="relative h-full w-72 max-w-[85%] bg-white p-4">
            <div className="mb-6 flex items-center justify-between px-2"><Logo /><button className="grid h-11 w-11 place-items-center" aria-label="Close menu" onClick={() => setOpen(false)}><X /></button></div>
            {nav}
          </div>
        </div>
      )}
    </div>
  );
}
