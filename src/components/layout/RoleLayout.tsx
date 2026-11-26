import React from 'react';
import {
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
  const { currentUser, toasts, dismissToast } = useRpatis();

  if (!currentUser) return null;

  return (
    <div className="min-h-screen lg:h-dvh lg:overflow-hidden bg-slate-50 text-slate-900 flex flex-col">
      {/* Skip to Main Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-blue-700 focus:text-white focus:px-4 focus:py-2.5 focus:rounded-lg focus:font-bold focus:shadow-lg"
      >
        Skip to main workspace content
      </a>

      {/* Full-Screen Main Content Area */}
      <main id="main-content" className="flex-1 min-h-0 w-full flex flex-col">
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
