import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import QRCode from "react-qr-code";
import api from "../api/client";
import SectionCard from "../components/SectionCard";
import SimpleTable from "../components/SimpleTable";

export default function AssetsPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState([]);
  const [qrTag, setQrTag] = useState("");
  const [qrResult, setQrResult] = useState(null);
  const [form, setForm] = useState({
    name: "",
    serialNumber: "",
    category: "",
    department: "",
    condition: "Good",
    status: "Available",
    purchaseDate: "",
    acquisitionCost: 0,
    location: "",
    isBookable: false
  });

  const { data: org } = useQuery({ queryKey: ["org"], queryFn: async () => (await api.get("/org")).data });
  const { data: assetsRes } = useQuery({
    queryKey: ["assets", q],
    queryFn: async () => (await api.get("/assets", { params: { q, limit: 100 } })).data
  });

  const createAsset = useMutation({
    mutationFn: async () => api.post("/assets", { ...form, acquisitionCost: Number(form.acquisitionCost) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assets"] });
      setForm({ ...form, name: "", serialNumber: "", purchaseDate: "", location: "" });
    }
  });

  const bulkDelete = useMutation({
    mutationFn: async () => api.post("/assets/bulk-delete", { ids: selected }),
    onSuccess: () => {
      setSelected([]);
      qc.invalidateQueries({ queryKey: ["assets"] });
    }
  });

  const bulkReserve = useMutation({
    mutationFn: async () => api.post("/assets/bulk-status", { ids: selected, status: "Reserved" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assets"] })
  });

  const assets = useMemo(() => assetsRes?.items || [], [assetsRes]);

  const exportCsv = () => {
    const rows = assets.map((a) => [a.assetTag, a.name, a.serialNumber, a.category?.name, a.department?.name, a.status].join(","));
    const csv = ["Asset Tag,Name,Serial,Category,Department,Status", ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "asset-directory.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportExcel = () => {
    exportCsv();
  };

  const toggleSelect = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const searchByQr = async () => {
    if (!qrTag.trim()) return;
    const { data } = await api.get("/assets/qr", { params: { tag: qrTag.trim() } });
    setQrResult(data);
  };

  return (
    <div className="space-y-4">
      <SectionCard title="Register Asset">
        <div className="grid gap-2 md:grid-cols-4">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Asset name" className="rounded-lg border p-2" />
          <input value={form.serialNumber} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} placeholder="Serial number" className="rounded-lg border p-2" />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-lg border p-2">
            <option value="">Select category</option>
            {(org?.categories || []).map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="rounded-lg border p-2">
            <option value="">Select department</option>
            {(org?.departments || []).map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
          <input type="date" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} className="rounded-lg border p-2" />
          <input type="number" value={form.acquisitionCost} onChange={(e) => setForm({ ...form, acquisitionCost: e.target.value })} placeholder="Cost" className="rounded-lg border p-2" />
          <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location" className="rounded-lg border p-2" />
          <button onClick={() => createAsset.mutate()} className="rounded-lg bg-brand-600 px-3 py-2 font-semibold text-white">Register</button>
        </div>
      </SectionCard>

      <SectionCard
        title="Asset Directory"
        right={
          <div className="flex flex-wrap gap-2">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search assets" className="rounded-lg border p-2 text-sm" />
            <button onClick={exportCsv} className="rounded-lg border px-3 py-2 text-xs">Export CSV</button>
            <button onClick={exportExcel} className="rounded-lg border px-3 py-2 text-xs">Export Excel</button>
            <button disabled={!selected.length} onClick={() => bulkReserve.mutate()} className="rounded-lg bg-slate-700 px-3 py-2 text-xs text-white disabled:opacity-40">Bulk Reserve</button>
            <button disabled={!selected.length} onClick={() => bulkDelete.mutate()} className="rounded-lg bg-rose-600 px-3 py-2 text-xs text-white disabled:opacity-40">Bulk Delete</button>
          </div>
        }
      >
        <div className="mb-3 grid gap-2 md:grid-cols-[1fr_auto]">
          <div className="flex gap-2">
            <input value={qrTag} onChange={(e) => setQrTag(e.target.value)} placeholder="QR/Asset Tag Search" className="w-full rounded-lg border p-2 text-sm" />
            <button onClick={searchByQr} className="rounded-lg bg-brand-600 px-3 py-2 text-sm text-white">Find</button>
          </div>
          {qrResult && <div className="rounded-lg border px-3 py-2 text-xs">Matched: {qrResult.name} ({qrResult.assetTag})</div>}
        </div>
        <SimpleTable
          columns={[
            { key: "select", label: "Select", render: (r) => <input type="checkbox" checked={selected.includes(r._id)} onChange={() => toggleSelect(r._id)} /> },
            { key: "name", label: "Name" },
            { key: "assetTag", label: "Tag" },
            { key: "serialNumber", label: "Serial" },
            { key: "category", label: "Category", render: (r) => r.category?.name },
            { key: "department", label: "Department", render: (r) => r.department?.name },
            { key: "status", label: "Status" },
            { key: "qr", label: "QR", render: (r) => <div className="w-10"><QRCode value={r.qrPayload || r.assetTag} size={40} /></div> }
          ]}
          rows={assets}
        />
      </SectionCard>
    </div>
  );
}
