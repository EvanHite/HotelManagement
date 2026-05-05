import { Link } from "react-router-dom";

const portalLinks = [
  { key: "management", label: "Management", path: "/management/sign-in" },
  { key: "staff", label: "Staff", path: "/staff/sign-in" },
];

export function AuthShell({
  activePortal,
  title,
  subtitle,
  actions,
  children,
}) {
  return (
    <div className="min-h-screen bg-[#f4f5f7] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1120px]">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-slate-900 text-sm font-semibold text-white">
              HH
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-950">Harbor House</p>
              <p className="text-sm text-slate-500">Hotel Management</p>
            </div>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>

        <div className="panel overflow-hidden">
          <div className="grid lg:grid-cols-[248px_minmax(0,1fr)]">
            <aside className="border-b border-slate-200 bg-slate-50 p-5 lg:border-b-0 lg:border-r">
              <nav className="space-y-1">
                {portalLinks.map((portal) => (
                  <Link
                    key={portal.key}
                    to={portal.path}
                    className={`flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition ${
                      activePortal === portal.key
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-white hover:text-slate-900"
                    }`}
                  >
                    <span>{portal.label}</span>
                    <span className={activePortal === portal.key ? "text-slate-300" : "text-slate-400"}>
                      Open
                    </span>
                  </Link>
                ))}
              </nav>

              <div className="mt-6 border-t border-slate-200 pt-4">
                <p className="text-sm leading-5 text-slate-500">
                  Sign in with your assigned staff or management account.
                </p>
              </div>
            </aside>

            <main className="p-6 lg:p-8">
              <div className="max-w-[460px]">
                <h1 className="text-[30px] font-semibold tracking-[-0.03em] text-slate-950">
                  {title}
                </h1>
                {subtitle && <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>}
              </div>
              <div className="mt-6">{children}</div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
