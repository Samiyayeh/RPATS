import React, { useState } from 'react';
import {
  Building2,
  Eye,
  EyeOff,
  Lock,
  UserCheck,
  ArrowRight,
  HelpCircle,
  ShieldCheck,
  Clock,
  CheckCircle2,
  MapPin
} from 'lucide-react';
import { useRpatis } from '../../context/RpatisContext';

export const LoginGateway: React.FC = () => {
  const { authenticateStaff } = useRpatis();
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = authenticateStaff(employeeId, password);
    if (!res.ok) {
      setErrorMsg(res.error || 'Authentication failed.');
    } else {
      setErrorMsg('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      <a
        href="#login-main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-slate-900 focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:font-semibold"
      >
        Skip to sign-in form
      </a>

      {/* Official Civic Top Bar */}
      <header className="bg-slate-950 text-white border-b border-slate-800 px-6 py-3.5 w-full">
        <div className="w-full flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white shadow-sm">
              <Building2 className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight">RPAT-IOSS</span>
                <span className="bg-emerald-500/20 text-emerald-200 text-xs font-mono px-2 py-0.5 rounded border border-emerald-500/40">
                  Internal LGU Network
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Real Property Assessment Tracking &amp; Inter-Office Synchronization System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
            <span>Pasacao ↔ Pili Capitol Sync Bridge: Online</span>
          </div>
        </div>
      </header>

      {/* Full-Screen Split Layout — Strictly Internal LGU Staff Authentication */}
      <main id="login-main" className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12">
        {/* Left Column: LGU Staff Sign-In Form (col-span-7) */}
        <section
          aria-labelledby="staff-signin-heading"
          className="lg:col-span-7 bg-white border-b lg:border-b-0 lg:border-r border-slate-300 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-10"
        >
          <div className="max-w-xl w-full mx-auto space-y-6">
            <div className="pb-5 border-b border-slate-200">
              <h1 id="staff-signin-heading" className="text-2xl font-bold text-slate-900">
                LGU Personnel Sign-In
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Sign in with your assigned personal government credentials. The system automatically routes you to your authorized Municipal Assessor, Provincial Capitol, or Municipal Treasury workspace.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-blue-50 border border-blue-200 flex items-start gap-2.5 text-xs text-blue-950">
              <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" aria-hidden="true" />
              <p className="leading-relaxed">
                <strong>Authorized Personnel Only:</strong> Use only your personal assigned Employee ID. Sharing terminal credentials is prohibited under Republic Act 10173 (Data Privacy Act) and COA audit regulations.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div
                  role="alert"
                  className="p-3.5 rounded-lg bg-red-50 border border-red-400 text-xs font-semibold text-red-900"
                >
                  {errorMsg}
                </div>
              )}

              <div>
                <label htmlFor="employee-id" className="block text-sm font-semibold text-slate-800 mb-1.5">
                  Personal Assigned Employee ID
                </label>
                <div className="relative">
                  <UserCheck
                    className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2"
                    aria-hidden="true"
                  />
                  <input
                    id="employee-id"
                    name="username"
                    type="text"
                    autoComplete="username"
                    placeholder="e.g. PAS-ASSR-0824"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full min-h-[46px] pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-400 bg-white text-sm font-mono font-semibold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="staff-password" className="block text-sm font-semibold text-slate-800">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowRecovery((v) => !v)}
                    className="text-xs font-semibold text-blue-700 hover:text-blue-900 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded px-1"
                  >
                    Forgot password / Access help?
                  </button>
                </div>
                <div className="relative">
                  <Lock
                    className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2"
                    aria-hidden="true"
                  />
                  <input
                    id="staff-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full min-h-[46px] pl-10 pr-12 py-2.5 rounded-lg border border-slate-400 bg-white text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2 top-1/2 -translate-y-1/2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {showRecovery && (
                <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-300 text-xs text-amber-950 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-amber-700 shrink-0" aria-hidden="true" />
                    <span>Authorized Account Recovery (LGU MIS Helpdesk)</span>
                  </div>
                  <p>
                    To reset a forgotten password or unlock a terminal account, contact the Pasacao MIS Officer at{' '}
                    <span className="font-mono font-semibold">mis@pasacao.gov.ph</span> or Provincial IT Support in Pili (Local 402).
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="w-full min-h-[48px] bg-slate-900 hover:bg-black text-white font-bold text-sm rounded-lg px-5 py-3 flex items-center justify-center gap-2 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                <span>Sign In to Authorized Workspace</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </form>
          </div>
        </section>

        {/* Right Column: Official Inter-Office Network & Statutory Notice (col-span-5) */}
        <aside className="lg:col-span-5 bg-slate-900 text-white flex flex-col justify-center px-6 sm:px-10 lg:px-12 py-10">
          <div className="max-w-lg w-full mx-auto space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold">
                <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Province of Camarines Sur • LGU Pasacao</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Connected Municipal &amp; Provincial Tax Administration
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Unified assessment, statutory appraisal review, and treasury collection network linking the Municipality of Pasacao with the Provincial Capitol in Pili.
              </p>
            </div>

            <div className="space-y-3 bg-slate-800/70 border border-slate-700 rounded-xl p-5 text-xs">
              <div className="font-bold uppercase tracking-wider text-slate-300">
                Authorized Participating Offices
              </div>
              <ul className="space-y-2.5 text-slate-200">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    <strong>Municipal Assessor&apos;s Office (Pasacao)</strong> — FAAS encoding, historical cadastre archive verification, and SMV valuation.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    <strong>Provincial Assessor&apos;s Office (Capitol, Pili)</strong> — Dual-pane docket inspection, SHA-256 sign-off, and CIS issuance.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    <strong>Municipal Treasury Office (Pasacao)</strong> — Real-time assessment roll sync, Form 56 cashiering, and Tax Clearance release.
                  </span>
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Gov Hours: 8:00 AM – 5:00 PM (Mon–Fri)</span>
              </span>
              <span className="font-mono">RA 7160 • RA 10173</span>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};
