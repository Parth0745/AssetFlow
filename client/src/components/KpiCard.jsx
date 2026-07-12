import { motion } from "framer-motion";

export default function KpiCard({ title, value, tone = "blue" }) {
  const tones = {
    blue: "from-blue-500/20 to-blue-100/40 dark:to-blue-950/40",
    green: "from-emerald-500/20 to-emerald-100/40 dark:to-emerald-950/40",
    orange: "from-orange-500/20 to-orange-100/40 dark:to-orange-950/40",
    red: "from-rose-500/20 to-rose-100/40 dark:to-rose-950/40"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl bg-gradient-to-br p-4 ${tones[tone] || tones.blue}`}
    >
      <p className="text-xs text-slate-600 dark:text-slate-400">{title}</p>
      <p className="mt-1 text-2xl font-extrabold">{value}</p>
    </motion.div>
  );
}
