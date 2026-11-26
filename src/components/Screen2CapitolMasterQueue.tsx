import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useRpatis } from '../context/RpatisContext';
import { DocketStatus } from '../types/rpatis';
import { StatusChip } from './common/StatusChip';

const CAPITOL_STATUS_ORDER: Record<DocketStatus, number> = {
  'Under Technical Review': 1,
  'At Capitol': 2,
  'Ready for Sign-Off': 3,
  Flagged: 4,
  'Needs Signature': 5,
  Draft: 6,
  Approved: 7,
  Paid: 8
};

interface MasterQueueProps {
  onSelectDocket?: (docketId: string) => void;
}

export const Screen2CapitolMasterQueue: React.FC<MasterQueueProps> = ({ onSelectDocket }) => {
  const { dockets } = useRpatis();
  const [lguFilter, setLguFilter] = useState<'All' | 'Pasacao' | 'Canaman'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = dockets
    .filter((d) => {
      if (lguFilter !== 'All' && d.lgu !== lguFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          d.id.toLowerCase().includes(q) ||
          d.capitolId.toLowerCase().includes(q) ||
          d.pin.toLowerCase().includes(q) ||
          d.owner.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      const diff = (CAPITOL_STATUS_ORDER[a.status] ?? 99) - (CAPITOL_STATUS_ORDER[b.status] ?? 99);
      return diff !== 0 ? diff : a.capitolId.localeCompare(b.capitolId, undefined, { numeric: true });
    });

  const pasacaoCount = dockets.filter((d) => d.lgu === 'Pasacao').length;
  const canamanCount = dockets.filter((d) => d.lgu === 'Canaman').length;
  const approvedCount = dockets.filter((d) => d.status === 'Approved' || d.status === 'Paid').length;
  const flaggedCount = dockets.filter((d) => d.status === 'Flagged').length;

  return (
    <div className="p-5 sm:p-6 space-y-5">
      {/* Header with Explicit LGU Scope (Findings [17, 18]) */}
      <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-2xs flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-slate-600">
            Provincial Capitol (Pili) &gt; Master Review Queue &gt; Active Scope: {lguFilter === 'All' ? 'All Component LGUs (35)' : `LGU ${lguFilter}`}
          </div>
          <h1 className="text-lg font-bold text-slate-900 mt-0.5">
            Master Provincial Review Queue
          </h1>
        </div>

        <div className="w-full sm:w-80">
          <label htmlFor="capitol-queue-search" className="block text-xs font-bold text-slate-800 mb-1">
            Search Capitol Dockets (ID, PIN, or Owner)
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              id="capitol-queue-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. CAP-PAS-2026-0849 or Dela Cruz"
              className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Exact Count Populations (Finding [18] — No invented totals) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-2xs">
          <div className="text-xs font-bold text-slate-600 uppercase">Total Loaded Dockets</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{dockets.length} Records</div>
          <p className="text-xs text-slate-600 mt-1">Exact live pipeline count</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-2xs">
          <div className="text-xs font-bold text-slate-600 uppercase">Pasacao Pipeline</div>
          <div className="text-2xl font-extrabold text-indigo-900 mt-1">{pasacaoCount} Dockets</div>
          <p className="text-xs text-slate-600 mt-1">Zero physical road courier trips</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-2xs">
          <div className="text-xs font-bold text-slate-600 uppercase">Flagged Deficiencies</div>
          <div className="text-2xl font-extrabold text-red-700 mt-1">{flaggedCount} Returned</div>
          <p className="text-xs text-red-800 mt-1">Awaiting LGU corrective upload</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-2xs">
          <div className="text-xs font-bold text-slate-600 uppercase">CIS Approved / Settled</div>
          <div className="text-2xl font-extrabold text-emerald-800 mt-1">{approvedCount} Cleared</div>
          <p className="text-xs text-emerald-800 mt-1">Synced to LGU Treasury</p>
        </div>
      </div>

      {/* LGU Scope Tabs */}
      <div className="bg-white p-3 rounded-xl border border-slate-300 shadow-2xs flex flex-wrap items-center gap-2">
        {[
          { key: 'All', label: `All Active LGUs (${dockets.length})` },
          { key: 'Pasacao', label: `Pasacao (${pasacaoCount})` },
          { key: 'Canaman', label: `Canaman (${canamanCount})` }
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setLguFilter(tab.key as any)}
            className={`min-h-[40px] px-3.5 py-2 text-xs font-bold rounded-lg transition-colors ${
              lguFilter === tab.key
                ? 'bg-indigo-900 text-white'
                : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Semantic Queue Table */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-2xs overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 uppercase tracking-wider">
              <th scope="col" className="py-3 px-4 whitespace-nowrap">Capitol Docket</th>
              <th scope="col" className="py-3 px-4 whitespace-nowrap">Municipality</th>
              <th scope="col" className="py-3 px-4 whitespace-nowrap">PIN</th>
              <th scope="col" className="py-3 px-4 whitespace-nowrap">Declarant / Owner</th>
              <th scope="col" className="py-3 px-4 whitespace-nowrap">Transaction</th>
              <th scope="col" className="py-3 px-4 text-center whitespace-nowrap">Status</th>
              <th scope="col" className="py-3 px-4 text-right whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filtered.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50">
                <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                  {row.capitolId}
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className="bg-slate-100 border border-slate-300 text-slate-900 font-bold px-2.5 py-0.5 rounded">
                    {row.lgu}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap">{row.pin}</td>
                <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">{row.owner}</td>
                <td className="py-3.5 px-4 text-slate-800 whitespace-nowrap">{row.transactionType}</td>
                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                  <StatusChip status={row.status} />
                </td>
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => onSelectDocket && onSelectDocket(row.id)}
                    className="min-h-[36px] px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white rounded-lg font-bold text-xs"
                  >
                    Inspect Docket
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
