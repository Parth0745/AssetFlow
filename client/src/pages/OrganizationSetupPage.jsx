import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import SectionCard from "../components/SectionCard";
import SimpleTable from "../components/SimpleTable";

const roleTabs = {
  Admin: [
    { key: "overview", label: "Overview" },
    { key: "departments", label: "Departments" },
    { key: "categories", label: "Categories" },
    { key: "employees", label: "Employees" }
  ],
  "Asset Manager": [
    { key: "overview", label: "Overview" },
    { key: "departments", label: "Departments" },
    { key: "categories", label: "Categories" },
    { key: "employees", label: "Employees" }
  ],
  "Department Head": [
    { key: "overview", label: "Overview" },
    { key: "employees", label: "Employees" }
  ],
  Employee: [
    { key: "overview", label: "Overview" },
    { key: "employees", label: "Employees" }
  ]
};

export default function OrganizationSetupPage() {
  const { user } = useAuth();
  const role = user?.role || "Employee";
  const [tab, setTab] = useState("overview");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const qc = useQueryClient();

  const tabs = useMemo(() => roleTabs[role] || roleTabs.Employee, [role]);

  useEffect(() => {
    if (!tabs.some((item) => item.key === tab)) {
      setTab(tabs[0]?.key || "overview");
    }
  }, [tabs, tab]);

  const canEditOrg = role === "Admin" || role === "Asset Manager";
  const canManageEmployees = role === "Admin";

  const { data } = useQuery({
    queryKey: ["org"],
    queryFn: async () => (await api.get("/org")).data
  });

  const createDepartment = useMutation({
    mutationFn: async () => api.post("/org/departments", { name, code }),
    onSuccess: () => {
      setName("");
      setCode("");
      qc.invalidateQueries({ queryKey: ["org"] });
    }
  });

  const createCategory = useMutation({
    mutationFn: async () => api.post("/org/categories", { name, code }),
    onSuccess: () => {
      setName("");
      setCode("");
      qc.invalidateQueries({ queryKey: ["org"] });
    }
  });

  const overviewCards = [
    { label: "Departments", value: data?.departments?.length ?? 0 },
    { label: "Categories", value: data?.categories?.length ?? 0 },
    { label: "Employees", value: data?.employees?.length ?? 0 },
    { label: "Your Role", value: role }
  ];

  return (
    <div className="space-y-4">
      <SectionCard title="Organization Setup" subtitle="Role-based information and access for your team.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {overviewCards.map((card) => (
            <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <p className="text-sm text-slate-500 dark:text-slate-400">{card.label}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{card.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
          {canEditOrg ? (
            <p>As a <strong>{role}</strong>, you can manage organization structure and team assignments.</p>
          ) : (
            <p>Organization setup controls are only visible to Admin and Asset Manager roles. You can still review team and department details here.</p>
          )}
        </div>
      </SectionCard>

      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`rounded-lg px-3 py-2 ${tab === item.key ? "bg-brand-600 text-white" : "bg-slate-100 dark:bg-slate-800"}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <SectionCard title="Organization Overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <p className="text-sm text-slate-500 dark:text-slate-400">Departments</p>
              <p className="mt-2 text-xl font-semibold">{data?.departments?.length ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <p className="text-sm text-slate-500 dark:text-slate-400">Asset Categories</p>
              <p className="mt-2 text-xl font-semibold">{data?.categories?.length ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <p className="text-sm text-slate-500 dark:text-slate-400">Employees</p>
              <p className="mt-2 text-xl font-semibold">{data?.employees?.length ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <p className="text-sm text-slate-500 dark:text-slate-400">Your Role</p>
              <p className="mt-2 text-xl font-semibold">{role}</p>
            </div>
          </div>
        </SectionCard>
      )}

      {tab === "departments" && (
        <>
          {canEditOrg && (
            <SectionCard title="Create Department">
              <div className="grid gap-2 md:grid-cols-3">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="rounded-lg border p-2" />
                <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Code" className="rounded-lg border p-2" />
                <button
                  onClick={() => createDepartment.mutate()}
                  className="rounded-lg bg-brand-600 px-3 py-2 font-semibold text-white"
                >
                  Save
                </button>
              </div>
            </SectionCard>
          )}

          <SectionCard title="Department Hierarchy">
            <SimpleTable
              columns={[
                { key: "name", label: "Department" },
                { key: "code", label: "Code" },
                { key: "status", label: "Status" },
                { key: "departmentHead", label: "Head", render: (r) => `${r.departmentHead?.firstName || "-"} ${r.departmentHead?.lastName || ""}` }
              ]}
              rows={data?.departments || []}
            />
          </SectionCard>
        </>
      )}

      {tab === "categories" && (
        <>
          {canEditOrg && (
            <SectionCard title="Create Category">
              <div className="grid gap-2 md:grid-cols-3">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="rounded-lg border p-2" />
                <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Code" className="rounded-lg border p-2" />
                <button
                  onClick={() => createCategory.mutate()}
                  className="rounded-lg bg-brand-600 px-3 py-2 font-semibold text-white"
                >
                  Save
                </button>
              </div>
            </SectionCard>
          )}

          <SectionCard title="Asset Categories">
            <SimpleTable
              columns={[
                { key: "name", label: "Category" },
                { key: "code", label: "Code" },
                { key: "status", label: "Status" },
                { key: "dynamicFields", label: "Dynamic Fields", render: (r) => r.dynamicFields?.length || 0 }
              ]}
              rows={data?.categories || []}
            />
          </SectionCard>
        </>
      )}

      {tab === "employees" && (
        <SectionCard title="Employee Directory">
          <SimpleTable
            columns={[
              { key: "firstName", label: "First" },
              { key: "lastName", label: "Last" },
              { key: "email", label: "Email" },
              { key: "role", label: "Role" },
              { key: "department", label: "Department", render: (r) => r.department?.name || "-" }
            ]}
            rows={data?.employees || []}
          />
          {!canManageEmployees && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
              Employee creation and role assignment are reserved for Admin users.
            </div>
          )}
        </SectionCard>
      )}
    </div>
  );
}
