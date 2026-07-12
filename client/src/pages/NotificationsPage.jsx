import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/client";
import SectionCard from "../components/SectionCard";

export default function NotificationsPage() {
  const qc = useQueryClient();
  const { data: notifications = [] } = useQuery({ queryKey: ["notifications-page"], queryFn: async () => (await api.get("/notifications")).data });

  const markRead = useMutation({
    mutationFn: async (id) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications-page"] })
  });

  return (
    <SectionCard title="Notification Center">
      <div className="space-y-2">
        {notifications.map((n) => (
          <div key={n._id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3 dark:border-slate-700">
            <div>
              <p className="font-semibold">{n.title}</p>
              <p className="text-sm text-slate-500">{n.message}</p>
            </div>
            {!n.isRead && <button onClick={() => markRead.mutate(n._id)} className="rounded bg-brand-600 px-2 py-1 text-xs text-white">Mark read</button>}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
