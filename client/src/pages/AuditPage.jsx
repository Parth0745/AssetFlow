import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/client";
import SectionCard from "../components/SectionCard";
import SimpleTable from "../components/SimpleTable";

export default function AuditPage() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [selectedAudit, setSelectedAudit] = useState("");
  const [asset, setAsset] = useState("");
  const [result, setResult] = useState("Verified");

  const { data: audits = [] } = useQuery({ queryKey: ["audits"], queryFn: async () => (await api.get("/audits")).data });
  const { data: assets } = useQuery({ queryKey: ["assets-audit"], queryFn: async () => (await api.get("/assets", { params: { limit: 100 } })).data });

  const create = useMutation({ mutationFn: async () => api.post("/audits", { name }), onSuccess: () => qc.invalidateQueries({ queryKey: ["audits"] }) });
  const verify = useMutation({
    mutationFn: async () => api.post(`/audits/${selectedAudit}/verify`, { asset, result, notes: "Physical check" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["audits"] })
  });
  const close = useMutation({ mutationFn: async (id) => api.post(`/audits/${id}/close`), onSuccess: () => qc.invalidateQueries({ queryKey: ["audits"] }) });

  return (
    <div className="space-y-4">
      <SectionCard title="Create Audit Cycle">
        <div className="flex gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Audit cycle name" className="w-full rounded-lg border p-2" />
          <button onClick={() => create.mutate()} className="rounded-lg bg-brand-600 px-3 py-2 text-white">Create</button>
        </div>
      </SectionCard>

      <SectionCard title="Verification Screen">
        <div className="grid gap-2 md:grid-cols-4">
          <select value={selectedAudit} onChange={(e) => setSelectedAudit(e.target.value)} className="rounded-lg border p-2">
            <option value="">Audit cycle</option>
            {audits.map((a) => <option key={a._id} value={a._id}>{a.name} ({a.status})</option>)}
          </select>
          <select value={asset} onChange={(e) => setAsset(e.target.value)} className="rounded-lg border p-2">
            <option value="">Asset</option>
            {(assets?.items || []).map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
          </select>
          <select value={result} onChange={(e) => setResult(e.target.value)} className="rounded-lg border p-2">
            <option>Verified</option><option>Missing</option><option>Damaged</option>
          </select>
          <button onClick={() => verify.mutate()} className="rounded-lg bg-slate-800 px-3 py-2 text-white">Submit Verification</button>
        </div>
      </SectionCard>

      <SectionCard title="Audit History & Close Audit">
        <SimpleTable
          columns={[
            { key: "name", label: "Cycle" },
            { key: "status", label: "Status" },
            { key: "discrepancySummary", label: "Discrepancy" },
            { key: "actions", label: "Actions", render: (r) => r.status === "Open" ? <button className="rounded bg-rose-600 px-2 py-1 text-xs text-white" onClick={() => close.mutate(r._id)}>Close</button> : "Locked" }
          ]}
          rows={audits}
        />
      </SectionCard>
    </div>
  );
}
