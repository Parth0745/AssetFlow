import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Building2,
  Boxes,
  Repeat,
  CalendarClock,
  Wrench,
  ClipboardCheck,
  BarChart3,
  Bell,
  History,
  Settings
} from "lucide-react";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/organization-setup", label: "Organization Setup", icon: Building2 },
  { to: "/assets", label: "Assets", icon: Boxes },
  { to: "/allocation-transfer", label: "Allocation & Transfer", icon: Repeat },
  { to: "/resource-booking", label: "Resource Booking", icon: CalendarClock },
  { to: "/maintenance", label: "Maintenance", icon: Wrench },
  { to: "/audit", label: "Audit", icon: ClipboardCheck },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/activity-logs", label: "Activity Logs", icon: History },
  { to: "/settings", label: "Settings", icon: Settings }
];

export default function Sidebar({ mobile = false, onNavigate }) {
  const { user } = useAuth();
  const role = user?.role;

  const visibleNav = nav.filter((item) => {
    if (item.to === "/organization-setup" && role === "Employee") return false;
    return true;
  });

  return (
    <aside className={`glass ${mobile ? "w-full" : "w-72"} h-full rounded-2xl p-4`}>
      <div className="mb-5 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white">AF</div>
        <div>
          <p className="font-extrabold">AssetFlow</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Enterprise ERP</p>
        </div>
      </div>
      <nav className="space-y-1">
        {visibleNav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                isActive ? "bg-brand-500 text-white" : "hover:bg-slate-200/70 dark:hover:bg-slate-800"
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
