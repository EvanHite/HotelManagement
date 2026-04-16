import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-[#f4f5f7]">
      <div className="lg:grid lg:min-h-screen lg:grid-cols-[252px_minmax(0,1fr)]">
        <Sidebar />
        <div className="min-w-0">
          <TopBar />
          <main className="px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
            <div className="mx-auto flex max-w-[1440px] flex-col gap-5">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
