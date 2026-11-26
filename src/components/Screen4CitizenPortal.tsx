import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  ClipboardCheck,
  ArrowRight,
  Check,
  AlertTriangle,
  Shield
} from 'lucide-react';
import { useRpatis } from '../context/RpatisContext';
import { StatusChip } from './common/StatusChip';

type ServiceChecklistKey =
  | 'transfer_standard'
  | 'transfer_dar'
  | 'transfer_ejs'
  | 'certifications'
  | 'liens'
  | 'validation_id';

const CHARTER_CHECKLISTS: Record<
  ServiceChecklistKey,
  { title: string; responseTime: string; fees: string; items: string[] }
> = {
  transfer_standard: {
    title: 'Transfer of Property — Standard Residential / Agricultural',
    responseTime: '15 working days (faster via RPAT-IOSS Capitol sync)',
    fees: 'Transfer Tax (Prov. Treasurer) + Socialized Housing / Certification Fees',
    items: [
      'Notarized Deed of Conveyance / Deed of Absolute Sale',
      'Current Copy of Tax Declaration & Certified True Copy of TD',
      'Tax Payment Certification / Transfer Tax Payment (Provincial Treasurer)',
      'Certification of Non-Improvement (Provincial & Municipal Offices)',
      'Certification as to Latest and Effectivity of Tax Declaration',
      'Duplicate Copy of Title (Electronic Copy from ROD Camarines Sur, if any)',
      'DAR Clearance & Barangay Agrarian Reform Chairman (BARC) Certification',
      'Affidavit of Buyer & Seller + Sketch Plan',
      'Certification of Landholdings (Buyer & Seller, Provincial/Municipal)',
      'BIR Capital Gains Tax, Documentary Stamp Tax & CAR',
      'TIN Nos. of Buyer and Seller + Register of Deeds (ROD) Approval — Naga City'
    ]
  },
  transfer_dar: {
    title: 'Transfer of DAR Covered Properties (EP / CLOA)',
    responseTime: '15 working days',
    fees: 'Transfer Tax & Applicable Certification Fees',
    items: [
      'Emancipation Patent (EP) and/or Certificate of Land Ownership Award (CLOA)',
      'Master List of Beneficiaries',
      'Land Bank (LBP) Certification of Full Payment of Farmer Beneficiary (FB)',
      'Parcellary Map',
      'Letter Request from Municipal Agrarian Reform Office (MARO)',
      'Tax Payment Certification (or Statement of Delinquency)'
    ]
  },
  transfer_ejs: {
    title: 'Extra-Judicial Settlement of Property with Deed of Sale',
    responseTime: '15 working days',
    fees: 'Transfer Tax (Prov. Treasurer) + Estate / DST / CGT (BIR)',
    items: [
      'Notarized Extra-Judicial Settlement of Property with Deed of Sale',
      'Death Certificate of Declared Owner',
      'Landholdings Certifications from Provincial Assessor’s Office',
      'Certified True Copy of Tax Declaration (at the time of death)',
      'Certification of Non-Improvement',
      'Tax Payment Certification (from 1945 to present)',
      'Certification of Effectivity of Latest Tax Declaration',
      'Publication in Local Newspaper for 3 Consecutive Weeks',
      'Transfer Tax & BIR Payments (DST, Capital Gains Tax, Estate Tax)',
      'DAR Clearance, TIN Nos. of Parties, ROD Approval & Brgy. Sites Titling (MOPA)'
    ]
  },
  certifications: {
    title: 'Issuance of Certifications & Certified True Copies (CTC)',
    responseTime: '15 minutes',
    fees: 'Certification Fee (Official Receipt at Municipal Treasurer’s Office)',
    items: [
      'Proof of Ownership (Tax Declaration or Title Copy)',
      'SPA or Written Authorization from Owner (if representative)',
      'Payment of Certification Fee at Municipal Treasurer’s Office (Official Receipt)'
    ]
  },
  liens: {
    title: 'Cancellation / Annotation of Loans & Mortgage',
    responseTime: '5 minutes (+ Treasury fee payment & Assessor signing)',
    fees: 'Annotation Fee (Official Receipt at Municipal Treasurer’s Office)',
    items: [
      'Notice of Mortgage or Cancellation of Mortgage from Bank/Lender',
      'Annotation Fee Official Receipt (Municipal Treasurer’s Office)'
    ]
  },
  validation_id: {
    title: 'Validation of Tax Declaration & Property Identification',
    responseTime: '5–10 minutes (1 day upon schedule if Ocular Inspection needed)',
    fees: 'NONE (Free Statutory Service)',
    items: [
      'Letter Request (for Validation of Tax Declaration under Sec. 197–198 RA 7160)',
      'Tax Declaration to be Validated',
      'Legal Document or Lot Information (for Unidentified Property Verification)'
    ]
  }
};

export const Screen4CitizenPortal: React.FC = () => {
  const { dockets } = useRpatis();
  const [activeTab, setActiveTab] = useState<'tracker' | 'checklist'>('tracker');
  const [trackingInput, setTrackingInput] = useState('');
  const [searchedCode, setSearchedCode] = useState('');

  const [checklistKey, setChecklistKey] = useState<ServiceChecklistKey>('transfer_standard');
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  const matchedDocket = searchedCode.trim()
    ? dockets.find(
        (d) =>
          d.id.toLowerCase() === searchedCode.trim().toLowerCase() ||
          d.tdNo.toLowerCase() === searchedCode.trim().toLowerCase() ||
          d.pin.toLowerCase() === searchedCode.trim().toLowerCase()
      )
    : undefined;

  const currentStage = matchedDocket
    ? matchedDocket.status === 'Paid'
      ? 5
      : matchedDocket.status === 'Approved' || matchedDocket.status === 'Ready for Sign-Off'
      ? 4
      : matchedDocket.status === 'Under Technical Review' ||
        matchedDocket.status === 'At Capitol' ||
        matchedDocket.status === 'Flagged'
      ? 3
      : 2
    : 0;

  const activeChecklist = CHARTER_CHECKLISTS[checklistKey];
  const checkedCount = activeChecklist.items.filter((item) => checkedItems.includes(item)).length;
  const readyPct = Math.round((checkedCount / activeChecklist.items.length) * 100);

  const toggleChecklistItem = (item: string) => {
    setCheckedItems((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingInput.trim()) {
      setSearchedCode(trackingInput.trim());
    }
  };

  return (
    <div className="p-5 sm:p-8 bg-slate-50 flex-1 w-full flex flex-col justify-between space-y-6">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Pasacao Citizen Real Property Portal
          </h1>
          <p className="text-sm text-slate-700 max-w-2xl mx-auto">
            Verify official Municipal Assessor requirements before visiting Municipal Hall and track your property assessment across Pasacao Assessor, Pili Capitol, and Municipal Treasury.
          </p>

          <div className="inline-flex bg-white p-1.5 rounded-xl border border-slate-300 shadow-2xs gap-1.5 mt-3">
            <button
              type="button"
              onClick={() => setActiveTab('tracker')}
              className={`min-h-[44px] px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors ${
                activeTab === 'tracker'
                  ? 'bg-teal-800 text-white'
                  : 'text-slate-800 hover:bg-slate-100'
              }`}
            >
              <Search className="w-4 h-4" aria-hidden="true" />
              <span>1. Live Application Tracker</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('checklist')}
              className={`min-h-[44px] px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors ${
                activeTab === 'checklist'
                  ? 'bg-teal-800 text-white'
                  : 'text-slate-800 hover:bg-slate-100'
              }`}
            >
              <ClipboardCheck className="w-4 h-4" aria-hidden="true" />
              <span>2. Citizen&apos;s Charter Requirements Checklist</span>
            </button>
          </div>
        </div>

        {/* TAB 1: LIVE TRACKER */}
        {activeTab === 'tracker' && (
          <div className="space-y-5">
            <form
              onSubmit={handleTrackSubmit}
              className="bg-white p-5 rounded-2xl border border-slate-300 shadow-2xs space-y-3"
            >
              <label htmlFor="citizen-tracking-input" className="block text-sm font-bold text-slate-900">
                Enter Docket Tracking Code, Tax Declaration No., or Property Index Number (PIN)
              </label>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  id="citizen-tracking-input"
                  type="text"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  placeholder="Enter your Tracking Code, TD No., or PIN..."
                  className="flex-1 min-h-[46px] bg-white border border-slate-400 rounded-lg px-4 py-2.5 text-sm font-mono font-bold text-slate-900"
                />
                <button
                  type="submit"
                  className="min-h-[46px] bg-slate-900 hover:bg-black text-white font-bold text-sm px-6 py-2.5 rounded-lg flex items-center justify-center gap-2"
                >
                  <span>Track Docket</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </form>

            {!searchedCode && (
              <div className="bg-white rounded-2xl border border-slate-300 shadow-2xs p-8 text-center text-sm text-slate-600">
                Enter your Tracking Code, Tax Declaration No., or Property Index Number above to view real-time assessment milestones.
              </div>
            )}

            {searchedCode && !matchedDocket && (
              <div
                role="alert"
                className="bg-red-50 rounded-2xl border-2 border-red-500 p-6 text-sm text-red-950 font-semibold flex items-center gap-3"
              >
                <AlertTriangle className="w-5 h-5 text-red-700 shrink-0" aria-hidden="true" />
                <span>
                  No assessment docket found matching <strong className="font-mono">{searchedCode}</strong>. Please verify your Tracking Code or PIN with the Pasacao Assessor front desk.
                </span>
              </div>
            )}

            {matchedDocket && (
            <div className="bg-white rounded-2xl border border-slate-300 shadow-sm p-6 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold bg-slate-100 text-slate-900 px-2.5 py-1 rounded border border-slate-300">
                      {matchedDocket.id}
                    </span>
                    <StatusChip status={matchedDocket.status} size="md" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 pt-1">
                    {matchedDocket.ownerMasked}{' '}
                    <span className="text-xs font-normal text-slate-600">(RA 10173 Privacy Masked)</span>
                  </h2>
                  <p className="text-xs text-slate-700">
                    {matchedDocket.lotNo} • {matchedDocket.barangay} ({matchedDocket.classification},{' '}
                    {matchedDocket.areaSqm.toLocaleString()} sqm)
                  </p>
                </div>

                <div className="text-left sm:text-right text-xs space-y-1">
                  <div className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-lg font-bold text-slate-900">
                    <Clock className="w-4 h-4 text-teal-700" aria-hidden="true" />
                    <span>Target Turnaround: &lt; 24 Hours</span>
                  </div>
                  <div className="text-slate-600 font-mono">Submitted: {matchedDocket.submittedAt}</div>
                </div>
              </div>

              {matchedDocket.status === 'Flagged' && (
                <div
                  role="alert"
                  className="p-4 rounded-xl bg-red-50 border-2 border-red-500 text-xs text-red-950 flex items-start gap-2.5"
                >
                  <AlertTriangle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <div className="font-bold text-sm">Action Needed: Capitol Returned Docket for Revision</div>
                    <p className="mt-1">
                      {matchedDocket.deficiencies[0]?.message ||
                        'Please coordinate with the Pasacao Municipal Assessor front desk for document revision.'}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  5-Stage Inter-Office Synchronization Progress
                </h3>

                {[
                  {
                    step: 1,
                    title: '1. Front Desk Pre-Screening & Intake',
                    desc: 'Conveyance deed, title, and mandatory requirements verified at Pasacao Assessor.'
                  },
                  {
                    step: 2,
                    title: '2. Municipal Appraisal & Recommending Approval',
                    desc: `SMV valuation computed (Assessed Value: ₱${matchedDocket.assessedValue.toLocaleString()}) and bundled for Capitol.`
                  },
                  {
                    step: 3,
                    title: '3. Provincial Capitol Technical Review (Pili)',
                    desc: 'Examiner inspects cadastral survey non-overlap and Provincial SMV Ordinance 2024-08 compliance.'
                  },
                  {
                    step: 4,
                    title: '4. Provincial Assessor SHA-256 Sign-Off & CIS Issuance',
                    desc: matchedDocket.cisSerial
                      ? `Approved & sealed under ${matchedDocket.cisSerial}. Synced to Pasacao Treasury.`
                      : 'Awaiting Provincial Assessor cryptographic signature and CIS generation.'
                  },
                  {
                    step: 5,
                    title: '5. Municipal Treasury Settlement & Tax Clearance',
                    desc: matchedDocket.orNo
                      ? `Settled under ${matchedDocket.orNo}. Tax Clearance ${matchedDocket.taxClearanceNo} released.`
                      : 'Ready for Form 56 RPT payment and instant Electronic Tax Clearance release.'
                  }
                ].map((item) => {
                  const completed = currentStage > item.step || (currentStage === 5 && item.step === 5);
                  const active = currentStage === item.step && currentStage < 5;
                  return (
                    <div
                      key={item.step}
                      className={`p-4 rounded-xl border-2 flex items-start gap-3.5 ${
                        completed
                          ? 'bg-emerald-50/60 border-emerald-500'
                          : active
                          ? 'bg-amber-50 border-amber-500'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          completed
                            ? 'bg-emerald-700 text-white'
                            : active
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-300 text-slate-800'
                        }`}
                      >
                        {completed ? <Check className="w-4 h-4" /> : item.step}
                      </div>
                      <div className="text-xs space-y-0.5">
                        <div className="font-bold text-slate-900 text-sm">{item.title}</div>
                        <p className="text-slate-700 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            )}
          </div>
        )}

        {/* TAB 2: COMPLETE CITIZEN'S CHARTER REQUIREMENTS CHECKLIST */}
        {activeTab === 'checklist' && (
          <div className="bg-white rounded-2xl border border-slate-300 shadow-sm p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Official Municipal Assessor Requirements Checklist
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Based on the Camarines Sur Municipal Assessor Citizen&apos;s Charter. Check all items before visiting Municipal Hall.
                </p>
              </div>

              <div className="text-right">
                <div className="text-xs font-bold text-slate-700">
                  Readiness: <span className="font-mono text-teal-800">{readyPct}%</span> ({checkedCount}/
                  {activeChecklist.items.length})
                </div>
                <div className="w-44 bg-slate-200 h-2.5 rounded-full mt-1 overflow-hidden">
                  <div className="bg-teal-700 h-full transition-all" style={{ width: `${readyPct}%` }} />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="charter-service-select" className="block text-xs font-bold text-slate-800 mb-1.5">
                Select Frontline Service Transaction
              </label>
              <select
                id="charter-service-select"
                value={checklistKey}
                onChange={(e) => {
                  setChecklistKey(e.target.value as ServiceChecklistKey);
                  setCheckedItems([]);
                }}
                className="w-full min-h-[44px] bg-white border border-slate-400 rounded-lg px-3.5 py-2 text-sm font-bold text-slate-900"
              >
                {(Object.keys(CHARTER_CHECKLISTS) as ServiceChecklistKey[]).map((key) => (
                  <option key={key} value={key}>
                    {CHARTER_CHECKLISTS[key].title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 border border-slate-300 rounded-xl p-3.5">
              <div>
                <span className="font-bold text-slate-600 uppercase block">Charter Response Time</span>
                <span className="font-bold text-slate-900">{activeChecklist.responseTime}</span>
              </div>
              <div>
                <span className="font-bold text-slate-600 uppercase block">Applicable Taxes / Fees</span>
                <span className="font-bold text-slate-900">{activeChecklist.fees}</span>
              </div>
            </div>

            <div className="space-y-2">
              {activeChecklist.items.map((req) => {
                const isChecked = checkedItems.includes(req);
                return (
                  <label
                    key={req}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-colors ${
                      isChecked
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
                        : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-900'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleChecklistItem(req)}
                      className="w-5 h-5 accent-teal-800 rounded shrink-0"
                    />
                    <span className="text-sm font-medium">{req}</span>
                  </label>
                );
              })}
            </div>

            {readyPct === 100 && (
              <div
                role="status"
                className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-600 text-sm font-bold text-emerald-950 flex items-center gap-2.5"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" aria-hidden="true" />
                <span>
                  All official Citizen&apos;s Charter requirements verified! You are ready to submit your request at the Municipal Assessor Front Desk.
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="max-w-4xl mx-auto w-full pt-4 border-t border-slate-300 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-slate-700" aria-hidden="true" />
          <span>RPAT-IOSS • Local Government Unit of Pasacao, Camarines Sur</span>
        </div>
        <span>Compliant with RA 7160, RA 10173 &amp; WCAG 2.2 AA</span>
      </footer>
    </div>
  );
};
