import React, { useState } from 'react';
import { ArrowRight, Info } from 'lucide-react';
import { AssessmentRollRow } from '../types/rpatis';

interface BillingCalculatorProps {
  row: AssessmentRollRow;
  onProceedToCashier?: (netDue: number) => void;
}

export const Screen3TreasuryBilling: React.FC<BillingCalculatorProps> = ({
  row,
  onProceedToCashier
}) => {
  // Finding [5]: Explicit Billing Period Selector (No date conflict)
  const [billingPeriod, setBillingPeriod] = useState<'Q1' | 'Regular' | 'Delinquent'>('Q1');

  const basicGross = row.basicRpt;
  const sefGross = row.sef;
  const totalGross = row.totalTaxDue;

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
            Municipal Treasury &gt; Tax Billing Calculator &gt; {row.tdNo}
          </div>
          <h1 className="text-lg font-bold text-slate-900 mt-0.5">
            Real Property Tax Billing &amp; Dues Calculator (CY 2026)
          </h1>
        </div>

        <button
          type="button"
          onClick={() => onProceedToCashier && onProceedToCashier(netPayable)}
          className="min-h-[44px] px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-xs"
        >
          <span>Proceed to Cashier Window #3</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      {/* Property Profile */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-2xs p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-slate-600 block font-bold uppercase">Taxpayer Name</span>
          <strong className="text-slate-900 text-sm block mt-0.5">{row.ownerFull}</strong>
          <span className="text-slate-600">Masked Roll: {row.ownerMasked}</span>
        </div>
        <div>
          <span className="text-slate-600 block font-bold uppercase">TD No. &amp; PIN</span>
          <span className="font-mono font-bold text-slate-900 block mt-0.5">{row.tdNo}</span>
          <span className="font-mono text-slate-700">PIN {row.pin}</span>
        </div>
        <div>
          <span className="text-slate-600 block font-bold uppercase">Barangay &amp; Class</span>
          <strong className="text-slate-900 block mt-0.5">Brgy. {row.barangay}, Pasacao</strong>
          <span className="text-slate-700">
            {row.classification} ({row.areaSqm.toLocaleString()} sqm)
          </span>
        </div>
        <div>
          <span className="text-slate-600 block font-bold uppercase">Assessed Value Basis</span>
          <span className="font-mono font-bold text-slate-900 text-sm block mt-0.5">
            ₱{row.assessedValue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-slate-600">Statutory Level: {Math.round(row.assessmentLevel * 100)}%</span>
        </div>
      </div>

      {/* Explicit Billing Period Control (Finding [5]) */}
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
                ₱{row.assessedValue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </td>
              <td className="py-3.5 px-4 text-right font-mono text-slate-900">
                ₱{basicGross.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </td>
              <td
                className={`py-3.5 px-4 text-right font-mono font-bold ${
                  basicAdj < 0 ? 'text-emerald-800' : basicAdj > 0 ? 'text-red-800' : 'text-slate-700'
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
              <td className="py-3.5 px-4 font-bold text-slate-900">Special Education Fund (SEF)</td>
              <td className="py-3.5 px-4 text-slate-700">1.00% (Sec. 235)</td>
              <td className="py-3.5 px-4 text-right font-mono text-slate-800">
                ₱{row.assessedValue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
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
  );
};
