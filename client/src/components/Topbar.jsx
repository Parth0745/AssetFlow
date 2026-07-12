import { Bell, LogOut, Menu, Moon, Search, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import Breadcrumbs from "./Breadcrumbs";

export default function Topbar({ onOpenMobileSidebar, onOpenNotifications, onOpenCommand }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header className="glass sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 rounded-2xl p-3">
      <div className="flex items-center gap-3">
        <button className="rounded-lg p-2 hover:bg-slate-200 dark:hover:bg-slate-800 lg:hidden" onClick={onOpenMobileSidebar}>
          <Menu size={18} />
        </button>
        <div>
          <Breadcrumbs />
          <h1 className="text-lg font-bold">AssetFlow Control Center</h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={onOpenCommand} className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 md:flex">
          <Search size={15} />
          Search (Ctrl+K)
        </button>
        <button onClick={toggleTheme} className="rounded-lg p-2 hover:bg-slate-200 dark:hover:bg-slate-800">
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        <button onClick={onOpenNotifications} className="relative rounded-lg p-2 hover:bg-slate-200 dark:hover:bg-slate-800">
          <Bell size={18} />
        </button>
        <div className="hidden rounded-lg bg-slate-100 px-3 py-2 text-sm dark:bg-slate-800 md:block">
          {user?.firstName} {user?.lastName} | {user?.role}
        </div>
        <button onClick={logout} className="rounded-lg p-2 hover:bg-slate-200 dark:hover:bg-slate-800">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
