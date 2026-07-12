import { Link, useLocation } from "react-router-dom";

export default function Breadcrumbs() {
  const location = useLocation();
  const parts = location.pathname.split("/").filter(Boolean);

  return (
    <div className="text-sm text-slate-500 dark:text-slate-400">
      <Link to="/dashboard" className="hover:text-brand-600">
        Home
      </Link>
      {parts.map((part, idx) => {
        const to = `/${parts.slice(0, idx + 1).join("/")}`;
        return (
          <span key={to}>
            {" "}/ {" "}
            <Link className="capitalize hover:text-brand-600" to={to}>
              {part.replace(/-/g, " ")}
            </Link>
          </span>
        );
      })}
    </div>
  );
}
