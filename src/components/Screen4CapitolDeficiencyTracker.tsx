import React, { useState } from 'react';
import { Search, ArrowRight, MessageSquare } from 'lucide-react';
import { useRpatis } from '../context/RpatisContext';
import { StatusChip } from './common/StatusChip';

interface DeficiencyTrackerProps {
  onReinspectDocket?: (docketId: string) => void;
}

export const Screen4CapitolDeficiencyTracker: React.FC<DeficiencyTrackerProps> = ({
  onReinspectDocket
}) => {
  const { dockets } = useRpatis();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>('PAS-2026-0847');

  const flaggedDockets = dockets.filter((d) => {
    if (d.status !== 'Flagged' && d.deficiencies.length === 0) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        d.id.toLowerCase().includes(q) ||
        d.lgu.toLowerCase().includes(q) ||
        d.owner.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="p-5 sm:p-6 space-y-5">
      <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-2xs flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900">
            Correction &amp; Deficiency Recovery Pipeline
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Track returned dossiers, examiner revision threads, and LGU re-uploads before clearing for sign-off.
          </p>
        </div>

        <div className="w-full sm:w-72">
          <label htmlFor="deficiency-search" className="block text-xs font-bold text-slate-800 mb-1">
            Search Flagged Dockets
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              id="deficiency-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Docket ID, LGU, or Owner..."
              className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {flaggedDockets.map((row) => {
          const isOpen = expandedId === row.id;
          return (
            <div key={row.id} className="bg-white rounded-xl border border-slate-300 shadow-2xs overflow-hidden">
              <div className="p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-sm text-slate-900">{row.capitolId}</span>
                    <span className="bg-slate-100 border border-slate-300 text-slate-900 text-xs font-bold px-2 py-0.5 rounded">
                      LGU {row.lgu}
                    </span>
                    <StatusChip status={row.status} />
                  </div>
                  <div className="text-xs text-slate-700">
                    Declarant: <strong>{row.owner}</strong> • Examiner:{' '}
                    <strong>{row.examinerName || 'Unassigned'}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isOpen ? null : row.id)}
                    className="min-h-[40px] px-3.5 py-2 border border-slate-400 text-slate-900 rounded-lg text-xs font-bold hover:bg-slate-100 flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-4 h-4" aria-hidden="true" />
                    <span>{isOpen ? 'Hide Thread' : `Revision Thread (${row.deficiencies.length})`}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onReinspectDocket && onReinspectDocket(row.id)}
                    className="min-h-[40px] px-4 py-2 bg-indigo-900 hover:bg-indigo-950 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                  >
                    <span>Re-inspect Docket</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {isOpen && (
                <div className="border-t border-slate-200 bg-slate-50 p-4 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Audit &amp; Revision History
                  </div>
                  {row.deficiencies.map((note) => (
                    <div
                      key={note.id}
                      className="bg-white p-3.5 rounded-lg border border-slate-300 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900">
                          {note.author} <span className="font-normal text-slate-600">({note.role})</span>
                        </span>
                        <span className="font-mono text-slate-600">{note.date}</span>
                      </div>
                      <p className="text-slate-800 leading-relaxed">{note.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
