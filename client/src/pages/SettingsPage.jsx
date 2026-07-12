import { useAuth } from "../context/AuthContext";
import SectionCard from "../components/SectionCard";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-4">
      <SectionCard title="Profile & Session">
        <div className="grid gap-2 md:grid-cols-2">
          <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-900">
            <p className="text-xs text-slate-500">Name</p>
            <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
          </div>
          <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-900">
            <p className="text-xs text-slate-500">Role</p>
            <p className="font-semibold">{user?.role}</p>
          </div>
        </div>
      </SectionCard>
      <SectionCard title="System Preferences">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Enterprise settings include theme, notification policies, and account security. Integrate SSO and MFA in production.
        </p>
      </SectionCard>
    </div>
  );
}
