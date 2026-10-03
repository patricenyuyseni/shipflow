import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../auth/AuthContext";
import { listUsers, setRole, type AccountUser } from "../../api/users";

export default function Users() {
  const { user: me } = useAuth();
  const qc = useQueryClient();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const { data, isLoading, error } = useQuery({ queryKey: ["users"], queryFn: listUsers });

  const m = useMutation({
    mutationFn: (v: { u: AccountUser; role: "ADMIN" | "USER" }) => setRole(v.u.id, v.role),
    onSuccess: (u) => { setMsg({ ok: true, text: `${u.email} is now ${u.role === "ADMIN" ? "an administrator" : "a standard user"}.` }); qc.invalidateQueries({ queryKey: ["users"] }); },
    onError: (e: Error) => setMsg({ ok: false, text: e.message }),
  });

  function change(u: AccountUser, role: "ADMIN" | "USER") {
    setMsg(null);
    const verb = role === "ADMIN" ? "give administrator access to" : "remove administrator access from";
    if (window.confirm(`Do you want to ${verb} ${u.email}?`)) m.mutate({ u, role });
  }

  const select = (u: AccountUser) => (
    <>
      <label className="sr-only" htmlFor={`r-${u.id}`}>Role for {u.email}</label>
      <select id={`r-${u.id}`} value={u.role} disabled={u.id === me?.id || m.isPending} onChange={(e) => { const r = e.target.value as "ADMIN" | "USER"; if (r !== u.role) change(u, r); }}
        className="h-11 rounded-md border border-line bg-white px-3 disabled:opacity-60" title={u.id === me?.id ? "You can't change your own role" : undefined}>
        <option value="USER">User</option>
        <option value="ADMIN">Administrator</option>
      </select>
    </>
  );

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-3xl font-bold">Users</h1>
      <p className="mt-2 text-ink/70">Administrators can manage shipments and users. Standard users can sign in but can't manage shipments.</p>
      {msg && <p role={msg.ok ? "status" : "alert"} className={`mt-4 rounded-md p-3 text-sm ${msg.ok ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-900"}`}>{msg.text}</p>}
      {isLoading && <p className="mt-4 text-ink/70">Loading users…</p>}
      {error && <p role="alert" className="mt-4 rounded-md bg-red-50 p-4 text-red-900">{(error as Error).message}</p>}
      {data && (
        <>
          <ul className="mt-6 space-y-3 md:hidden">
            {data.map((u) => (
              <li key={u.id} className="rounded-lg border border-line p-4">
                <p className="font-semibold">{u.name}{u.id === me?.id && <span className="ml-2 text-xs font-normal text-ink/60">(you)</span>}</p>
                <p className="break-all text-sm text-ink/70">{u.email}</p>
                <div className="mt-3">{select(u)}</div>
              </li>
            ))}
          </ul>
          <div className="mt-6 hidden overflow-x-auto rounded-lg border border-line md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-steel text-xs"><tr>{["Name", "Email", "Joined", "Role"].map((h) => <th key={h} scope="col" className="px-4 py-3 font-semibold">{h}</th>)}</tr></thead>
              <tbody>
                {data.map((u) => (
                  <tr key={u.id} className="border-t border-line">
                    <td className="px-4 py-3 font-medium">{u.name}{u.id === me?.id && <span className="ml-2 text-xs font-normal text-ink/60">(you)</span>}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3 text-ink/70">{new Date(u.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}</td>
                    <td className="px-4 py-3">{select(u)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
