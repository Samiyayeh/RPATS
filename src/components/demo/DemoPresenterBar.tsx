import React, { useState } from 'react';
import { Presentation, ChevronUp, ChevronDown, LogOut, Users } from 'lucide-react';
import { useRpatis } from '../../context/RpatisContext';
import { USER_PERSONAS } from '../../data/mockData';
import { OfficeRole } from '../../types/rpatis';

interface DemoPresenterBarProps {
  onNavigatePath?: (path: string) => void;
  currentPath?: string;
}

/**
 * Isolated Presenter / Demo Mode Controller.
 * ONLY rendered when the URL includes `?demo=1` or `#demo`.
 * Completely absent in real-life production usage (`/` and `/citizen`).
 */
export const DemoPresenterBar: React.FC<DemoPresenterBarProps> = ({
  onNavigatePath,
  currentPath = '/'
}) => {
  const { currentUser, switchPersona, logout } = useRpatis();
  const [collapsed, setCollapsed] = useState(false);

  const exitDemoMode = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('demo');
    url.hash = '';
    window.location.href = url.toString();
  };

  const handleRoleClick = (roleKey: OfficeRole) => {
    if (roleKey === 'citizen') {
      onNavigatePath && onNavigatePath('/citizen');
    } else {
      onNavigatePath && onNavigatePath('/');
      switchPersona(roleKey);
    }
  };

  const isOnCitizen = currentPath.startsWith('/citizen');

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950 text-white border-t-2 border-amber-500 shadow-2xl">
      <div className="px-4 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
          <Presentation className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>PRESENTER DEMO SANDBOX (?demo=1)</span>
          <span className="hidden md:inline text-slate-400 font-normal">
            — Hidden in production URLs (`/` and `/citizen`).
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs font-semibold flex items-center gap-1"
          >
            {collapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{collapsed ? 'Expand Roles' : 'Minimize'}</span>
          </button>

          <button
            type="button"
            onClick={exitDemoMode}
            className="px-2.5 py-1 bg-red-900/60 hover:bg-red-800 border border-red-700 rounded text-xs font-semibold flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit Demo Mode</span>
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="px-4 pb-3 pt-1 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1 mr-1">
              <Users className="w-3.5 h-3.5" /> Instant Switch:
            </span>
            {(Object.keys(USER_PERSONAS) as OfficeRole[]).map((roleKey) => {
              const p = USER_PERSONAS[roleKey];
              const active =
                roleKey === 'citizen' ? isOnCitizen : !isOnCitizen && currentUser?.id === roleKey;
              return (
                <button
                  key={roleKey}
                  type="button"
                  onClick={() => handleRoleClick(roleKey)}
                  className={`px-2.5 py-1.5 rounded text-xs font-bold transition-colors ${
                    active
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  {roleKey === 'citizen' ? 'Citizen (/citizen)' : `${p.name.split(' ')[0]} (${p.title.split(' ')[0]})`}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => {
                onNavigatePath && onNavigatePath('/');
                logout();
              }}
              className="px-2.5 py-1.5 rounded text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700"
            >
              Staff Login (/)
            </button>
          </div>

          <div className="text-[11px] font-mono text-slate-400">
            Staff IDs: PAS-ASSR-0824 • CAP-EXM-0419 • CAP-APR-0001 • PAS-TRES-0311 | Public: /citizen
          </div>
        </div>
      )}
    </div>
  );
};
