import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/client";
import SectionCard from "../components/SectionCard";

const columns = ["Pending", "Approved", "Technician Assigned", "In Progress", "Resolved", "Rejected"];

export default function MaintenancePage() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ asset: "", issue: "", priority: "Medium" });
  const { data: assets } = useQuery({ queryKey: ["assets-maint"], queryFn: async () => (await api.get("/assets", { params: { limit: 100 } })).data });
  const { data: maintenance = [] } = useQuery({ queryKey: ["maintenance"], queryFn: async () => (await api.get("/maintenance")).data });

  const raise = useMutation({
    mutationFn: async () => api.post("/maintenance", form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["maintenance"] });
      setForm({ asset: "", issue: "", priority: "Medium" });
    }
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }) => api.patch(`/maintenance/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["maintenance"] })
  });

  return (
    <div className="space-y-4">
      <SectionCard title="Raise Maintenance Request">
        <div className="grid gap-2 md:grid-cols-4">
          <select value={form.asset} onChange={(e) => setForm({ ...form, asset: e.target.value })} className="rounded-lg border p-2">
            <option value="">Asset</option>
            {(assets?.items || []).map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
          </select>
          <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="rounded-lg border p-2">
            <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
          </select>
          <input value={form.issue} onChange={(e) => setForm({ ...form, issue: e.target.value })} placeholder="Issue details" className="rounded-lg border p-2" />
          <button onClick={() => raise.mutate()} className="rounded-lg bg-brand-600 px-3 py-2 text-white">Raise Request</button>
        </div>
      </SectionCard>

      <SectionCard title="Maintenance Kanban">
        <div className="grid gap-3 xl:grid-cols-6">
          {columns.map((col) => (
            <div key={col} className="rounded-xl bg-slate-100 p-3 dark:bg-slate-900">
              <h4 className="mb-2 text-sm font-bold">{col}</h4>
              <div className="space-y-2">
                {maintenance.filter((m) => m.status === col).map((m) => (
                  <div key={m._id} className="rounded-lg border border-slate-300 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800">
                    <p className="font-semibold">{m.asset?.name}</p>
                    <p>{m.issue}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {columns.filter((c) => c !== col).slice(0, 2).map((target) => (
                        <button key={target} onClick={() => setStatus.mutate({ id: m._id, status: target })} className="rounded bg-slate-700 px-2 py-1 text-[10px] text-white">
                          {target}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
