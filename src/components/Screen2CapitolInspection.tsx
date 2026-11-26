import React, { useEffect, useState } from 'react';
import { ZoomIn, ZoomOut, AlertTriangle, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRpatis } from '../context/RpatisContext';
import { DocketStatus } from '../types/rpatis';
import { StatusChip } from './common/StatusChip';

const CAPITOL_INSPECTION_ORDER: Record<DocketStatus, number> = {
  'Under Technical Review': 1,
  'At Capitol': 2,
  'Ready for Sign-Off': 3,
  Flagged: 4,
  'Needs Signature': 5,
  Draft: 6,
  Approved: 7,
  Paid: 8
};

interface Screen2InspectionProps {
  onForwardToSignoff?: () => void;
  onOpenFlagModal?: () => void;
}

export const Screen2CapitolInspection: React.FC<Screen2InspectionProps> = ({
  onForwardToSignoff,
  onOpenFlagModal
}) => {
  const { dockets, activeDocketId, setActiveDocketId, forwardDocketToSignoff } = useRpatis();

  const sortedDockets = [...dockets].sort((a, b) => {
    const diff =
      (CAPITOL_INSPECTION_ORDER[a.status] ?? 99) - (CAPITOL_INSPECTION_ORDER[b.status] ?? 99);
    return diff !== 0 ? diff : a.capitolId.localeCompare(b.capitolId, undefined, { numeric: true });
  });

  const activeDocket =
    sortedDockets.find((d) => d.id === activeDocketId) || sortedDockets[0];
  const activeIndex = sortedDockets.findIndex((d) => d.id === activeDocket.id);

  const [activeDocTab, setActiveDocTab] = useState<'survey' | 'deed' | 'ecar' | 'faas'>('survey');
  const [zoomPercent, setZoomPercent] = useState(100);
  const [smvCheck, setSmvCheck] = useState(false);
  const [boundaryCheck, setBoundaryCheck] = useState(false);
  const [taxClearanceCheck, setTaxClearanceCheck] = useState(false);
  const [birEcarCheck, setBirEcarCheck] = useState(false);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    setSmvCheck(false);
    setBoundaryCheck(false);
    setTaxClearanceCheck(false);
    setBirEcarCheck(false);
    setNoteText('');
  }, [activeDocket.id]);

  const hasUnresolvedBlocker =
    !smvCheck || !boundaryCheck || !taxClearanceCheck || !birEcarCheck || activeDocket.status === 'Flagged';

  return (
    <div className="p-5 sm:p-6 space-y-5">
      {/* Top Docket Banner + Queued Docket Selector */}
      <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base font-bold text-slate-900 font-mono">
                Inspection Docket #{activeDocket.capitolId}
              </h1>
              <StatusChip status={activeDocket.status} />
            </div>
            <p className="text-xs text-slate-700 mt-1">
              LGU {activeDocket.lgu} Endorsement • Declarant: <strong>{activeDocket.owner}</strong> • PIN{' '}
              <span className="font-mono font-semibold">{activeDocket.pin}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenFlagModal}
              className="min-h-[42px] px-3.5 py-2 border-2 border-red-600 text-red-800 bg-red-50 hover:bg-red-100 rounded-lg text-xs font-bold flex items-center gap-1.5"
            >
              <AlertTriangle className="w-4 h-4" aria-hidden="true" />
              <span>Flag Discrepancy</span>
            </button>

            <button
              type="button"
              disabled={hasUnresolvedBlocker}
              onClick={() => {
                forwardDocketToSignoff(activeDocket.id);
                onForwardToSignoff?.();
              }}
              className="min-h-[42px] px-4 py-2 bg-indigo-900 hover:bg-indigo-950 disabled:bg-slate-300 disabled:text-slate-600 text-white text-xs font-bold rounded-lg flex items-center gap-2"
            >
              <span>Forward to Provincial Assessor Sign-Off</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Inline Queued Docket Switcher */}
        <div className="pt-3 border-t border-slate-200 flex flex-wrap items-end justify-between gap-3">
          <div className="flex-1 min-w-[260px]">
            <label
              htmlFor="inspection-docket-select"
              className="block text-xs font-bold text-slate-700 mb-1"
            >
              Select Queued Docket ({activeIndex + 1} of {sortedDockets.length})
            </label>
            <select
              id="inspection-docket-select"
              value={activeDocket.id}
              onChange={(e) => setActiveDocketId(e.target.value)}
              className="w-full min-h-[40px] bg-slate-50 border border-slate-400 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-900"
            >
              {sortedDockets.map((d) => (
                <option key={d.id} value={d.id}>
                  [{d.status}] {d.capitolId} — {d.owner} (LGU {d.lgu})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              aria-label="Previous queued docket"
              disabled={activeIndex <= 0}
              onClick={() => activeIndex > 0 && setActiveDocketId(sortedDockets[activeIndex - 1].id)}
              className="min-h-[40px] px-3 py-1.5 border border-slate-400 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white rounded-lg text-xs font-bold text-slate-800 inline-flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              <span>Prev</span>
            </button>
            <button
              type="button"
              aria-label="Next queued docket"
              disabled={activeIndex >= sortedDockets.length - 1}
              onClick={() =>
                activeIndex < sortedDockets.length - 1 &&
                setActiveDocketId(sortedDockets[activeIndex + 1].id)
              }
              className="min-h-[40px] px-3 py-1.5 border border-slate-400 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white rounded-lg text-xs font-bold text-slate-800 inline-flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {hasUnresolvedBlocker && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-amber-50 border-2 border-amber-500 text-xs text-amber-950 font-semibold"
        >
          Forwarding Held: Complete all 4 statutory compliance checks and resolve any flagged blockers before forwarding to the Provincial Assessor.
        </div>
      )}

      {/* Dual-Pane Workspace (Findings [19, 20]) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left: Synchronized Document & Survey Viewer */}
        <div className="xl:col-span-7 bg-white rounded-xl border border-slate-300 shadow-2xs overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-300 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'survey', label: 'Cadastral Survey Plan' },
                { id: 'deed', label: 'Deed of Sale' },
                { id: 'ecar', label: 'BIR eCAR' },
                { id: 'faas', label: 'Municipal FAAS' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveDocTab(tab.id as any)}
                  className={`min-h-[36px] px-3 py-1.5 text-xs font-bold rounded-lg ${
                    activeDocTab === tab.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-300 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 text-xs font-mono">
              <button
                type="button"
                aria-label="Zoom out document"
                onClick={() => setZoomPercent((z) => Math.max(75, z - 25))}
                className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded border border-slate-400 bg-white hover:bg-slate-100"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="px-2 font-bold text-slate-900">{zoomPercent}%</span>
              <button
                type="button"
                aria-label="Zoom in document"
                onClick={() => setZoomPercent((z) => Math.min(150, z + 25))}
                className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded border border-slate-400 bg-white hover:bg-slate-100"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-slate-900 p-6 min-h-[420px] flex items-center justify-center overflow-auto">
            <div
              style={{ transform: `scale(${zoomPercent / 100})`, transformOrigin: 'center' }}
              className="w-full max-w-lg transition-transform"
            >
              {activeDocTab === 'survey' ? (
                <div className="border-2 border-emerald-400 bg-slate-950 rounded-xl p-5 font-mono text-xs text-slate-200 space-y-4">
                  <div className="flex justify-between">
                    <div>
                      <div className="font-bold text-emerald-300">{activeDocket.lotNo}</div>
                      <div>{activeDocket.barangay}</div>
                    </div>
                    <div className="text-right">
                      <div>Scale: 1:500m</div>
                      <div>Tie Line: BLLM No. 1</div>
                    </div>
                  </div>
                  <div className="border-2 border-emerald-400 bg-emerald-950/40 rounded-lg p-6 text-center space-y-1">
                    <div className="text-emerald-200 font-bold text-sm">
                      AREA: {activeDocket.areaSqm.toLocaleString()} SQ.M
                    </div>
                    <div className="text-slate-300">
                      Classification: {activeDocket.classification} ({activeDocket.assessmentLevel}%)
                    </div>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-800 text-slate-300">
                    <span>Geodetic Engr: M. R. Salcedo</span>
                    <span>DENR Region V LMS</span>
                  </div>
                </div>
              ) : (
                <div className="bg-white text-slate-900 p-6 rounded-xl shadow-md space-y-3 text-xs">
                  <div className="font-bold text-sm border-b border-slate-200 pb-2">
                    ATTACHED EVIDENCE: {activeDocTab.toUpperCase()} — {activeDocket.id}
                  </div>
                  <p className="leading-relaxed">
                    Certified digital copy submitted by Municipal Assessor ({activeDocket.lgu}) for declarant{' '}
                    <strong>{activeDocket.owner}</strong> (PIN <span className="font-mono">{activeDocket.pin}</span>).
                    Assessed Value: <strong className="font-mono">₱{activeDocket.assessedValue.toLocaleString()}</strong>.
                  </p>
                  {activeDocTab === 'faas' && (
                    <div className="pt-2 border-t border-slate-200 space-y-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Declared Real Property Kinds (RA 7160)
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {activeDocket.areaSqm > 0 && (
                          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 font-semibold text-slate-800">
                            Land ({activeDocket.classification} • {activeDocket.areaSqm.toLocaleString()} sqm)
                          </span>
                        )}
                        {activeDocket.building && (
                          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 font-semibold text-slate-800">
                            Building ({activeDocket.building.structuralType} • {activeDocket.building.floorAreaSqm} sqm)
                          </span>
                        )}
                        {activeDocket.otherStructure && (
                          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 font-semibold text-slate-800">
                            Other Structure ({activeDocket.otherStructure.structureType})
                          </span>
                        )}
                        {activeDocket.machinery && (
                          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 font-semibold text-slate-800">
                            Machinery ({activeDocket.machinery.description || activeDocket.machinery.machineryClass})
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Statutory Compliance Checklist */}
        <div className="xl:col-span-5 bg-white rounded-xl border border-slate-300 shadow-2xs p-5 space-y-4">
          <div className="border-b border-slate-200 pb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Provincial Statutory Verification Checklist
            </h2>
            <p className="text-xs text-slate-600">Item-level evidence state review</p>
          </div>

          <div className="space-y-2.5 text-xs">
            {[
              {
                checked: smvCheck,
                set: setSmvCheck,
                title: '1. Provincial SMV Ordinance 2024-08 Compliance',
                desc: `Unit value ₱${activeDocket.unitValue.toLocaleString()}/sqm verified for ${activeDocket.classification}.`
              },
              {
                checked: boundaryCheck,
                set: setBoundaryCheck,
                title: '2. Cadastral Boundary & Non-Overlap Check',
                desc: `Cross-checked ${activeDocket.lotNo} against provincial cadastral index.`
              },
              {
                checked: taxClearanceCheck,
                set: setTaxClearanceCheck,
                title: '3. Prior Real Property Tax Clearance',
                desc: 'Zero prior-year delinquencies verified with Municipal Treasury.'
              },
              {
                checked: birEcarCheck,
                set: setBirEcarCheck,
                title: '4. BIR eCAR & Conveyance Deed Completeness',
                desc: 'BIR RDO 65 eCAR and notarized conveyance verified.'
              }
            ].map((item) => (
              <label
                key={item.title}
                className="flex items-start gap-3 p-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={(e) => item.set(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-indigo-900 rounded shrink-0"
                />
                <div>
                  <div className="font-bold text-slate-900">{item.title}</div>
                  <p className="text-slate-600 mt-0.5">{item.desc}</p>
                </div>
              </label>
            ))}
          </div>

          <div>
            <label htmlFor="examiner-notes" className="block text-xs font-bold text-slate-800 mb-1">
              Examiner Audit Notes
            </label>
            <textarea
              id="examiner-notes"
              rows={3}
              placeholder="Enter examiner audit findings or verification remarks..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="w-full bg-white border border-slate-400 rounded-lg p-2.5 text-xs text-slate-900"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
