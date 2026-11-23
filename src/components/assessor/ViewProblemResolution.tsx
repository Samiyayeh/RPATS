import React, { useState } from 'react';
import { Wrench, AlertTriangle, Send, CheckCircle2 } from 'lucide-react';
import { useRpatis } from '../../context/RpatisContext';
import { StatusChip } from '../common/StatusChip';

export const ViewProblemResolution: React.FC = () => {
  const {
    dockets,
    problemTickets,
    logAssessmentProblem,
    resolveAssessmentProblem,
    resubmitFlaggedDocket
  } = useRpatis();

  const [refNo, setRefNo] = useState('');
  const [category, setCategory] = useState<
    'Valuation Query' | 'Duplicate PIN / Boundary' | 'Ownership Correction' | 'Other Assessment Concern'
  >('Valuation Query');
  const [clientName, setClientName] = useState('');
  const [description, setDescription] = useState('');
  const [resubmitNotes, setResubmitNotes] = useState<Record<string, string>>({});

  const flaggedPasacao = dockets.filter((d) => d.lgu === 'Pasacao' && d.status === 'Flagged');

  const handleLogTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refNo.trim() || !clientName.trim() || !description.trim()) return;
    logAssessmentProblem({
      referenceNo: refNo.trim().toUpperCase(),
      category,
      clientName: clientName.trim(),
      description: description.trim()
    });
    setRefNo('');
    setClientName('');
    setDescription('');
  };

  return (
    <div className="p-5 sm:p-6 space-y-6">
      <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-slate-600">
            Municipal Assessor &gt; Assessment Problem &amp; Deficiency Resolution
          </div>
          <h1 className="text-lg font-bold text-slate-900 mt-0.5">
            Resolving Problems on Assessment, Appraisal &amp; Capitol Deficiencies
          </h1>
        </div>
        <span className="text-xs font-semibold bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-lg text-slate-800">
          Charter SLA: <strong>10 minutes</strong> (Client Assessment Concerns)
        </span>
      </div>

      {/* Section 1: Capitol-Returned Deficiencies Requiring Pasacao Re-Upload */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-red-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" aria-hidden="true" />
            <span>Dockets Returned by Provincial Capitol (Pili) ({flaggedPasacao.length})</span>
          </h2>
        </div>

        {flaggedPasacao.length === 0 ? (
          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-300 text-xs font-semibold text-emerald-950 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" aria-hidden="true" />
            <span>All Capitol deficiencies have been resolved and resubmitted.</span>
          </div>
        ) : (
          <div className="space-y-4">
            {flaggedPasacao.map((d) => (
              <div key={d.id} className="p-4 rounded-xl border-2 border-red-300 bg-red-50/40 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-mono font-bold text-sm text-slate-900">{d.id}</span>{' '}
                    <span className="text-xs text-slate-700 font-semibold">— {d.owner} (PIN {d.pin})</span>
                  </div>
                  <StatusChip status={d.status} />
                </div>

                {d.deficiencies.map((note) => (
                  <div key={note.id} className="bg-white p-3 rounded-lg border border-red-200 text-xs text-slate-800">
                    <div className="font-bold text-red-900">
                      {note.author} ({note.date}):
                    </div>
                    <p className="mt-0.5">{note.message}</p>
                  </div>
                ))}

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    aria-label={`Corrective action note for ${d.id}`}
                    placeholder="Describe amended geodetic sketch or corrected document uploaded..."
                    value={resubmitNotes[d.id] || ''}
                    onChange={(e) => setResubmitNotes((prev) => ({ ...prev, [d.id]: e.target.value }))}
                    className="flex-1 min-h-[42px] bg-white border border-slate-400 rounded-lg px-3 py-2 text-xs text-slate-900"
                  />
                  <button
                    type="button"
                    disabled={!resubmitNotes[d.id]?.trim()}
                    onClick={() => {
                      const note = resubmitNotes[d.id]?.trim();
                      if (!note) return;
                      resubmitFlaggedDocket(d.id, note);
                      setResubmitNotes((prev) => ({ ...prev, [d.id]: '' }));
                    }}
                    className="min-h-[42px] px-4 py-2 bg-slate-900 hover:bg-black disabled:bg-slate-300 disabled:text-slate-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shrink-0"
                  >
                    <Send className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                    <span>Upload Fix &amp; Resubmit to Pili</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Frontline Client Assessment & Appraisal Problem Log */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <form
          onSubmit={handleLogTicket}
          className="xl:col-span-5 bg-white rounded-xl border border-slate-300 shadow-2xs p-5 space-y-4"
        >
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-2">
            Log New Client Assessment / Appraisal Problem
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="prob-ref" className="block text-xs font-bold text-slate-800 mb-1">
                TD No. / PIN Reference
              </label>
              <input
                id="prob-ref"
                type="text"
                placeholder="e.g. TD-26-0005"
                value={refNo}
                onChange={(e) => setRefNo(e.target.value)}
                className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-3 py-2 text-xs font-mono text-slate-900"
              />
            </div>

            <div>
              <label htmlFor="prob-cat" className="block text-xs font-bold text-slate-800 mb-1">
                Problem Category
              </label>
              <select
                id="prob-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-3 py-2 text-xs text-slate-900"
              >
                <option>Valuation Query</option>
                <option>Duplicate PIN / Boundary</option>
                <option>Ownership Correction</option>
                <option>Other Assessment Concern</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="prob-client" className="block text-xs font-bold text-slate-800 mb-1">
              Taxpayer / Client Name
            </label>
            <input
              id="prob-client"
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-3 py-2 text-xs text-slate-900"
            />
          </div>

          <div>
            <label htmlFor="prob-desc" className="block text-xs font-bold text-slate-800 mb-1">
              Issue Description
            </label>
            <textarea
              id="prob-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border border-slate-400 rounded-lg p-2.5 text-xs text-slate-900"
            />
          </div>

          <button
            type="submit"
            className="w-full min-h-[44px] bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2"
          >
            <Wrench className="w-4 h-4 text-emerald-400" aria-hidden="true" />
            <span>Log Assessment Problem Ticket</span>
          </button>
        </form>

        <div className="xl:col-span-7 bg-white rounded-xl border border-slate-300 shadow-2xs overflow-x-auto">
          <div className="p-4 border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-800">
            Assessment &amp; Appraisal Resolution Log ({problemTickets.length})
          </div>
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-800 border-b border-slate-300">
                <th scope="col" className="py-3 px-4 font-bold">Ticket</th>
                <th scope="col" className="py-3 px-4 font-bold">Client &amp; Concern</th>
                <th scope="col" className="py-3 px-4 text-center font-bold">Status</th>
                <th scope="col" className="py-3 px-4 text-right font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {problemTickets.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-mono font-bold text-slate-900">{t.id}</div>
                    <div className="font-mono text-slate-600">{t.referenceNo}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">
                      {t.clientName} <span className="font-normal text-slate-600">({t.category})</span>
                    </div>
                    <p className="text-slate-700 mt-0.5">{t.description}</p>
                    {t.resolutionNotes && (
                      <p className="text-emerald-800 font-semibold mt-1">Resolved: {t.resolutionNotes}</p>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <StatusChip status={t.status === 'Resolved' ? 'Approved' : 'Pending'} />
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    {t.status === 'Open' && (
                      <button
                        type="button"
                        onClick={() =>
                          resolveAssessmentProblem(
                            t.id,
                            'Verified against Provincial SMV Ordinance 2024-08 and explained to taxpayer.'
                          )
                        }
                        className="min-h-[34px] px-3 py-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold"
                      >
                        Mark Resolved
                      </button>
                    )}
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
