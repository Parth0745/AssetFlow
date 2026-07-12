import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from "recharts";
import api from "../api/client";
import KpiCard from "../components/KpiCard";
import SectionCard from "../components/SectionCard";
import SimpleTable from "../components/SimpleTable";

const colors = ["#1f7ae0", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => (await api.get("/dashboard")).data
  });

  if (isLoading) return <div className="animate-pulse">Loading dashboard...</div>;

  const k = data.kpis;
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard title="Available Assets" value={k.availableAssets} tone="green" />
        <KpiCard title="Allocated Assets" value={k.allocatedAssets} tone="blue" />
        <KpiCard title="Reserved Assets" value={k.reservedAssets} tone="orange" />
        <KpiCard title="Under Maintenance" value={k.maintenanceAssets} tone="red" />
        <KpiCard title="Lost Assets" value={k.lostAssets} tone="red" />
        <KpiCard title="Today's Bookings" value={k.todaysBookings} tone="blue" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Asset Category Pie Chart">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.widgets.assetCategoryAgg} dataKey="value" nameKey="_id" outerRadius={92}>
                  {data.widgets.assetCategoryAgg.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
        <SectionCard title="Department Asset Distribution">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.widgets.departmentDist.map((d) => ({ name: d._id, value: d.value }))}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#1f7ae0" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Recent Activities">
          <SimpleTable
            columns={[{ key: "entity", label: "Entity" }, { key: "action", label: "Action" }, { key: "user", label: "User", render: (r) => `${r.user?.firstName || ""} ${r.user?.lastName || ""}` }]}
            rows={data.widgets.recentActivities}
          />
        </SectionCard>
        <SectionCard title="Recent Notifications">
          <SimpleTable columns={[{ key: "title", label: "Title" }, { key: "message", label: "Message" }]} rows={data.widgets.recentNotifications} />
        </SectionCard>
      </div>
    </div>
  );
}
