import React, { useEffect, useRef, useState } from 'react';
import { Building2, ChevronDown, ChevronUp, LogOut, Menu } from 'lucide-react';
import { useRpatis } from '../../context/RpatisContext';

interface CollapsibleSidebarLayoutProps {
  ariaLabel: string;
  sidebarSubtitle?: string;
  sidebarContent: React.ReactNode;
  activeSectionLabel?: string;
  children: React.ReactNode;
}

const STORAGE_KEY = 'rpat_sidebar_collapsed';

export const CollapsibleSidebarLayout: React.FC<CollapsibleSidebarLayoutProps> = ({
  ariaLabel,
  sidebarSubtitle,
  sidebarContent,
  activeSectionLabel,
  children
}) => {
  const { currentUser, logout } = useRpatis();

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(collapsed));
    } catch {
      // Ignore storage failures in restricted contexts
    }
  }, [collapsed]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setCollapsed((prev) => !prev);
      } else if (e.key === 'Escape') {
        setProfileMenuOpen(false);
      }
    };
    const handleOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleOutside);
    };
  }, []);

  const isCapitol = currentUser?.department === 'capitol';
  const isTreasury = currentUser?.department === 'treasury';
  const officeAccent = isCapitol
    ? 'bg-indigo-700'
    : isTreasury
    ? 'bg-emerald-700'
    : 'bg-slate-800';

  return (
    <div className="flex-1 min-h-0 flex flex-col lg:flex-row w-full bg-slate-50 text-slate-900 min-w-0 lg:overflow-hidden">
      {!collapsed && (
        <aside
          aria-label={ariaLabel}
          className="w-full lg:w-72 bg-white border-b lg:border-b-0 lg:border-r border-slate-300 flex flex-col shrink-0 lg:h-full lg:min-h-0"
        >
          {/* Top of Sidebar: Logo, Title & 3-bar Hide Button */}
          <div className="p-4 border-b border-slate-200 space-y-2.5 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-9 h-9 rounded-lg ${officeAccent} flex items-center justify-center font-bold text-white shrink-0 border border-white/15`}
                >
                  <Building2 className="w-5 h-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <span className="bg-slate-100 text-slate-900 text-xs font-mono font-extrabold px-2 py-0.5 rounded border border-slate-300 inline-block">
                    RPAT-IOSS
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCollapsed(true)}
                aria-label="Hide navigation sidebar"
                aria-expanded={true}
                title="Hide navigation (Ctrl+B)"
                className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-200 text-slate-800 shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <Menu className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-0.5">
              <div className="text-sm font-bold tracking-tight text-slate-900 leading-snug">
                {currentUser?.departmentName || 'RPAT-IOSS'}
              </div>
              <p className="text-xs text-slate-600 leading-snug">
                {sidebarSubtitle || currentUser?.officeLocation}
              </p>
            </div>

            <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-700 w-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" aria-hidden="true" />
              <span>Inter-Office Sync Active</span>
            </div>
          </div>

          {/* Scrollable Sidebar Navigation */}
          <div className="p-4 overflow-y-auto flex-1 min-h-0">{sidebarContent}</div>

          {/* Bottom of Sidebar: Interactive User Profile & Sign Out */}
          {currentUser && (
            <div ref={profileMenuRef} className="p-3 border-t border-slate-200 bg-slate-50 relative shrink-0">
              {profileMenuOpen && (
                <div
                  role="menu"
                  className="absolute bottom-full left-3 right-3 mb-2 bg-white text-slate-900 rounded-xl border border-slate-300 shadow-xl overflow-hidden z-50"
                >
                  <div className="p-3.5 bg-slate-50 border-b border-slate-200 space-y-1">
                    <div className="text-xs font-bold text-slate-900">{currentUser.name}</div>
                    <div className="text-[11px] text-slate-700 font-medium">{currentUser.title}</div>
                    {currentUser.employeeId && (
                      <div className="text-[11px] font-mono text-slate-600">
                        ID: {currentUser.employeeId}
                      </div>
                    )}
                    <div className="text-[11px] text-slate-600 pt-0.5 truncate">{currentUser.email}</div>
                    <div className="flex flex-wrap gap-1 pt-1.5">
                      {currentUser.permissions.map((perm) => (
                        <span
                          key={perm}
                          className="text-[10px] font-medium bg-white border border-slate-300 text-slate-700 px-1.5 py-0.5 rounded"
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
                        setProfileMenuOpen(false);
                        logout();
                      }}
                      className="w-full min-h-[40px] px-3 py-2 rounded-lg text-xs font-bold text-red-800 hover:bg-red-50 flex items-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                    >
                      <LogOut className="w-4 h-4" aria-hidden="true" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setProfileMenuOpen((o) => !o)}
                aria-expanded={profileMenuOpen}
                aria-haspopup="menu"
                className="w-full min-h-[48px] flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-200/70 transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <span
                  className={`w-8 h-8 rounded-full ${officeAccent} text-white text-xs font-bold flex items-center justify-center shrink-0`}
                >
                  {currentUser.avatarInitials}
                </span>
                <div className="min-w-0 flex-1 leading-snug space-y-0.5">
                  <div className="text-xs font-bold text-slate-900">{currentUser.name}</div>
                  <div className="text-[11px] text-slate-700">{currentUser.title}</div>
                  {currentUser.employeeId && (
                    <div className="text-[11px] font-mono text-slate-500">{currentUser.employeeId}</div>
                  )}
                </div>
                {profileMenuOpen ? (
                  <ChevronDown className="w-4 h-4 text-slate-600 shrink-0" aria-hidden="true" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-slate-600 shrink-0" aria-hidden="true" />
                )}
              </button>
            </div>
          )}
        </aside>
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0 min-h-0 flex flex-col overflow-y-auto">
        {collapsed && (
          <div className="px-5 sm:px-6 pt-4 -mb-2 flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              aria-label="Show navigation sidebar"
              aria-expanded={false}
              title="Show navigation (Ctrl+B)"
              className="min-w-[40px] min-h-[40px] px-2.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 shadow-2xs text-slate-900 rounded-lg inline-flex items-center justify-center shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <Menu className="w-5 h-5" aria-hidden="true" />
            </button>

            {activeSectionLabel && (
              <span className="text-xs text-slate-600 font-semibold truncate">
                {activeSectionLabel}
              </span>
            )}
          </div>
        )}

        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
};
