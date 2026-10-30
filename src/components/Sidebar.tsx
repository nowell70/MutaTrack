import React from 'react';
import { LayoutGrid, Plus, History, GitFork, LogOut } from 'lucide-react';

export type ViewTab = 'landing' | 'dashboard' | 'new-analysis' | 'history' | 'example' | 'results' | 'auth';

interface SidebarProps {
  currentView: ViewTab;
  onSelectView: (view: ViewTab) => void;
  onLogout: () => void;
  onGoHome?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  onLogout,
  onGoHome,
}) => {
  const navItems: { id: ViewTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutGrid className="w-4 h-4" />,
    },
    {
      id: 'new-analysis',
      label: 'Analisis Baru',
      icon: <Plus className="w-4 h-4" />,
    },
    {
      id: 'history',
      label: 'Riwayat',
      icon: <History className="w-4 h-4" />,
    },
    {
      id: 'example',
      label: 'Contoh Analisis',
      icon: <GitFork className="w-4 h-4 rotate-180" />,
    },
  ];

  return (
    <aside className="w-60 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 min-h-[calc(100vh-56px)]">
      {/* Top Logo & Links */}
      <div className="p-4 space-y-6">
        {/* Brand */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-1.5 px-2 py-1 text-left cursor-pointer focus:outline-none"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" />
          <span className="font-extrabold text-lg tracking-tight text-slate-900">
            Muta <span className="text-blue-600">Track</span>
          </span>
        </button>

        {/* Navigation List */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-blue-600' : 'text-slate-500'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Keluar */}
      <div className="p-4 border-t border-slate-200">
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg w-full transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
};
