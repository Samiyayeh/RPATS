import React, { useState } from 'react';
import { Receipt, ShieldCheck, AlertTriangle, X } from 'lucide-react';
import { AssessmentRollRow } from '../types/rpatis';
import { useRpatis } from '../context/RpatisContext';

interface CashierProps {
  row: AssessmentRollRow;
  netDue: number;
  onPaymentSettled?: (orNo: string, clearanceNo: string) => void;
}

export const Screen3TreasuryCashier: React.FC<CashierProps> = ({
  row,
  netDue,
  onPaymentSettled
}) => {
  const { currentUser, recordTreasuryPayment } = useRpatis();
  const [payorName, setPayorName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'LandBank' | 'Check'>('Cash');
  const [tenderedAmount, setTenderedAmount] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const hasTender = tenderedAmount.trim().length > 0;
  const tenderedNum = hasTender ? Number(tenderedAmount) : 0;
  const changeDue = tenderedNum - netDue;
  const isInsufficient = hasTender && tenderedNum < netDue;
  const canConfirmStep1 = payorName.trim().length > 0 && hasTender && tenderedNum >= netDue;
  const candidateOrNo = `OR-2026-${String(993841 + Math.floor(row.assessedValue % 90))}`;
  const candidateClearance = `TC-PAS-2026-0419`;

  const handleFinalConfirm = () => {
    if (!canConfirmStep1) return;
    recordTreasuryPayment(row.tdNo, payorName.trim(), netDue, candidateOrNo, candidateClearance);
    setShowConfirmModal(false);
    onPaymentSettled && onPaymentSettled(candidateOrNo, candidateClearance);
  };

  return (
    <div className="p-5 sm:p-6 space-y-5">
      <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-2xs">
        <h1 className="text-lg font-bold text-slate-900">
          Cashier Payment Window #3 • Form 56 Collection
        </h1>
        <p className="text-xs text-slate-600 mt-0.5">
          Two-step financial settlement required before Official Receipt Form 56 and Tax Clearance issuance.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left: Payment Entry */}
        <div className="xl:col-span-7 bg-white rounded-xl border border-slate-300 shadow-2xs p-6 space-y-5">
          <div className="space-y-3 pb-4 border-b border-slate-200">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              1. Settlement Particulars
            </h2>
            <div>
              <label htmlFor="cashier-payor" className="block text-xs font-bold text-slate-800 mb-1">
                Payor Name
              </label>
              <input
                id="cashier-payor"
                type="text"
                placeholder="Enter payor full name..."
                value={payorName}
                onChange={(e) => setPayorName(e.target.value)}
                className="w-full min-h-[42px] bg-white border border-slate-400 rounded-lg px-3 py-2 text-xs font-bold text-slate-900"
              />
            </div>

            <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg text-xs flex items-center justify-between">
              <span className="font-semibold text-slate-800">
                Full Year 2026 Assessment ({row.tdNo})
              </span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                ₱{netDue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="space-y-3 pb-4 border-b border-slate-200">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              2. Payment Instrument &amp; Tender
            </h2>

            <div className="flex flex-wrap gap-2">
              {(['Cash', 'LandBank', 'Check'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`min-h-[40px] px-4 py-2 text-xs font-bold rounded-lg border ${
                    paymentMethod === method
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-800 border-slate-400 hover:bg-slate-100'
                  }`}
                >
                  {method === 'Cash' && 'Cash Tender'}
                  {method === 'LandBank' && 'LandBank Link.Biz'}
                  {method === 'Check' && "Manager's Check"}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg">
                <span className="text-xs font-bold text-slate-600 uppercase block">Net Payable</span>
                <strong className="text-lg font-extrabold font-mono text-slate-900 block mt-0.5">
                  ₱{netDue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </strong>
              </div>

              <div>
                <label htmlFor="tender-amount" className="block text-xs font-bold text-slate-800 mb-1">
                  Amount Tendered (PHP)
                </label>
                <input
                  id="tender-amount"
                  type="number"
                  min={0}
                  placeholder="Enter amount tendered..."
                  value={tenderedAmount}
                  onChange={(e) => setTenderedAmount(e.target.value)}
                  className="w-full min-h-[44px] bg-white border border-slate-400 rounded-lg px-3 py-2 text-lg font-mono font-bold text-slate-900"
                />
              </div>
            </div>

            <div
              className={`p-3.5 rounded-lg flex items-center justify-between font-mono ${
                isInsufficient
                  ? 'bg-red-50 border-2 border-red-600 text-red-950'
                  : 'bg-slate-900 text-white'
              }`}
            >
              <span className="text-xs font-sans font-bold uppercase">
                {!hasTender ? 'Change Due:' : isInsufficient ? 'Insufficient Tender:' : 'Change Due:'}
              </span>
              <strong className="text-xl font-extrabold">
                {hasTender ? `₱${changeDue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}` : '—'}
              </strong>
            </div>
          </div>

          {/* Step 1 Button (Opens 2-Step Confirmation Modal — Finding [6] & WCAG U-03) */}
          <button
            type="button"
            disabled={!canConfirmStep1}
            onClick={() => setShowConfirmModal(true)}
            className="w-full min-h-[48px] bg-emerald-800 hover:bg-emerald-900 disabled:bg-slate-300 disabled:text-slate-600 text-white text-sm font-bold rounded-lg px-5 py-3 flex items-center justify-center gap-2 shadow-sm"
          >
            <Receipt className="w-4 h-4" aria-hidden="true" />
            <span>Step 1: Review Payment &amp; Confirm Settlement</span>
          </button>
        </div>

        {/* Right: Unsettled Draft Receipt Preview with Prominent Draft Watermark (Finding [7]) */}
        <div className="xl:col-span-5 bg-white rounded-xl border border-slate-300 shadow-2xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Form 56 Draft Preview
            </h2>
            <span className="bg-amber-100 text-amber-950 border border-amber-500 text-xs font-bold px-2.5 py-0.5 rounded">
              UNSETTLED DRAFT
            </span>
          </div>

          <div className="relative border-2 border-dashed border-amber-500 bg-slate-50 rounded-xl p-5 text-xs font-mono space-y-3 overflow-hidden">
            {/* Finding [7]: Explicit Draft Watermark so preview cannot be mistaken for an issued receipt */}
            <div
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
            >
              <span className="text-2xl font-black text-amber-700/20 -rotate-12 tracking-widest border-4 border-amber-700/20 px-4 py-1 rounded">
                DRAFT PREVIEW • NOT SETTLED
              </span>
            </div>

            <div className="text-center border-b border-slate-300 pb-2 font-sans relative z-10">
              <div className="font-bold text-slate-900">MUNICIPALITY OF PASACAO</div>
              <div className="text-slate-700 font-semibold">
                ACCOUNTABLE FORM NO. 56 (DRAFT PREVIEW)
              </div>
            </div>

            <div className="space-y-1.5 relative z-10 text-slate-900">
              <div>Candidate OR Serial: <strong>{candidateOrNo}</strong></div>
              <div>Date: March 18, 2026</div>
              <div>Payor: <strong className="font-sans">{payorName || 'Pending Entry'}</strong></div>
              <div>TD No.: <strong>{row.tdNo}</strong> (PIN {row.pin})</div>
              <div>
                Net Amount: <strong>₱{netDue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</strong>
              </div>
              <div>Method: {paymentMethod}</div>
            </div>

            <div className="pt-3 border-t border-slate-300 text-right font-sans relative z-10">
              <div className="font-bold text-slate-900">{currentUser?.name}</div>
              <div className="text-slate-600">{currentUser?.title}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Step 2: Explicit Financial Confirmation Modal (Finding [6] & WCAG U-03) */}
      {showConfirmModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cashier-confirm-title"
          className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl border-2 border-slate-900 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-slate-900">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" aria-hidden="true" />
                <h2 id="cashier-confirm-title" className="text-base font-bold">
                  Step 2: Confirm Final Financial Settlement
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                aria-label="Cancel confirmation"
                className="p-1 rounded hover:bg-slate-100 text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              This action permanently records payment in the Municipal Treasury Ledger, issues{' '}
              <strong className="font-mono">{candidateOrNo}</strong>, and generates Tax Clearance{' '}
              <strong className="font-mono">{candidateClearance}</strong>.
            </p>

            <div className="bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-600">Payor:</span>
                <strong className="text-slate-900">{payorName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Net Tax Settled:</span>
                <strong className="font-mono text-slate-900">
                  ₱{netDue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Tendered / Change:</span>
                <strong className="font-mono text-emerald-800">
                  ₱{tenderedNum.toFixed(2)} / ₱{changeDue.toFixed(2)}
                </strong>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="min-h-[42px] px-4 py-2 border border-slate-400 rounded-lg text-xs font-bold text-slate-800 hover:bg-slate-100"
              >
                Back to Edit
              </button>
              <button
                type="button"
                onClick={handleFinalConfirm}
                className="min-h-[42px] px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                <span>Confirm &amp; Issue Form 56</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
