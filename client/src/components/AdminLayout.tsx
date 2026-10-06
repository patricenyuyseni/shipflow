import { useState } from "react";
import {
  Building2,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  PackagePlus,
  Truck,
  Users,
  X,
} from "lucide-react";
import {
  Link,
  Navigate,
  NavLink,
  Outlet,
  useLocation,
} from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Logo } from "./Layout";

export default function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-steel/30">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-line border-t-harbor" />
          <p className="mt-3 text-sm text-ink/60">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }

  if (user.role !== "ADMIN") {
    return (
      <div className="grid min-h-screen place-items-center bg-steel/30 px-6">
        <div className="w-full max-w-md rounded-2xl border border-line bg-white p-8 text-center shadow-sm">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-red-50 text-red-700">
            <Building2 size={24} />
          </div>

          <h1 className="mt-5 font-display text-2xl font-bold">
            Admin access required
          </h1>

          <p className="mt-3 text-sm leading-6 text-ink/60">
            Your account does not have permission to manage shipments. Please
            contact an administrator if you need access.
          </p>

          <button
            onClick={logout}
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-ink px-5 text-sm font-semibold text-white hover:bg-harbor"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </div>
    );
  }

  const item =
    "group flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition";

  const nav = (
    <nav className="space-y-1" aria-label="Admin dashboard">
      <NavLink
        end
        to="/app"
        onClick={() => setOpen(false)}
        className={({ isActive }) =>
          `${item} ${
            isActive
              ? "bg-harbor text-white shadow-sm"
              : "text-ink/70 hover:bg-steel hover:text-ink"
          }`
        }
      >
        <LayoutDashboard size={18} />
        <span className="flex-1">Dashboard</span>
        <ChevronRight
          size={15}
          className="opacity-0 transition group-hover:opacity-50"
        />
      </NavLink>

      <NavLink
        end
        to="/app/shipments"
        onClick={() => setOpen(false)}
        className={({ isActive }) =>
          `${item} ${
            isActive
              ? "bg-harbor text-white shadow-sm"
              : "text-ink/70 hover:bg-steel hover:text-ink"
          }`
        }
      >
        <Truck size={18} />
        <span className="flex-1">Shipments</span>
        <ChevronRight
          size={15}
          className="opacity-0 transition group-hover:opacity-50"
        />
      </NavLink>

      <NavLink
        to="/app/shipments/new"
        onClick={() => setOpen(false)}
        className={({ isActive }) =>
          `${item} ${
            isActive
              ? "bg-harbor text-white shadow-sm"
              : "text-ink/70 hover:bg-steel hover:text-ink"
          }`
        }
      >
        <PackagePlus size={18} />
        <span className="flex-1">New shipment</span>
        <ChevronRight
          size={15}
          className="opacity-0 transition group-hover:opacity-50"
        />
      </NavLink>

      <div className="my-5 border-t border-line" />

      <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-ink/40">
        Management
      </p>

      <NavLink
        to="/app/users"
        onClick={() => setOpen(false)}
        className={({ isActive }) =>
          `${item} ${
            isActive
              ? "bg-harbor text-white shadow-sm"
              : "text-ink/70 hover:bg-steel hover:text-ink"
          }`
        }
      >
        <Users size={18} />
        <span className="flex-1">Users</span>
        <ChevronRight
          size={15}
          className="opacity-0 transition group-hover:opacity-50"
        />
      </NavLink>

      <NavLink
        to="/app/carriers"
        onClick={() => setOpen(false)}
        className={({ isActive }) =>
          `${item} ${
            isActive
              ? "bg-harbor text-white shadow-sm"
              : "text-ink/70 hover:bg-steel hover:text-ink"
          }`
        }
      >
        <Building2 size={18} />
        <span className="flex-1">Carriers</span>
        <ChevronRight
          size={15}
          className="opacity-0 transition group-hover:opacity-50"
        />
      </NavLink>
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#f7f9fa] md:grid md:grid-cols-[250px_1fr]">
      {/* Desktop sidebar */}
      <aside className="hidden border-r border-line bg-white md:flex md:flex-col">
        <div className="border-b border-line px-5 py-5">
          <Link
            to="/"
            className="block"
            aria-label="ShipFlow home"
          >
            <Logo />
          </Link>

          <div className="mt-5 rounded-xl bg-steel/70 px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/45">
              Workspace
            </p>
            <p className="mt-1 text-sm font-semibold">Operations</p>
          </div>
        </div>

        <div className="flex-1 px-4 py-5">
          {nav}
        </div>

        <div className="border-t border-line p-4">
          <div className="mb-3 min-w-0 px-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/40">
              Signed in
            </p>
            <p className="mt-1 truncate text-sm font-medium">
              {user.email}
            </p>
          </div>

          <button
            onClick={logout}
            className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-ink/65 transition hover:bg-steel hover:text-ink"
          >
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-white/95 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              className="grid h-10 w-10 place-items-center rounded-lg hover:bg-steel md:hidden"
              aria-label="Open menu"
              onClick={() => setOpen(true)}
            >
              <Menu size={21} />
            </button>

            <div className="hidden sm:block">
              <p className="text-xs text-ink/45">ShipFlow</p>
              <p className="text-sm font-semibold">Admin workspace</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden max-w-56 truncate text-sm text-ink/55 lg:block">
              {user.email}
            </span>

            <div className="grid h-9 w-9 place-items-center rounded-full bg-harbor text-xs font-bold text-white">
              {user.email.charAt(0).toUpperCase()}
            </div>

            <button
              onClick={logout}
              className="hidden h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-ink/60 hover:bg-steel hover:text-ink sm:inline-flex"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile sidebar */}
      {open && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Admin menu"
        >
          <div
            className="absolute inset-0 bg-ink/55"
            onClick={() => setOpen(false)}
          />

          <div className="relative flex h-full w-80 max-w-[88%] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-5 py-5">
              <Logo />

              <button
                className="grid h-10 w-10 place-items-center rounded-lg hover:bg-steel"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              >
                <X size={21} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-5">
              {nav}
            </div>

            <div className="border-t border-line p-4">
              <p className="truncate px-2 text-sm font-medium">
                {user.email}
              </p>

              <button
                onClick={logout}
                className="mt-3 flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium hover:bg-steel"
              >
                <LogOut size={17} />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
