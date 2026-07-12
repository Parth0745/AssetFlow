import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../api/client";
import SectionCard from "../components/SectionCard";
import SimpleTable from "../components/SimpleTable";

function prettyFieldName(key) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/\b(\w)/g, (match) => match.toUpperCase());
}

function resolveRefValue(value, label, refs) {
  if (!value || !refs) return null;

  if (typeof value === "string" && value.match(/^[0-9a-fA-F]{24}$/)) {
    if (/(asset|assetId)$/i.test(label) && refs.assets[value]) {
      const asset = refs.assets[value];
      return `${asset.name}${asset.assetTag ? ` (${asset.assetTag})` : ""}`;
    }
    if (/(employee|fromEmployee|toEmployee|requestedBy|approvedBy|raisedBy|technician|user|createdBy|assignedTo)$/i.test(label) && refs.users[value]) {
      const user = refs.users[value];
      return `${user.firstName} ${user.lastName}`.trim();
    }
    if (/(department|departmentId)$/i.test(label) && refs.departments[value]) {
      return refs.departments[value].name;
    }
    if (/(category|categoryId|assetCategory)$/i.test(label) && refs.categories[value]) {
      return refs.categories[value].name;
    }
  }

  if (typeof value === "object") {
    if (value._id && typeof value._id === "string") {
      return resolveRefValue(value._id, label, refs);
    }
    if (value.firstName || value.lastName) {
      return `${value.firstName || ""} ${value.lastName || ""}`.trim();
    }
    if (value.name) {
      return value.name;
    }
  }

  return null;
}

function formatValue(value, label, refs) {
  if (value === null || value === undefined) return "-";

  const resolved = resolveRefValue(value, label, refs);
  if (resolved) return resolved;

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => formatValue(item, label, refs)).join(", ");
  }

  if (typeof value === "object") {
    if (Object.keys(value).length === 0) return "{}";
    return JSON.stringify(value);
  }

  return String(value);
}

function renderChangeRows(oldValue, newValue, refs) {
  if (!oldValue && !newValue) return ["No details"];

  if (oldValue == null) {
    if (typeof newValue === "object" && newValue !== null) {
      return Object.entries(newValue).map(([key, value]) => `${prettyFieldName(key)}: ${formatValue(value, key, refs)}`);
    }
    return [`Created: ${formatValue(newValue, "created", refs)}`];
  }

  if (newValue == null) {
    if (typeof oldValue === "object" && oldValue !== null) {
      return Object.entries(oldValue).map(([key, value]) => `Removed ${prettyFieldName(key)}: ${formatValue(value, key, refs)}`);
    }
    return [`Removed: ${formatValue(oldValue, "removed", refs)}`];
  }

  if (typeof oldValue !== "object" || typeof newValue !== "object") {
    return [`${formatValue(oldValue, "old", refs)} → ${formatValue(newValue, "new", refs)}`];
  }

  const entries = [];
  const keys = Array.from(new Set([...Object.keys(oldValue), ...Object.keys(newValue)]));
  keys.forEach((key) => {
    const before = formatValue(oldValue[key], key, refs);
    const after = formatValue(newValue[key], key, refs);
    if (before !== after) {
      entries.push(`${prettyFieldName(key)}: ${before} → ${after}`);
    }
  });

  return entries.length > 0 ? entries : ["No visible field changes"];
}

export default function ActivityLogsPage() {
  const [search, setSearch] = useState("");

  const { data: rows = [] } = useQuery({
    queryKey: ["activity-logs"],
    queryFn: async () => (await api.get("/activity-logs")).data
  });

  const { data: org } = useQuery({
    queryKey: ["org"],
    queryFn: async () => (await api.get("/org")).data,
    staleTime: 1000 * 60 * 5
  });

  const { data: assetsResponse = { items: [] } } = useQuery({
    queryKey: ["assets-map"],
    queryFn: async () => (await api.get("/assets", { params: { limit: 200 } })).data,
    staleTime: 1000 * 60 * 5
  });

  const refs = useMemo(() => {
    const users = (org?.employees || []).reduce((acc, user) => ({ ...acc, [user._id]: user }), {});
    const departments = (org?.departments || []).reduce((acc, dept) => ({ ...acc, [dept._id]: dept }), {});
    const categories = (org?.categories || []).reduce((acc, cat) => ({ ...acc, [cat._id]: cat }), {});
    const assets = (assetsResponse.items || []).reduce((acc, asset) => ({ ...acc, [asset._id]: asset }), {});
    return { users, departments, categories, assets };
  }, [org, assetsResponse.items]);

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    const term = search.toLowerCase();

    return rows.filter((row) => {
      const userName = `${row.user?.firstName || ""} ${row.user?.lastName || ""}`.trim().toLowerCase();
      const details = renderChangeRows(row.oldValue, row.newValue, refs).join(" ").toLowerCase();
      return [
        userName,
        row.entity?.toLowerCase() || "",
        row.action?.toLowerCase() || "",
        new Date(row.timestamp).toLocaleString().toLowerCase(),
        details
      ].some((value) => value.includes(term));
    });
  }, [rows, search, refs]);

  return (
    <div className="space-y-4">
      <SectionCard title="Activity Logs" subtitle="Audit trail for asset, allocation, booking, maintenance, and role changes.">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-500">Search or filter logged actions for easy audit review.</p>
            <p className="text-xs text-slate-400">Showing {filteredRows.length} of {rows.length} entries</p>
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user, action, entity, or details"
            className="w-full max-w-md rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>
      </SectionCard>

      <SectionCard>
        <SimpleTable
          columns={[
            { key: "timestamp", label: "Date / Time", render: (row) => new Date(row.timestamp).toLocaleString() },
            { key: "user", label: "User", render: (row) => `${row.user?.firstName || "-"} ${row.user?.lastName || ""}`.trim() || "-" },
            { key: "entity", label: "Entity" },
            { key: "action", label: "Action" },
            {
              key: "details",
              label: "Details",
              render: (row) => (
                <div className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                  {renderChangeRows(row.oldValue, row.newValue, refs).map((line, index) => (
                    <div key={index} className="rounded-md bg-slate-100 px-2 py-1 dark:bg-slate-900">
                      {line}
                    </div>
                  ))}
                </div>
              )
            }
          ]}
          rows={filteredRows}
        />
      </SectionCard>
    </div>
  );
}
