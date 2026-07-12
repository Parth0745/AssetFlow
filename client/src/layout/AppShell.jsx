import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../api/client";
import { useRealtimeNotifications } from "../hooks/useRealtimeNotifications";

function NotificationsDrawer({ open, onClose, notifications = [] }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ x: 360, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 360, opacity: 0 }}
          className="glass fixed right-3 top-3 z-50 h-[92vh] w-[360px] rounded-2xl p-4"
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold">Notification Center</h3>
            <button onClick={onClose} className="rounded-md px-2 py-1 hover:bg-slate-200 dark:hover:bg-slate-700">
              Close
            </button>
          </div>
          <div className="erp-scroll h-[84vh] space-y-2 overflow-y-auto pr-1">
            {notifications.map((n) => (
              <div key={n._id || n.id} className="rounded-xl border border-slate-200/60 p-3 dark:border-slate-700">
                <p className="text-sm font-semibold">{n.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{n.message}</p>
              </div>
            ))}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function CommandPalette({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-start bg-black/45 pt-24"
          onClick={onClose}
        >
          <div className="glass w-[680px] rounded-2xl p-4" onClick={(e) => e.stopPropagation()}>
            <input
              autoFocus
              className="w-full rounded-lg border border-slate-300 bg-white/70 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
              placeholder="Search screens, assets, employees..."
            />
            <p className="mt-3 text-xs text-slate-500">Tip: route quickly via sidebar or use browser find for records.</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function AppShell({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  const token = useMemo(
    () => localStorage.getItem("assetflow_token") || sessionStorage.getItem("assetflow_token"),
    []
  );

  const { data: notifications = [], refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await api.get("/notifications");
      return data;
    }
  });

  useRealtimeNotifications(token, () => {
    refetch();
  });

  useEffect(() => {
    const onShortcut = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  }, []);

  return (
    <div className="grid min-h-screen grid-cols-1 gap-3 p-3 lg:grid-cols-[288px_1fr]">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <div className="space-y-3">
        <Topbar
          onOpenMobileSidebar={() => setMobileOpen(true)}
          onOpenNotifications={() => setNotifOpen(true)}
          onOpenCommand={() => setCommandOpen(true)}
        />
        <main className="glass min-h-[calc(100vh-110px)] rounded-2xl p-4">{children}</main>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-50 grid bg-black/40 p-3 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              className="h-full w-72"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Sidebar mobile onNavigate={() => setMobileOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <NotificationsDrawer open={notifOpen} onClose={() => setNotifOpen(false)} notifications={notifications} />
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
    </div>
  );
}
