export default function SectionCard({ title, right, children }) {
  return (
    <section className="rounded-xl border border-slate-200/70 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-900/50">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">{title}</h3>
        {right}
      </div>
      {children}
    </section>
  );
}
