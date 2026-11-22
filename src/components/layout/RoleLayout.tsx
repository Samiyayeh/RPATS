import React, { useState, useRef, useEffect } from 'react';
import {
  Building2,
  LogOut,
  ChevronDown,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info,
  X
} from 'lucide-react';
import { useRpatis } from '../../context/RpatisContext';

interface RoleLayoutProps {
  children: React.ReactNode;
}

export const RoleLayout: React.FC<RoleLayoutProps> = ({ children }) => {
  const { currentUser, logout, toasts, dismissToast } = useRpatis();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  if (!currentUser) return null;

  const isCapitol = currentUser.department === 'capitol';
  const isCitizen = currentUser.department === 'citizen';

  const officeAccent = isCapitol
    ? 'bg-indigo-700'
    : currentUser.department === 'treasury'
    ? 'bg-emerald-700'
    : isCitizen
    ? 'bg-teal-700'
    : 'bg-slate-800';

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      {/* Skip to Main Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-blue-700 focus:text-white focus:px-4 focus:py-2.5 focus:rounded-lg focus:font-bold focus:shadow-lg"
      >
        Skip to main workspace content
      </a>

      {/* Role-Specific Official Header */}
      <header className="bg-slate-950 text-white border-b border-slate-800 px-4 sm:px-6 py-2.5 sticky top-0 z-40 shadow-sm w-full">
        <div className="w-full flex items-center justify-between gap-4">
          {/* Office Identity */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-9 h-9 rounded-lg ${officeAccent} flex items-center justify-center font-bold text-white shrink-0 border border-white/15`}
            >
              <Building2 className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm tracking-tight text-white truncate">
                  {currentUser.departmentName}
                </span>
                <span className="bg-slate-800 text-slate-200 text-xs font-mono px-2 py-0.5 rounded border border-slate-700">
                  RPAT-IOSS
                </span>
              </div>
              <p className="text-xs text-slate-300 truncate">{currentUser.officeLocation}</p>
            </div>
          </div>

          {/* Right Status & Authenticated Account Menu (Real-Life Only — No Role Spoofing) */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden md:flex items-center gap-2 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg text-xs text-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
              <span>Inter-Office Sync Active</span>
            </div>

            {!isCitizen && (
              <div
                className="hidden xl:flex items-center gap-1.5 text-xs text-slate-300 font-mono"
                title="Automatic session timeout after 15 minutes of inactivity"
              >
                <Clock className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                <span>Session: 15m lock</span>
              </div>
            )}

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                className="min-h-[42px] flex items-center gap-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <span
                  className={`w-7 h-7 rounded-full ${officeAccent} text-white text-xs font-bold flex items-center justify-center shrink-0`}
                >
                  {currentUser.avatarInitials}
                </span>
                <div className="hidden sm:block leading-tight">
                  <div className="text-xs font-bold text-white">{currentUser.name}</div>
                  <div className="text-[11px] text-slate-300">{currentUser.title}</div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-300 shrink-0" aria-hidden="true" />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-72 bg-white text-slate-900 rounded-xl border border-slate-300 shadow-xl overflow-hidden z-50"
                >
                  <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-1">
                    <div className="text-sm font-bold text-slate-900">{currentUser.name}</div>
                    <div className="text-xs text-slate-700 font-medium">{currentUser.title}</div>
                    {currentUser.employeeId && (
                      <div className="text-xs font-mono text-slate-600">
                        ID: {currentUser.employeeId}
                      </div>
                    )}
                    <div className="text-xs text-slate-600 pt-1">{currentUser.email}</div>
                    <div className="flex flex-wrap gap-1 pt-2">
                      {currentUser.permissions.map((perm) => (
                        <span
                          key={perm}
                          className="text-[11px] font-medium bg-white border border-slate-300 text-slate-700 px-2 py-0.5 rounded"
                        >
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-2">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false);
                        logout();
                      }}
                      className="w-full min-h-[40px] px-3 py-2 rounded-lg text-xs font-bold text-red-800 hover:bg-red-50 flex items-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                    >
                      <LogOut className="w-4 h-4" aria-hidden="true" />
                      <span>{isCitizen ? 'Exit Public Portal' : 'Sign Out'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Full-Screen Main Content Area */}
      <main id="main-content" className="flex-1 w-full flex flex-col">
        {children}
      </main>

      {/* Programmatic aria-live="polite" Sync Toast Container */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((toast) => {
          const borderStyle =
            toast.type === 'warning'
              ? 'border-amber-600 bg-amber-50 text-amber-950'
              : toast.type === 'info'
              ? 'border-blue-600 bg-blue-50 text-blue-950'
              : 'border-emerald-600 bg-emerald-50 text-emerald-950';
          const Icon =
            toast.type === 'warning'
              ? AlertTriangle
              : toast.type === 'info'
              ? Info
              : CheckCircle2;

          return (
            <div
              key={toast.id}
              role="status"
              className={`pointer-events-auto rounded-xl border-2 p-3.5 shadow-lg flex items-start gap-3 ${borderStyle}`}
            >
              <Icon className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex-1 text-xs">
                <div className="font-bold flex items-center justify-between gap-2">
                  <span>{toast.title}</span>
                  <span className="font-mono text-[11px] opacity-80">{toast.timestamp}</span>
                </div>
                <p className="mt-0.5 leading-snug">{toast.message}</p>
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss notification"
                className="p-1 rounded hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
