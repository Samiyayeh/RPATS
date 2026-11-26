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
import { CollapsibleSidebarLayout } from './layout/CollapsibleSidebarLayout';

const CAPITOL_VIEW_LABELS: Record<'queue' | 'inspection' | 'signoff' | 'deficiencies', string> = {
  queue: 'Master Review Queue',
  inspection: 'Dual-Pane Inspection',
  signoff: 'CIS Sign-Off & Seal',
  deficiencies: 'Correction Recovery'
};

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
  const signoffCount = dockets.filter((d) => d.status === 'Ready for Sign-Off').length;
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
    <>
      <CollapsibleSidebarLayout
        ariaLabel="Provincial Capitol Navigation"
        sidebarSubtitle="Pili Capitol • 35-LGU Review Pipeline"
        activeSectionLabel={CAPITOL_VIEW_LABELS[activeMenu]}
        sidebarContent={
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
              className={`w-full min-h-[44px] flex items-center justify-between px-3 py-2.5 text-xs font-bold rounded-lg transition-colors ${
                activeMenu === 'signoff'
                  ? 'bg-indigo-900 text-white shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Stamp className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>CIS Sign-Off &amp; Seal</span>
              </span>
              {signoffCount > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-mono ${
                    activeMenu === 'signoff'
                      ? 'bg-white/20 text-white'
                      : 'bg-blue-100 text-blue-950 border border-blue-400'
                  }`}
                >
                  {signoffCount}
                </span>
              )}
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
        }
      >
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
      </CollapsibleSidebarLayout>

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
    </>
  );
};
