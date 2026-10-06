
import { Route, Routes, Link } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Track from "./pages/Track";
import Login from "./pages/Login";
import AdminLayout from "./components/AdminLayout";
import Overview from "./pages/app/Overview";
import EditShipment from "./pages/app/EditShipment";
import Carriers from "./pages/app/Carriers";
import Users from "./pages/app/Users";
import Shipments from "./pages/app/Shipments";
import NewShipment from "./pages/app/NewShipment";
import ShipmentDetail from "./pages/app/ShipmentDetail";
import ShipmentReceipt from "./pages/app/ShipmentReceipt";

function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-6 py-32">
      <h1 className="font-display text-4xl font-bold">Page not found</h1>
      <p className="mt-3 text-ink/70">
        This page doesn't exist yet.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block font-medium text-harbor underline"
      >
        Back to home
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public customer-facing pages */}
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="track" element={<Track />} />
        <Route path="track/:trackingNumber" element={<Track />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Authentication */}
      <Route path="login" element={<Login />} />

      {/* Admin-only application */}
      <Route path="app" element={<AdminLayout />}>
        <Route index element={<Overview />} />

        <Route path="users" element={<Users />} />

        <Route path="shipments" element={<Shipments />} />
        <Route path="shipments/new" element={<NewShipment />} />
        <Route path="shipments/:id" element={<ShipmentDetail />} />
        <Route path="shipments/:id/receipt" element={<ShipmentReceipt />} />
        <Route path="shipments/:id/edit" element={<EditShipment />} />

        <Route path="carriers" element={<Carriers />} />
      </Route>
    </Routes>
  );
}
