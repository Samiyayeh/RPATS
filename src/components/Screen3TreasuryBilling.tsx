import React, { useState } from 'react';
import { ArrowRight, Info, Search } from 'lucide-react';
import { AssessmentRollRow } from '../types/rpatis';
import { useRpatis } from '../context/RpatisContext';
import { StatusChip } from './common/StatusChip';

const BILLING_ROLL_STATUS_ORDER: Record<AssessmentRollRow['paymentStatus'], number> = {
  Unpaid: 1,
  Partial: 2,
  Paid: 3
};

interface BillingCalculatorProps {
  row: AssessmentRollRow;
  onSelectRow?: (tdNo: string) => void;
  onProceedToCashier?: (netDue: number) => void;
}

export const Screen3TreasuryBilling: React.FC<BillingCalculatorProps> = ({
  row,
  onSelectRow,
  onProceedToCashier
}) => {
  const { assessmentRoll } = useRpatis();
  const [billingPeriod, setBillingPeriod] = useState<'Q1' | 'Regular' | 'Delinquent'>('Q1');
  const [rollSearch, setRollSearch] = useState('');

  const collectibleRoll = assessmentRoll.filter((item) => item.paymentStatus !== 'Paid');
  const displayRow =
    row.paymentStatus === 'Paid' && collectibleRoll.length > 0 ? collectibleRoll[0] : row;

  const cleanQuery = rollSearch.trim().toLowerCase();
  const normQuery = cleanQuery.replace(/[-\s]/g, '');

  const sortedRollMatches = collectibleRoll
    .filter((item) => {
      if (!cleanQuery) return true;
      return (
        item.tdNo.toLowerCase().includes(cleanQuery) ||
        item.tdNo.toLowerCase().replace(/[-\s]/g, '').includes(normQuery) ||
        item.pin.toLowerCase().includes(cleanQuery) ||
        item.pin.toLowerCase().replace(/[-\s]/g, '').includes(normQuery) ||
        item.ownerFull.toLowerCase().includes(cleanQuery) ||
        item.ownerMasked.toLowerCase().includes(cleanQuery) ||
        item.barangay.toLowerCase().includes(cleanQuery)
      );
    })
    .sort((a, b) => {
      const diff =
        (BILLING_ROLL_STATUS_ORDER[a.paymentStatus] ?? 99) -
        (BILLING_ROLL_STATUS_ORDER[b.paymentStatus] ?? 99);
      return diff !== 0 ? diff : a.tdNo.localeCompare(b.tdNo, undefined, { numeric: true });
    });

  const basicGross = displayRow.basicRpt;
  const sefGross = displayRow.sef;
  const totalGross = displayRow.totalTaxDue;

  const adjustmentRate = billingPeriod === 'Q1' ? -0.1 : billingPeriod === 'Delinquent' ? 0.04 : 0;
  const basicAdj = Math.round(basicGross * adjustmentRate);
  const sefAdj = Math.round(sefGross * adjustmentRate);
  const totalAdj = basicAdj + sefAdj;
  const netPayable = totalGross + totalAdj;

  return (
    <div className="p-5 sm:p-6 space-y-5">
      <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-slate-600">
            Municipal Treasury &gt; Tax Billing Calculator &gt; {displayRow.tdNo}
          </div>
          <h1 className="text-lg font-bold text-slate-900 mt-0.5">
            Real Property Tax Billing &amp; Dues Calculator (CY 2026)
          </h1>
        </div>

        <button
          type="button"
          onClick={() => {
            if (displayRow.tdNo !== row.tdNo) onSelectRow?.(displayRow.tdNo);
            onProceedToCashier && onProceedToCashier(netPayable);
          }}
          className="min-h-[44px] px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-xs"
        >
          <span>Proceed to Cashier Window #3</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      {/* Two-Column Split: Searchable Roll Picker (Left) + Active Parcel Billing (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left: Searchable & Sorted Assessment Roll List */}
        <div className="xl:col-span-4 bg-white rounded-xl border border-slate-300 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Select Unpaid / Partial Parcel
              </h2>
              <span className="font-mono text-xs font-bold text-slate-600">
                {sortedRollMatches.length} of {collectibleRoll.length}
              </span>
            </div>

            <div>
              <label htmlFor="billing-roll-search" className="sr-only">
                Search Assessment Roll by TD No., PIN, Owner, or Barangay
              </label>
              <div className="relative">
                <Search
                  className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2"
                  aria-hidden="true"
                />
                <input
                  id="billing-roll-search"
                  type="text"
                  value={rollSearch}
                  onChange={(e) => setRollSearch(e.target.value)}
                  placeholder="Search TD No., PIN, Owner, Brgy..."
                  className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900"
                />
              </div>
            </div>
          </div>

          {sortedRollMatches.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-600">
              No unpaid or partial roll records match your search.
            </div>
          ) : (
            <div className="divide-y divide-slate-200 max-h-[560px] overflow-y-auto">
              {sortedRollMatches.map((item) => {
                const isSelected = item.tdNo === displayRow.tdNo;
                return (
                  <button
                    key={item.tdNo}
                    type="button"
                    onClick={() => onSelectRow && onSelectRow(item.tdNo)}
                    className={`w-full text-left p-3.5 transition-colors space-y-1 border-l-4 ${
                      isSelected
                        ? 'bg-emerald-50/70 border-l-emerald-800'
                        : 'bg-white hover:bg-slate-50 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-xs text-slate-900">{item.tdNo}</span>
                      <StatusChip status={item.paymentStatus} />
                    </div>
                    <div className="text-xs font-bold text-slate-900">{item.ownerFull}</div>
                    <div className="flex items-center justify-between text-[11px] text-slate-600 font-mono">
                      <span>
                        Brgy. {item.barangay} • {item.pin}
                      </span>
                      <span className="font-bold text-slate-900">
                        ₱{item.totalTaxDue.toLocaleString()}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Active Property Billing Calculation */}
        <div className="xl:col-span-8 space-y-5">
          {/* Property Profile */}
          <div className="bg-white rounded-xl border border-slate-300 shadow-2xs p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-600 block font-bold uppercase">Taxpayer Name</span>
              <strong className="text-slate-900 text-sm block mt-0.5">{displayRow.ownerFull}</strong>
              <span className="text-slate-600">Masked Roll: {displayRow.ownerMasked}</span>
            </div>
            <div>
              <span className="text-slate-600 block font-bold uppercase">TD No. &amp; PIN</span>
              <span className="font-mono font-bold text-slate-900 block mt-0.5">{displayRow.tdNo}</span>
              <span className="font-mono text-slate-700">PIN {displayRow.pin}</span>
            </div>
            <div>
              <span className="text-slate-600 block font-bold uppercase">Barangay &amp; Class</span>
              <strong className="text-slate-900 block mt-0.5">
                Brgy. {displayRow.barangay}, Pasacao
              </strong>
              <span className="text-slate-700">
                {displayRow.classification} ({displayRow.areaSqm.toLocaleString()} sqm)
              </span>
            </div>
            <div>
              <span className="text-slate-600 block font-bold uppercase">Assessed Value Basis</span>
              <span className="font-mono font-bold text-slate-900 text-sm block mt-0.5">
                ₱{displayRow.assessedValue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-slate-600">
                Statutory Level: {Math.round(displayRow.assessmentLevel * 100)}%
              </span>
            </div>
          </div>

          {/* Explicit Billing Period Control */}
          <div className="bg-white rounded-xl border border-slate-300 shadow-2xs p-4 space-y-2">
            <span className="block text-xs font-bold text-slate-800 uppercase">
              Payment Date &amp; Eligibility Mode (Current System Date: March 18, 2026)
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'Q1', label: 'Q1 Prompt Payment (On/Before Mar 31 — 10% Discount)' },
                { id: 'Regular', label: 'Standard Regular Period (0% Adjustment)' },
                { id: 'Delinquent', label: 'Delinquent / Late (+2%/mo Statutory Interest)' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setBillingPeriod(opt.id as any)}
                  className={`min-h-[40px] px-3.5 py-2 rounded-lg text-xs font-bold border ${
                    billingPeriod === opt.id
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-800 border-slate-400 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Itemized Tax Computation Table */}
          <div className="bg-white rounded-xl border border-slate-300 shadow-2xs overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 uppercase tracking-wider">
                  <th scope="col" className="py-3 px-4">Tax Component</th>
                  <th scope="col" className="py-3 px-4">Statutory Rate</th>
                  <th scope="col" className="py-3 px-4 text-right">Assessed Value</th>
                  <th scope="col" className="py-3 px-4 text-right">Gross Annual Due</th>
                  <th scope="col" className="py-3 px-4 text-right">Discount / Penalty</th>
                  <th scope="col" className="py-3 px-4 text-right">Net Payable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-900">Basic Real Property Tax</td>
                  <td className="py-3.5 px-4 text-slate-700">1.00% (RA 7160)</td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-800">
                    ₱{displayRow.assessedValue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-900">
                    ₱{basicGross.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </td>
                  <td
                    className={`py-3.5 px-4 text-right font-mono font-bold ${
                      basicAdj < 0
                        ? 'text-emerald-800'
                        : basicAdj > 0
                        ? 'text-red-800'
                        : 'text-slate-700'
                    }`}
                  >
                    {basicAdj < 0 ? '-' : basicAdj > 0 ? '+' : ''}₱
                    {Math.abs(basicAdj).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                    ₱{(basicGross + basicAdj).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    Special Education Fund (SEF)
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">1.00% (Sec. 235)</td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-800">
                    ₱{displayRow.assessedValue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-900">
                    ₱{sefGross.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </td>
                  <td
                    className={`py-3.5 px-4 text-right font-mono font-bold ${
                      sefAdj < 0 ? 'text-emerald-800' : sefAdj > 0 ? 'text-red-800' : 'text-slate-700'
                    }`}
                  >
                    {sefAdj < 0 ? '-' : sefAdj > 0 ? '+' : ''}₱
                    {Math.abs(sefAdj).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                    ₱{(sefGross + sefAdj).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr className="bg-slate-900 text-white font-bold">
                  <td colSpan={3} className="py-3.5 px-4 text-right uppercase">
                    TOTAL REAL PROPERTY TAX DUE (CY 2026):
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono">
                    ₱{totalGross.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono">
                    {totalAdj < 0 ? '-' : totalAdj > 0 ? '+' : ''}₱
                    {Math.abs(totalAdj).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-base text-emerald-300">
                    ₱{netPayable.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-300 rounded-xl flex items-start gap-3 text-xs text-blue-950">
            <Info className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="leading-relaxed">
              <strong>Statutory Basis:</strong> Basic RPT (1%) + SEF (1%) = 2% of Assessed Value under Republic Act 7160. Q1 10% Prompt Payment Discount applies strictly to full annual settlements made on or before March 31, 2026.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
