import React, { useState } from 'react';
import { Send, Search, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { useRpatis } from '../context/RpatisContext';
import { DocketStatus } from '../types/rpatis';
import { StatusChip } from './common/StatusChip';

const STATUS_SORT_ORDER: Record<DocketStatus, number> = {
  'Needs Signature': 1,
  Flagged: 2,
  'At Capitol': 3,
  'Under Technical Review': 4,
  'Ready for Sign-Off': 5,
  Approved: 6,
  Paid: 7,
  Draft: 8
};

export const ViewEndorsementQueue: React.FC = () => {
  const { dockets, endorseDocketsToCapitol } = useRpatis();
  const [activeTab, setActiveTab] = useState<'All' | 'Needs Signature' | 'Under Technical Review' | 'Flagged' | 'Approved'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastTransmittedCount, setLastTransmittedCount] = useState(0);

  const pasacaoDockets = dockets.filter((d) => d.lgu === 'Pasacao');

  const filteredDockets = pasacaoDockets
    .filter((d) => {
      if (activeTab !== 'All' && d.status !== activeTab) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          d.id.toLowerCase().includes(q) ||
          d.pin.toLowerCase().includes(q) ||
          d.owner.toLowerCase().includes(q) ||
          d.tdNo.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      const diff = (STATUS_SORT_ORDER[a.status] ?? 99) - (STATUS_SORT_ORDER[b.status] ?? 99);
      return diff !== 0 ? diff : a.id.localeCompare(b.id, undefined, { numeric: true });
    });

  const eligibleSelected = selectedIds.filter((id) => {
    const doc = pasacaoDockets.find((d) => d.id === id);
    return doc && doc.status === 'Needs Signature';
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleBatchTransmit = () => {
    if (eligibleSelected.length === 0) return;
    setLastTransmittedCount(eligibleSelected.length);
    endorseDocketsToCapitol(eligibleSelected);
    setSelectedIds([]);
    setShowSuccessModal(true);
  };

  return (
    <div className="p-5 sm:p-6 space-y-5">
      {/* Header & Deliberate Batch Scope Controls (Findings [13, 14]) */}
      <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900">
            Provincial Endorsement &amp; Capitol Queue (Pasacao → Pili)
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Select eligible dockets for encrypted transmission to the Camarines Sur Provincial Capitol in Pili.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800">
            Destination: <strong>Provincial Capitol, Pili</strong> • Selected:{' '}
            <span className="font-mono font-bold text-slate-900">{eligibleSelected.length}</span>
          </div>

          <button
            type="button"
            disabled={eligibleSelected.length === 0}
            onClick={handleBatchTransmit}
            className="min-h-[44px] bg-slate-900 hover:bg-black disabled:bg-slate-300 disabled:text-slate-600 text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors shadow-xs"
          >
            <Send className="w-4 h-4" aria-hidden="true" />
            <span>Transmit {eligibleSelected.length} Eligible Docket(s) to Pili</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs + Persistent Search Label (Finding [26]) */}
      <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-2xs flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {(['All', 'Needs Signature', 'Under Technical Review', 'Flagged', 'Approved'] as const).map((tab) => {
            const count =
              tab === 'All'
                ? pasacaoDockets.length
                : pasacaoDockets.filter((d) => d.status === tab).length;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`min-h-[40px] px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  activeTab === tab
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                }`}
              >
                {tab} ({count})
              </button>
            );
          })}
        </div>

        <div className="w-full sm:w-80">
          <label htmlFor="endorsement-search" className="block text-xs font-bold text-slate-800 mb-1">
            Filter Endorsement Dockets
          </label>
          <div className="relative">
            <Search
              className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              id="endorsement-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Docket #, PIN, or Owner Name..."
              className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Responsive Semantic Table (Findings [3, 4, 13, 14]) */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-2xs overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 uppercase tracking-wider">
              <th scope="col" className="py-3 px-4 w-12">Select</th>
              <th scope="col" className="py-3 px-4 whitespace-nowrap">Docket ID</th>
              <th scope="col" className="py-3 px-4 whitespace-nowrap">PIN</th>
              <th scope="col" className="py-3 px-4 whitespace-nowrap">Declarant / Owner</th>
              <th scope="col" className="py-3 px-4 whitespace-nowrap">Classification</th>
              <th scope="col" className="py-3 px-4 text-right whitespace-nowrap">Assessed Value</th>
              <th scope="col" className="py-3 px-4 text-center whitespace-nowrap">Status</th>
              <th scope="col" className="py-3 px-4 whitespace-nowrap">Eligibility Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredDockets.map((row) => {
              const isEligible = row.status === 'Needs Signature';
              const isChecked = selectedIds.includes(row.id) && isEligible;
              return (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4">
                    <input
                      type="checkbox"
                      aria-label={`Select docket ${row.id} for batch transmission`}
                      disabled={!isEligible}
                      checked={isChecked}
                      onChange={() => toggleSelect(row.id)}
                      className="w-4 h-4 accent-slate-900 rounded disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                    />
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">{row.id}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap">{row.pin}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">{row.owner}</td>
                  <td className="py-3.5 px-4 text-slate-800 whitespace-nowrap">
                    {row.classification} ({row.areaSqm.toLocaleString()} sqm)
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                    ₱{row.assessedValue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <StatusChip status={row.status} />
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-xs">
                    {isEligible ? (
                      <span className="text-emerald-800 font-semibold">Eligible for Pili dispatch</span>
                    ) : row.status === 'Flagged' ? (
                      <span className="text-red-800 font-semibold inline-flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                        Excluded — Resolve deficiency first
                      </span>
                    ) : (
                      <span className="text-slate-600 font-medium">Already transmitted / completed</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Peak-End Rule Celebratory Transmission Modal */}
      {showSuccessModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="batch-modal-title"
          className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl border-2 border-emerald-600 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" aria-hidden="true" />
              </div>
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                aria-label="Close confirmation modal"
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>
              <h2 id="batch-modal-title" className="text-lg font-bold text-slate-900">
                Encrypted Batch Transmitted to Pili Capitol
              </h2>
              <p className="text-sm text-slate-700 mt-1 leading-relaxed">
                <strong>{lastTransmittedCount} assessment docket(s)</strong> have been securely bundled (AES-256) and routed directly into the Camarines Sur Provincial Review Queue—bypassing physical courier transit.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowSuccessModal(false)}
              className="w-full min-h-[44px] bg-slate-900 hover:bg-black text-white font-bold text-sm rounded-lg"
            >
              Return to Endorsement Queue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
