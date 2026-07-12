export default function SimpleTable({ columns, rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            {columns.map((c) => (
              <th key={c.key} className="px-2 py-2 text-left font-semibold text-slate-600 dark:text-slate-300">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row._id || idx} className="border-b border-slate-100 dark:border-slate-800">
              {columns.map((c) => (
                <td key={c.key} className="px-2 py-2 text-slate-700 dark:text-slate-200">
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
