import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import api from "../api/client";
import SectionCard from "../components/SectionCard";
import SimpleTable from "../components/SimpleTable";

export default function ReportsPage() {
  const { data, isLoading } = useQuery({ queryKey: ["reports"], queryFn: async () => (await api.get("/reports")).data });
  if (isLoading) return <div>Loading reports...</div>;

  return (
    <div className="space-y-4">
      <SectionCard title="Asset Utilization">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.utilization.map((r) => ({ name: r._id, count: r.count }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#1f7ae0" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Most Used Assets">
          <SimpleTable columns={[{ key: "_id", label: "Asset/Resource" }, { key: "count", label: "Usage" }]} rows={data.mostUsed} />
        </SectionCard>
        <SectionCard title="Least Used Assets">
          <SimpleTable columns={[{ key: "_id", label: "Asset/Resource" }, { key: "count", label: "Usage" }]} rows={data.leastUsed} />
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Upcoming Retirement">
          <SimpleTable columns={[{ key: "name", label: "Asset" }, { key: "status", label: "Status" }]} rows={data.retirement} />
        </SectionCard>
        <SectionCard title="Warranty Expiry">
          <SimpleTable columns={[{ key: "name", label: "Asset" }, { key: "warrantyUntil", label: "Warranty Until", render: (r) => r.warrantyUntil ? new Date(r.warrantyUntil).toLocaleDateString() : "-" }]} rows={data.warranty} />
        </SectionCard>
      </div>
    </div>
  );
}
