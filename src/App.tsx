import React, { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';
import { RpatisProvider, useRpatis } from './context/RpatisContext';
import { LoginGateway } from './components/auth/LoginGateway';
import { RoleLayout } from './components/layout/RoleLayout';
import { Screen1Assessor } from './components/Screen1Assessor';
import { Screen2Capitol } from './components/Screen2Capitol';
import { Screen3Treasury } from './components/Screen3Treasury';
import { Screen4CitizenPortal } from './components/Screen4CitizenPortal';
import { DemoPresenterBar } from './components/demo/DemoPresenterBar';

const isCitizenPath = (pathname: string) =>
  pathname.startsWith('/citizen') || pathname.startsWith('/portal') || pathname.startsWith('/track');

const isDemoModeActive = () => {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('demo') === '1' || window.location.hash === '#demo';
};

const StandaloneCitizenShell: React.FC = () => (
  <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
    <a
      href="#citizen-main"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-teal-800 focus:text-white focus:px-4 focus:py-2.5 focus:rounded-lg focus:font-bold"
    >
      Skip to citizen portal content
    </a>
    <header className="bg-slate-950 text-white border-b border-slate-800 px-6 py-3 w-full sticky top-0 z-40">
      <div className="w-full flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-700 flex items-center justify-center text-white shrink-0">
            <Building2 className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight">
                Municipality of Pasacao — Public Taxpayer Portal
              </span>
              <span className="bg-teal-500/20 text-teal-200 text-xs font-mono px-2 py-0.5 rounded border border-teal-500/40">
                RPAT-IOSS Public
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Real Property Assessment Status Tracker &amp; Requirements Verification
            </p>
          </div>
        </div>
        <div className="text-xs text-slate-300 font-mono">Camarines Sur • RA 10173 Compliant</div>
      </div>
    </header>
    <main id="citizen-main" className="flex-1 w-full flex flex-col">
      <Screen4CitizenPortal />
    </main>
  </div>
);

const RoleBasedRouter: React.FC = () => {
  const { currentUser } = useRpatis();
  const [pathname, setPathname] = useState(() =>
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );
  const showDemoBar = isDemoModeActive();

  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigatePath = (newPath: string) => {
    const search = showDemoBar ? '?demo=1' : '';
    window.history.pushState({}, '', `${newPath}${search}`);
    setPathname(newPath);
  };

  const onCitizenRoute = isCitizenPath(pathname);

  return (
    <div className={showDemoBar ? 'pb-24' : ''}>
      {onCitizenRoute ? (
        <StandaloneCitizenShell />
      ) : !currentUser ? (
        <LoginGateway />
      ) : (
        <RoleLayout>
          {currentUser.department === 'assessor' && <Screen1Assessor />}
          {currentUser.department === 'capitol' && <Screen2Capitol />}
          {currentUser.department === 'treasury' && <Screen3Treasury />}
        </RoleLayout>
      )}
      {showDemoBar && <DemoPresenterBar onNavigatePath={navigatePath} currentPath={pathname} />}
    </div>
  );
};

export default function App() {
  return (
    <RpatisProvider>
      <RoleBasedRouter />
    </RpatisProvider>
  );
}
