import React, { useState } from 'react';
import { Search, FileEdit } from 'lucide-react';
import { useRpatis } from '../../context/RpatisContext';
import { AssessmentRollRow, PropertyClassification } from '../../types/rpatis';
import { StatusChip } from '../common/StatusChip';

const ROLL_STATUS_ORDER: Record<AssessmentRollRow['paymentStatus'], number> = {
  Unpaid: 1,
  Partial: 2,
  Paid: 3
};

interface ViewAssessmentRollProps {
  onOpenPropertyInFaas?: (row: AssessmentRollRow) => void;
}

export const ViewAssessmentRoll: React.FC<ViewAssessmentRollProps> = ({ onOpenPropertyInFaas }) => {
  const { assessmentRoll } = useRpatis();
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState<'All' | PropertyClassification>('All');

  const filtered = assessmentRoll
    .filter((row) => {
      if (classFilter !== 'All' && row.classification !== classFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const norm = q.replace(/[-\s]/g, '');
        return (
          row.tdNo.toLowerCase().includes(q) ||
          row.tdNo.toLowerCase().replace(/[-\s]/g, '').includes(norm) ||
          row.pin.toLowerCase().includes(q) ||
          row.pin.toLowerCase().replace(/[-\s]/g, '').includes(norm) ||
          row.ownerFull.toLowerCase().includes(q) ||
          row.ownerMasked.toLowerCase().includes(q) ||
          row.barangay.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      const diff = (ROLL_STATUS_ORDER[a.paymentStatus] ?? 99) - (ROLL_STATUS_ORDER[b.paymentStatus] ?? 99);
      return diff !== 0 ? diff : a.tdNo.localeCompare(b.tdNo, undefined, { numeric: true });
    });

  const totalMarket = assessmentRoll.reduce((sum, r) => sum + r.marketValue, 0);
  const totalAssessed = assessmentRoll.reduce((sum, r) => sum + r.assessedValue, 0);
  const totalAnnualTax = assessmentRoll.reduce((sum, r) => sum + r.totalTaxDue, 0);

  return (
    <div className="p-5 sm:p-6 space-y-5">
      <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-slate-600">
            Municipal Assessor &gt; Master Property Records (Pasacao Assessment Roll)
          </div>
          <h1 className="text-lg font-bold text-slate-900 mt-0.5">
            All Registered Property Records — Municipality of Pasacao
          </h1>
        </div>
        <span className="text-xs font-bold bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-lg text-slate-800">
          RA 7160 Master Cadastre Register
        </span>
      </div>

      {/* KPI Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-2xs">
          <div className="text-xs font-bold text-slate-600 uppercase">Total Registered Parcels</div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">
            {assessmentRoll.length} Properties
          </div>
          <p className="text-xs text-slate-600 mt-1">Active CY 2026 Assessment Roll</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-2xs">
          <div className="text-xs font-bold text-slate-600 uppercase">Total Market Value</div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">
            ₱{totalMarket.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-600 mt-1">Provincial SMV Ordinance 2024-08</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-2xs">
          <div className="text-xs font-bold text-slate-600 uppercase">Total Assessed Value</div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">
            ₱{totalAssessed.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-600 mt-1">Taxable assessment base</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-2xs">
          <div className="text-xs font-bold text-slate-600 uppercase">Annual RPT Collectible (2%)</div>
          <div className="text-2xl font-extrabold text-emerald-800 font-mono mt-1">
            ₱{totalAnnualTax.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-600 mt-1">1% Basic RPT + 1% SEF</p>
        </div>
      </div>

      {/* Classification Tabs + Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-2xs flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {(['All', 'Residential', 'Agricultural', 'Commercial'] as const).map((cls) => {
            const count =
              cls === 'All'
                ? assessmentRoll.length
                : assessmentRoll.filter((r) => r.classification === cls).length;
            return (
              <button
                key={cls}
                type="button"
                onClick={() => setClassFilter(cls)}
                className={`min-h-[40px] px-3.5 py-2 text-xs font-bold rounded-lg transition-colors ${
                  classFilter === cls
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                }`}
              >
                {cls} ({count})
              </button>
            );
          })}
        </div>

        <div className="w-full sm:w-96">
          <label htmlFor="assessor-roll-search" className="block text-xs font-bold text-slate-800 mb-1">
            Search Property Records (TD No., PIN, Owner Name, or Barangay)
          </label>
          <div className="relative">
            <Search
              className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              id="assessor-roll-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter TD No., PIN, Owner Name, or Barangay..."
              className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Full-Width Semantic Property Records Table */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-2xs overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 uppercase tracking-wider">
              <th scope="col" className="py-3 px-3 whitespace-nowrap">TD No. / PIN</th>
              <th scope="col" className="py-3 px-3 whitespace-nowrap">Declared Owner &amp; Barangay</th>
              <th scope="col" className="py-3 px-3 whitespace-nowrap">Classification &amp; Area</th>
              <th scope="col" className="py-3 px-3 text-right whitespace-nowrap">Market Value</th>
              <th scope="col" className="py-3 px-3 text-right whitespace-nowrap">Assessed Value</th>
              <th scope="col" className="py-3 px-3 text-center whitespace-nowrap">Tax Status</th>
              <th scope="col" className="py-3 px-3 text-right whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 px-4 text-center text-slate-600 font-medium">
                  No property records match your filter.
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr key={row.tdNo} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="font-mono font-bold text-slate-900">{row.tdNo}</div>
                    <div className="font-mono text-[11px] text-slate-600">{row.pin}</div>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="font-bold text-slate-900">{row.ownerFull}</div>
                    <div className="text-[11px] text-slate-600">Brgy. {row.barangay}, Pasacao</div>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="font-semibold text-slate-900">
                      {row.classification} ({Math.round(row.assessmentLevel * 100)}%)
                    </div>
                    <div className="font-mono text-[11px] text-slate-600">
                      {row.areaSqm.toLocaleString()} sqm @ ₱{row.unitValue.toLocaleString()}/sqm
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-900 whitespace-nowrap">
                    ₱{row.marketValue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                    ₱{row.assessedValue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <StatusChip status={row.paymentStatus} />
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onOpenPropertyInFaas && onOpenPropertyInFaas(row)}
                      className="min-h-[36px] px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-lg font-bold text-xs inline-flex items-center gap-1.5"
                    >
                      <FileEdit className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Open in FAAS</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
