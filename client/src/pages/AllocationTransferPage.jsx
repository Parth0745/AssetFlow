import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/client";
import SectionCard from "../components/SectionCard";
import SimpleTable from "../components/SimpleTable";

export default function AllocationTransferPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ asset: "", employee: "", department: "", expectedReturnDate: "" });
  const [transfer, setTransfer] = useState({ asset: "", fromEmployee: "", toEmployee: "", reason: "" });
  const [error, setError] = useState("");

  const { data: org } = useQuery({ queryKey: ["org"], queryFn: async () => (await api.get("/org")).data });
  const { data: assets } = useQuery({ queryKey: ["assets-select"], queryFn: async () => (await api.get("/assets", { params: { limit: 100 } })).data });
  const { data: allocations = [] } = useQuery({ queryKey: ["allocations"], queryFn: async () => (await api.get("/allocations")).data });
  const { data: transferRequests = [] } = useQuery({
    queryKey: ["transferRequests"],
    queryFn: async () => (await api.get("/allocations/transfer-requests")).data
  });

  const createAllocation = useMutation({
    mutationFn: async () => api.post("/allocations", form),
    onSuccess: () => {
      setError("");
      qc.invalidateQueries({ queryKey: ["allocations"] });
    },
    onError: (err) => setError(err.response?.data?.message || "Allocation failed")
  });

  const returnAsset = useMutation({
    mutationFn: async (id) => api.post(`/allocations/${id}/return`, { conditionNotes: "Returned in checked condition" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allocations"] })
  });

  const createTransferRequest = useMutation({
    mutationFn: async () => api.post("/allocations/transfer-requests", transfer),
    onSuccess: () => {
      setTransfer({ asset: "", fromEmployee: "", toEmployee: "", reason: "" });
      qc.invalidateQueries({ queryKey: ["allocations"] });
      qc.invalidateQueries({ queryKey: ["transferRequests"] });
    }
  });

  const updateTransfer = useMutation({
    mutationFn: async ({ id, status }) => api.patch(`/allocations/transfer-requests/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allocations"] });
      qc.invalidateQueries({ queryKey: ["transferRequests"] });
    }
  });

  return (
    <div className="space-y-4">
      <SectionCard title="Allocation Form">
        <div className="grid gap-2 md:grid-cols-5">
          <select value={form.asset} onChange={(e) => setForm({ ...form, asset: e.target.value })} className="rounded-lg border p-2">
            <option value="">Asset</option>
            {(assets?.items || []).map((a) => <option key={a._id} value={a._id}>{a.name} ({a.assetTag})</option>)}
          </select>
          <select value={form.employee} onChange={(e) => setForm({ ...form, employee: e.target.value })} className="rounded-lg border p-2">
            <option value="">Employee</option>
            {(org?.employees || []).map((e) => <option key={e._id} value={e._id}>{e.firstName} {e.lastName}</option>)}
          </select>
          <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="rounded-lg border p-2">
            <option value="">Department</option>
            {(org?.departments || []).map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
          <input type="date" value={form.expectedReturnDate} onChange={(e) => setForm({ ...form, expectedReturnDate: e.target.value })} className="rounded-lg border p-2" />
          <button onClick={() => createAllocation.mutate()} className="rounded-lg bg-brand-600 px-3 py-2 font-semibold text-white">Allocate</button>
        </div>
        {error && <p className="mt-2 text-sm text-rose-500">{error}</p>}
      </SectionCard>

      <SectionCard title="Active Allocation & Return Workflow">
        <SimpleTable
          columns={[
            { key: "asset", label: "Asset", render: (r) => r.asset?.name },
            { key: "employee", label: "Employee", render: (r) => `${r.employee?.firstName || ""} ${r.employee?.lastName || ""}` },
            { key: "expectedReturnDate", label: "Expected Return", render: (r) => new Date(r.expectedReturnDate).toLocaleDateString() },
            { key: "status", label: "Status" },
            { key: "action", label: "Action", render: (r) => r.status === "Active" ? <button className="rounded bg-slate-800 px-2 py-1 text-xs text-white" onClick={() => returnAsset.mutate(r._id)}>Return</button> : "-" }
          ]}
          rows={allocations}
        />
      </SectionCard>

      <SectionCard title="Transfer Workflow (Requested -> Approved -> Rejected -> Completed)">
        <div className="mb-3 grid gap-2 md:grid-cols-5">
          <select value={transfer.asset} onChange={(e) => setTransfer({ ...transfer, asset: e.target.value })} className="rounded-lg border p-2">
            <option value="">Asset</option>
            {(assets?.items || []).map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
          </select>
          <select value={transfer.fromEmployee} onChange={(e) => setTransfer({ ...transfer, fromEmployee: e.target.value })} className="rounded-lg border p-2">
            <option value="">From Employee</option>
            {(org?.employees || []).map((e) => <option key={e._id} value={e._id}>{e.firstName} {e.lastName}</option>)}
          </select>
          <select value={transfer.toEmployee} onChange={(e) => setTransfer({ ...transfer, toEmployee: e.target.value })} className="rounded-lg border p-2">
            <option value="">To Employee</option>
            {(org?.employees || []).map((e) => <option key={e._id} value={e._id}>{e.firstName} {e.lastName}</option>)}
          </select>
          <input value={transfer.reason} onChange={(e) => setTransfer({ ...transfer, reason: e.target.value })} placeholder="Reason" className="rounded-lg border p-2" />
          <button onClick={() => createTransferRequest.mutate()} className="rounded-lg bg-slate-800 px-3 py-2 text-white">Request Transfer</button>
        </div>

        <SimpleTable
          columns={[
            { key: "asset", label: "Asset", render: (r) => r.asset?.name },
            { key: "fromEmployee", label: "From", render: (r) => `${r.fromEmployee?.firstName || ""} ${r.fromEmployee?.lastName || ""}` },
            { key: "toEmployee", label: "To", render: (r) => `${r.toEmployee?.firstName || ""} ${r.toEmployee?.lastName || ""}` },
            { key: "status", label: "Status" },
            {
              key: "workflow",
              label: "Actions",
              render: (r) => (
                <div className="flex gap-1">
                  <button className="rounded bg-emerald-600 px-2 py-1 text-[10px] text-white" onClick={() => updateTransfer.mutate({ id: r._id, status: "Approved" })}>Approve</button>
                  <button className="rounded bg-rose-600 px-2 py-1 text-[10px] text-white" onClick={() => updateTransfer.mutate({ id: r._id, status: "Rejected" })}>Reject</button>
                  <button className="rounded bg-brand-600 px-2 py-1 text-[10px] text-white" onClick={() => updateTransfer.mutate({ id: r._id, status: "Completed" })}>Complete</button>
                </div>
              )
            }
          ]}
          rows={transferRequests}
        />
      </SectionCard>
    </div>
  );
}
