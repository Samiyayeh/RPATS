import React, { useState } from 'react';
import {
  Inbox,
  FileSearch,
  Stamp,
  AlertCircle,
  X,
  Send,
  AlertTriangle
} from 'lucide-react';
import { useRpatis } from '../context/RpatisContext';
import { Screen2CapitolMasterQueue } from './Screen2CapitolMasterQueue';
import { Screen2CapitolInspection } from './Screen2CapitolInspection';
import { Screen3CapitolSignoff } from './Screen3CapitolSignoff';
import { Screen4CapitolDeficiencyTracker } from './Screen4CapitolDeficiencyTracker';

export const Screen2Capitol: React.FC = () => {
  const { currentUser, dockets, activeDocketId, setActiveDocketId, flagDocketDeficiency } = useRpatis();
  const [activeMenu, setActiveMenu] = useState<'queue' | 'inspection' | 'signoff' | 'deficiencies'>(
    currentUser?.id === 'capitol_approver' ? 'signoff' : 'queue'
  );

  const [showDeficiencyModal, setShowDeficiencyModal] = useState(false);
  const [selectedDiscrepancies, setSelectedDiscrepancies] = useState<string[]>([]);
  const [discrepancyRemarks, setDiscrepancyRemarks] = useState('');

  const activeDocket = dockets.find((d) => d.id === activeDocketId) || dockets[0];
  const flaggedCount = dockets.filter((d) => d.status === 'Flagged').length;
  const reviewCount = dockets.filter(
    (d) => d.status === 'Under Technical Review' || d.status === 'At Capitol'
  ).length;

  const handleToggleDiscrepancy = (item: string) => {
    setSelectedDiscrepancies((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const canDispatchDeficiency =
    selectedDiscrepancies.length > 0 || discrepancyRemarks.trim().length > 0;

  const handleDispatchDeficiency = () => {
    if (!canDispatchDeficiency) return;
    const parts = [selectedDiscrepancies.join('; '), discrepancyRemarks.trim()].filter(Boolean);
    flagDocketDeficiency(activeDocket.id, parts.join(' — '));
    setSelectedDiscrepancies([]);
    setDiscrepancyRemarks('');
    setShowDeficiencyModal(false);
    setActiveMenu('deficiencies');
  };

  return (
    <div className="flex flex-col lg:flex-row flex-1 w-full bg-slate-50 text-slate-900">
      {/* Provincial Capitol Sidebar */}
      <aside
        aria-label="Provincial Capitol Navigation"
        className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-slate-300 flex flex-col justify-between shrink-0"
      >
        <div className="p-4 space-y-4">
          <div className="pb-3 border-b border-slate-200">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-900">
              Provincial Capitol (Pili)
            </div>
            <div className="text-xs text-slate-600 mt-0.5 font-medium">
              35-LGU Statutory Review Pipeline
            </div>
          </div>

          <nav className="space-y-1.5">
            <button
              type="button"
              onClick={() => setActiveMenu('queue')}
              className={`w-full min-h-[44px] flex items-center justify-between px-3 py-2.5 text-xs font-bold rounded-lg transition-colors ${
                activeMenu === 'queue'
                  ? 'bg-indigo-900 text-white shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Inbox className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Master Review Queue</span>
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-mono ${
                  activeMenu === 'queue'
                    ? 'bg-white/20 text-white'
                    : 'bg-indigo-100 text-indigo-950 border border-indigo-300'
                }`}
              >
                {reviewCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMenu('inspection')}
              className={`w-full min-h-[44px] flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold rounded-lg transition-colors ${
                activeMenu === 'inspection'
                  ? 'bg-indigo-900 text-white shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <FileSearch className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Dual-Pane Inspection</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMenu('signoff')}
              className={`w-full min-h-[44px] flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold rounded-lg transition-colors ${
                activeMenu === 'signoff'
                  ? 'bg-indigo-900 text-white shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Stamp className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>CIS Sign-Off &amp; Seal</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMenu('deficiencies')}
              className={`w-full min-h-[44px] flex items-center justify-between px-3 py-2.5 text-xs font-bold rounded-lg transition-colors ${
                activeMenu === 'deficiencies'
                  ? 'bg-indigo-900 text-white shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Correction Recovery</span>
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-mono ${
                  activeMenu === 'deficiencies'
                    ? 'bg-white/20 text-white'
                    : 'bg-red-100 text-red-950 border border-red-400'
                }`}
              >
                {flaggedCount}
              </span>
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-700 space-y-1">
          <div className="font-bold text-slate-900">Acting Capitol Role</div>
          <div>{currentUser?.name}</div>
          <div className="font-mono text-slate-600">{currentUser?.title}</div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {activeMenu === 'queue' && (
          <Screen2CapitolMasterQueue
            onSelectDocket={(id) => {
              setActiveDocketId(id);
              setActiveMenu('inspection');
            }}
          />
        )}

        {activeMenu === 'inspection' && (
          <Screen2CapitolInspection
            onForwardToSignoff={() => setActiveMenu('signoff')}
            onOpenFlagModal={() => setShowDeficiencyModal(true)}
          />
        )}

        {activeMenu === 'signoff' && (
          <Screen3CapitolSignoff onBackToInspection={() => setActiveMenu('inspection')} />
        )}

        {activeMenu === 'deficiencies' && (
          <Screen4CapitolDeficiencyTracker
            onReinspectDocket={(id) => {
              setActiveDocketId(id);
              setActiveMenu('inspection');
            }}
          />
        )}
      </div>

      {/* Deficiency Return Modal */}
      {showDeficiencyModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="deficiency-modal-title"
          className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl border-2 border-red-600 max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-red-900">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" aria-hidden="true" />
                <h2 id="deficiency-modal-title" className="text-base font-bold">
                  Flag Deficiency &amp; Return Docket {activeDocket.id}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowDeficiencyModal(false)}
                aria-label="Close deficiency modal"
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-800 block">Select Statutory Deficiencies:</span>
              {[
                'Cadastral Boundary overlap / missing surveyor signature',
                'SMV Unit Rate mismatch against Ordinance 2024-08',
                'Missing BIR eCAR notarized acknowledgment page'
              ].map((item) => (
                <label
                  key={item}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedDiscrepancies.includes(item)}
                    onChange={() => handleToggleDiscrepancy(item)}
                    className="w-4 h-4 accent-red-700 rounded"
                  />
                  <span className="font-medium text-slate-900">{item}</span>
                </label>
              ))}
            </div>

            <div>
              <label htmlFor="def-remarks" className="block text-xs font-bold text-slate-800 mb-1">
                Itemized Corrective Instructions for Municipal Assessor
              </label>
              <textarea
                id="def-remarks"
                rows={3}
                placeholder="Describe the boundary, SMV, or documentary deficiency to return to Pasacao..."
                value={discrepancyRemarks}
                onChange={(e) => setDiscrepancyRemarks(e.target.value)}
                className="w-full border border-slate-400 rounded-lg p-2.5 text-xs text-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeficiencyModal(false)}
                className="min-h-[42px] px-4 py-2 border border-slate-400 rounded-lg text-xs font-bold text-slate-800 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!canDispatchDeficiency}
                onClick={handleDispatchDeficiency}
                className="min-h-[42px] px-4 py-2 bg-red-700 hover:bg-red-800 disabled:bg-slate-300 disabled:text-slate-600 text-white rounded-lg text-xs font-bold flex items-center gap-2"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
                <span>Return Docket to LGU Pasacao</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
