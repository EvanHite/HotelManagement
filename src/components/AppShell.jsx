import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useHotelApp } from "../context/HotelAppContext";

export function AppShell({ children }) {
  const { dataError, isLoadingData } = useHotelApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f4f5f7]">
      <div className="lg:grid lg:min-h-screen lg:grid-cols-[252px_minmax(0,1fr)]">
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <div className="min-w-0">
          <TopBar onMenuClick={() => setIsMobileMenuOpen(true)} />
          {dataError ? (
            <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800 sm:px-6 lg:px-8">
              {dataError}
            </div>
          ) : null}
          {isLoadingData ? (
            <div className="border-b border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 sm:px-6 lg:px-8">
              Loading database data.
            </div>
          ) : null}
          <main className="py-4 lg:py-6">
            <div className="app-container flex flex-col gap-5">{children}</div>
          </main>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-slate-950/30"
            type="button"
            aria-label="Close navigation"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative h-full w-[min(82vw,300px)] border-r border-slate-200 bg-white">
            <Sidebar
              isMobile
              onClose={() => setIsMobileMenuOpen(false)}
              onNavigate={() => setIsMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
