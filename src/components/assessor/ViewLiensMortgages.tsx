import React, { useState } from 'react';
import { Landmark, Receipt, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRpatis } from '../../context/RpatisContext';
import { StatusChip } from '../common/StatusChip';

export const ViewLiensMortgages: React.FC = () => {
  const { assessmentRoll, lienAnnotations, recordLienAnnotation } = useRpatis();

  const [action, setAction] = useState<'Annotate Mortgage' | 'Cancel Mortgage'>('Annotate Mortgage');
  const [selectedTd, setSelectedTd] = useState(assessmentRoll[0]?.tdNo || 'TD-26-0001');
  const [mortgageeBank, setMortgageeBank] = useState('Land Bank of the Philippines');
  const [noticeRefNo, setNoticeRefNo] = useState('');
  const [annotationOrNo, setAnnotationOrNo] = useState('');

  const selectedRow = assessmentRoll.find((r) => r.tdNo === selectedTd) || assessmentRoll[0];
  const canSubmit =
    mortgageeBank.trim().length > 0 &&
    noticeRefNo.trim().length >= 3 &&
    annotationOrNo.trim().length >= 4;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    recordLienAnnotation({
      action,
      tdNo: selectedRow.tdNo,
      pin: selectedRow.pin,
      ownerName: selectedRow.ownerFull,
      mortgageeBank: mortgageeBank.trim(),
      noticeRefNo: noticeRefNo.trim().toUpperCase(),
      annotationOrNo: annotationOrNo.trim().toUpperCase()
    });
    setNoticeRefNo('');
    setAnnotationOrNo('');
  };

  return (
    <div className="p-5 sm:p-6 space-y-5">
      <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-slate-600">
            Municipal Assessor &gt; Frontline Services &gt; Liens &amp; Encumbrances
          </div>
          <h1 className="text-lg font-bold text-slate-900 mt-0.5">
            Cancellation / Annotation of Loans &amp; Mortgages
          </h1>
        </div>
        <div className="text-xs font-semibold bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-lg text-slate-800">
          Charter SLA: <strong>5 minutes</strong> • Fee: <strong>Annotation Fee (Mun. Treasurer OR)</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <form
          onSubmit={handleSubmit}
          className="xl:col-span-5 bg-white rounded-xl border border-slate-300 shadow-2xs p-5 space-y-4"
        >
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-2">
            Record Mortgage Annotation or Cancellation
          </h2>

          <div className="grid grid-cols-2 gap-2">
            {(['Annotate Mortgage', 'Cancel Mortgage'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setAction(mode)}
                className={`min-h-[42px] px-3 py-2 rounded-lg text-xs font-bold border ${
                  action === mode
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-800 border-slate-400 hover:bg-slate-100'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <div>
            <label htmlFor="lien-td" className="block text-xs font-bold text-slate-800 mb-1">
              Collateral Property (Tax Declaration)
            </label>
            <select
              id="lien-td"
              value={selectedTd}
              onChange={(e) => setSelectedTd(e.target.value)}
              className="w-full min-h-[42px] bg-white border border-slate-400 rounded-lg px-3 py-2 text-xs font-mono font-semibold text-slate-900"
            >
              {assessmentRoll.map((r) => (
                <option key={r.tdNo} value={r.tdNo}>
                  {r.tdNo} — {r.ownerFull} (PIN {r.pin})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="lien-bank" className="block text-xs font-bold text-slate-800 mb-1">
              Mortgagee / Financial Institution
            </label>
            <input
              id="lien-bank"
              type="text"
              value={mortgageeBank}
              onChange={(e) => setMortgageeBank(e.target.value)}
              className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-3 py-2 text-xs text-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="lien-notice" className="block text-xs font-bold text-slate-800 mb-1">
                Notice of Mortgage / Cancellation Ref.
              </label>
              <input
                id="lien-notice"
                type="text"
                placeholder="e.g. REM-2026-00512"
                value={noticeRefNo}
                onChange={(e) => setNoticeRefNo(e.target.value)}
                className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-3 py-2 text-xs font-mono text-slate-900"
              />
            </div>

            <div>
              <label htmlFor="lien-or" className="block text-xs font-bold text-slate-800 mb-1">
                Annotation Fee OR No. (Treasury)
              </label>
              <div className="relative">
                <Receipt className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  id="lien-or"
                  type="text"
                  placeholder="e.g. OR-7712315"
                  value={annotationOrNo}
                  onChange={(e) => setAnnotationOrNo(e.target.value)}
                  className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg pl-9 pr-3 py-2 text-xs font-mono font-bold text-slate-900"
                />
              </div>
            </div>
          </div>

          {!canSubmit && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-400 text-xs text-amber-950 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" aria-hidden="true" />
              <span>
                Enter both the Notice of Mortgage/Cancellation reference and the Municipal Treasurer Annotation Fee OR.
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full min-h-[46px] bg-slate-900 hover:bg-black disabled:bg-slate-300 disabled:text-slate-600 text-white font-bold text-xs rounded-lg px-4 py-2.5 flex items-center justify-center gap-2"
          >
            <Landmark className="w-4 h-4 text-emerald-400" aria-hidden="true" />
            <span>Record {action} &amp; Route for Assessor Signing</span>
          </button>
        </form>

        {/* Right: Active Encumbrance & Mortgage Ledger */}
        <div className="xl:col-span-7 bg-white rounded-xl border border-slate-300 shadow-2xs overflow-x-auto">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Property Liens &amp; Mortgage Register ({lienAnnotations.length})
            </h2>
            <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
              Mun. &amp; Prov. Assessor Synchronized
            </span>
          </div>
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-800 border-b border-slate-300">
                <th scope="col" className="py-3 px-4 font-bold">Ref ID</th>
                <th scope="col" className="py-3 px-4 font-bold">TD No. &amp; Owner</th>
                <th scope="col" className="py-3 px-4 font-bold">Mortgagee / Notice</th>
                <th scope="col" className="py-3 px-4 font-bold">Treasury OR</th>
                <th scope="col" className="py-3 px-4 text-center font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {lienAnnotations.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">{row.id}</td>
                  <td className="py-3 px-4">
                    <div className="font-mono font-bold text-slate-900">{row.tdNo}</div>
                    <div className="text-slate-600">{row.ownerName}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{row.mortgageeBank}</div>
                    <div className="font-mono text-slate-600">{row.noticeRefNo}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-800 whitespace-nowrap">{row.annotationOrNo}</td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <StatusChip status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
