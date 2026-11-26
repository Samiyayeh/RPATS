import React, { useState } from 'react';
import { ShieldCheck, Hash, MapPin, CheckCircle2, AlertTriangle, Calendar, Search } from 'lucide-react';
import { useRpatis } from '../../context/RpatisContext';
import { AssessmentRollRow } from '../../types/rpatis';
import { StatusChip } from '../common/StatusChip';

export const ViewValidationPinId: React.FC = () => {
  const { assessmentRoll, dockets, ocularRequests, scheduleOcularInspection, markOcularVerified, pushToast } =
    useRpatis();
  const [subTab, setSubTab] = useState<'validation' | 'pin' | 'ocular'>('validation');

  // Service 1: TD Validation (by TD No., PIN, or Owner Name)
  const [validateTdInput, setValidateTdInput] = useState('');
  const [letterRequestRef, setLetterRequestRef] = useState('');
  const [multiMatchPrompt, setMultiMatchPrompt] = useState(false);
  const [validatedResult, setValidatedResult] = useState<{
    found: boolean;
    tdNo: string;
    owner?: string;
    pin?: string;
    barangay?: string;
    assessedValue?: number;
    letterRef?: string;
  } | null>(null);

  const cleanValidationQuery = validateTdInput.trim().toLowerCase();
  const normValidationQuery = cleanValidationQuery.replace(/[-\s]/g, '');
  const validationMatches = cleanValidationQuery
    ? assessmentRoll.filter(
        (r) =>
          r.tdNo.toLowerCase().includes(cleanValidationQuery) ||
          r.tdNo.toLowerCase().replace(/[-\s]/g, '').includes(normValidationQuery) ||
          r.pin.toLowerCase().includes(cleanValidationQuery) ||
          r.pin.toLowerCase().replace(/[-\s]/g, '').includes(normValidationQuery) ||
          r.ownerFull.toLowerCase().includes(cleanValidationQuery) ||
          r.ownerMasked.toLowerCase().includes(cleanValidationQuery)
      )
    : [];

  const validateMatchedRow = (match: AssessmentRollRow) => {
    setValidateTdInput(match.tdNo);
    setMultiMatchPrompt(false);
    setValidatedResult({
      found: true,
      tdNo: match.tdNo,
      owner: match.ownerFull,
      pin: match.pin,
      barangay: match.barangay,
      assessedValue: match.assessedValue,
      letterRef: letterRequestRef.trim() || undefined
    });
    pushToast(
      'Tax Declaration Validated',
      `${match.tdNo} (${match.ownerFull}) verified active under RA 7160 Sec. 197–198.`,
      'success'
    );
  };

  // Service 2: PIN / ARP Assignment
  const [barangayCode, setBarangayCode] = useState('01');
  const [sectionCode, setSectionCode] = useState('');
  const [parcelCode, setParcelCode] = useState('');
  const hasPinInputs = sectionCode.trim().length > 0 && parcelCode.trim().length > 0;
  const proposedPin = hasPinInputs ? `041-${barangayCode}-${parcelCode.trim()}` : '';
  const proposedArp = hasPinInputs ? `ARP-PAS-2026-${sectionCode.trim()}${parcelCode.trim()}` : '';
  const pinCollision =
    hasPinInputs &&
    (assessmentRoll.some((r) => r.pin === proposedPin) || dockets.some((d) => d.pin === proposedPin));

  // Service 3: Property Identification & Ocular Inspection
  const [ocRequestor, setOcRequestor] = useState('');
  const [ocLotDesc, setOcLotDesc] = useState('');
  const [ocBarangay, setOcBarangay] = useState('Balogo');
  const [ocDocRef, setOcDocRef] = useState('');
  const [ocDate, setOcDate] = useState('');

  const sortedOcularRequests = [...ocularRequests].sort((a, b) => {
    const oa = a.status === 'Scheduled (1-Day SLA)' ? 1 : 2;
    const ob = b.status === 'Scheduled (1-Day SLA)' ? 1 : 2;
    return oa !== ob ? oa - ob : a.scheduledDate.localeCompare(b.scheduledDate);
  });

  const handleValidateTd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cleanValidationQuery) return;
    const exactTdMatch = assessmentRoll.find(
      (r) =>
        r.tdNo.toLowerCase() === cleanValidationQuery ||
        r.tdNo.toLowerCase().replace(/[-\s]/g, '') === normValidationQuery
    );
    if (exactTdMatch) {
      validateMatchedRow(exactTdMatch);
      return;
    }
    if (validationMatches.length === 1) {
      validateMatchedRow(validationMatches[0]);
      return;
    }
    if (validationMatches.length > 1) {
      setValidatedResult(null);
      setMultiMatchPrompt(true);
      return;
    }
    setMultiMatchPrompt(false);
    setValidatedResult({ found: false, tdNo: validateTdInput.trim() });
  };

  const handleScheduleOcular = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ocRequestor.trim() || !ocLotDesc.trim() || !ocDocRef.trim() || !ocDate) return;
    scheduleOcularInspection({
      requestorName: ocRequestor.trim(),
      lotDescription: ocLotDesc.trim(),
      barangay: ocBarangay,
      legalDocRef: ocDocRef.trim(),
      scheduledDate: ocDate,
      assignedOfficer: 'Liza M. Bañares / Mun. Assessor'
    });
    setOcRequestor('');
    setOcLotDesc('');
    setOcDocRef('');
    setOcDate('');
  };

  return (
    <div className="p-5 sm:p-6 space-y-5">
      <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-slate-600">
            Municipal Assessor &gt; Frontline Services &gt; TD Validation, PIN/ARP &amp; Identification
          </div>
          <h1 className="text-lg font-bold text-slate-900 mt-0.5">
            Tax Declaration Validation, PIN/ARP Assignment &amp; Property Identification
          </h1>
        </div>
        <span className="text-xs font-bold bg-emerald-50 border border-emerald-400 text-emerald-950 px-3 py-1.5 rounded-lg">
          No Fee Required (Free Statutory Frontline Services)
        </span>
      </div>

      {/* 3 Frontline Desk Sub-Tabs */}
      <div className="bg-white p-2 rounded-xl border border-slate-300 shadow-2xs flex flex-wrap gap-2">
        {[
          { id: 'validation', label: '1. Validation of Tax Declaration (10 mins)', icon: ShieldCheck },
          { id: 'pin', label: '2. Assign PIN / ARP Numbers (5 mins)', icon: Hash },
          { id: 'ocular', label: '3. Property Identification & Ocular Inspection', icon: MapPin }
        ].map((tab) => {
          const Icon = tab.icon;
          const active = subTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubTab(tab.id as any)}
              className={`min-h-[42px] px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors ${
                active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: VALIDATION OF TAX DECLARATION (Service 1) */}
      {subTab === 'validation' && (
        <div className="bg-white rounded-xl border border-slate-300 shadow-2xs p-6 max-w-3xl space-y-5">
          <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 border border-slate-200 p-3.5 rounded-lg">
            <strong>Statutory Purpose:</strong> Promulgates Sections 197 &amp; 198 of Real Property Taxation (Art. 288, IRR, Local Government Code of 1991 / R.A. 7160). Requirements: <strong>Letter Request</strong> + <strong>Tax Declaration to be validated</strong>. Fees: <strong>NONE</strong>.
          </div>

          <form onSubmit={handleValidateTd} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="val-td-no" className="block text-xs font-bold text-slate-800 mb-1">
                  Tax Declaration No. or Owner Name
                </label>
                <div className="relative">
                  <Search
                    className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2"
                    aria-hidden="true"
                  />
                  <input
                    id="val-td-no"
                    type="text"
                    placeholder="e.g. TD-26-0001 or Juan M. Dela Cruz"
                    value={validateTdInput}
                    onChange={(e) => {
                      setValidateTdInput(e.target.value);
                      setValidatedResult(null);
                      setMultiMatchPrompt(false);
                    }}
                    className="w-full min-h-[42px] bg-white border border-slate-400 rounded-lg pl-9 pr-3 py-2 text-xs font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="val-letter-ref" className="block text-xs font-bold text-slate-800 mb-1">
                  Letter Request Reference / Date (Optional)
                </label>
                <input
                  id="val-letter-ref"
                  type="text"
                  placeholder="e.g. LR-2026-0318"
                  value={letterRequestRef}
                  onChange={(e) => setLetterRequestRef(e.target.value)}
                  className="w-full min-h-[42px] bg-white border border-slate-400 rounded-lg px-3 py-2 text-xs text-slate-900"
                />
              </div>
            </div>

            {/* Interactive Match Picker when searching by Owner Name, PIN, or partial TD */}
            {cleanValidationQuery.length > 0 &&
              validationMatches.length > 0 &&
              !(validatedResult?.found && validatedResult.tdNo.toLowerCase() === cleanValidationQuery) && (
                <div
                  className={`rounded-xl border p-3 space-y-2 ${
                    multiMatchPrompt
                      ? 'bg-blue-50 border-blue-500'
                      : 'bg-slate-50 border-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-800 flex items-center justify-between gap-2">
                    <span>
                      {multiMatchPrompt
                        ? `Multiple properties match "${validateTdInput.trim()}". Select the exact target TD No. to validate:`
                        : `Matching Property Records (${validationMatches.length}) — click to select target TD No.`}
                    </span>
                  </div>
                  <div className="divide-y divide-slate-200 bg-white rounded-lg border border-slate-300 max-h-56 overflow-y-auto">
                    {validationMatches.map((row) => (
                      <div
                        key={row.tdNo}
                        className="p-2.5 flex flex-wrap items-center justify-between gap-2 hover:bg-slate-50 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-900">
                            {row.ownerFull}{' '}
                            <span className="font-mono text-blue-800 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded ml-1">
                              {row.tdNo}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-600 font-mono">
                            PIN {row.pin} • Brgy. {row.barangay} ({row.classification}) • AV ₱
                            {row.assessedValue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => validateMatchedRow(row)}
                          className="min-h-[34px] px-3 py-1 bg-slate-900 hover:bg-black text-white rounded-lg font-bold text-xs shrink-0"
                        >
                          Select &amp; Validate
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            <button
              type="submit"
              disabled={!cleanValidationQuery}
              className="min-h-[44px] px-5 py-2.5 bg-slate-900 hover:bg-black disabled:bg-slate-300 disabled:text-slate-600 text-white rounded-lg text-xs font-bold flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              <span>Verify &amp; Stamp Tax Declaration Validated</span>
            </button>
          </form>

          {validatedResult && (
            <div
              role="status"
              className={`p-4 rounded-xl border-2 text-xs space-y-1.5 ${
                validatedResult.found
                  ? 'bg-emerald-50 border-emerald-600 text-emerald-950'
                  : 'bg-red-50 border-red-600 text-red-950'
              }`}
            >
              {validatedResult.found ? (
                <>
                  <div className="font-bold text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700" aria-hidden="true" />
                    <span>VALIDATED ACTIVE TAX DECLARATION — {validatedResult.tdNo}</span>
                  </div>
                  <p>
                    Declared Owner: <strong>{validatedResult.owner}</strong> • PIN:{' '}
                    <span className="font-mono font-bold">{validatedResult.pin}</span> • Brgy.{' '}
                    {validatedResult.barangay} • Assessed Value:{' '}
                    <strong className="font-mono">
                      ₱{validatedResult.assessedValue?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </strong>
                    {validatedResult.letterRef ? (
                      <>
                        {' '}
                        • Letter Ref: <span className="font-mono font-semibold">{validatedResult.letterRef}</span>
                      </>
                    ) : null}
                  </p>
                </>
              ) : (
                <div className="font-bold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-700" aria-hidden="true" />
                  <span>
                    No active record found for &ldquo;{validatedResult.tdNo}&rdquo;. Check Historical Cadastre Vault or verify TD number.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ASSIGNING PIN & ARP NUMBERS (Service 2) */}
      {subTab === 'pin' && (
        <div className="bg-white rounded-xl border border-slate-300 shadow-2xs p-6 max-w-3xl space-y-5">
          <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 border border-slate-200 p-3.5 rounded-lg">
            <strong>Parcel Accounting Control:</strong> Ensures no two parcels of land share the same Property Index Number (PIN) or Assessment of Real Property Number (ARP). Automatically checks for duplicate collisions across all Pasacao cadastre rolls.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="pin-brgy" className="block text-xs font-bold text-slate-800 mb-1">
                Barangay Index Code
              </label>
              <select
                id="pin-brgy"
                value={barangayCode}
                onChange={(e) => setBarangayCode(e.target.value)}
                className="w-full min-h-[42px] bg-white border border-slate-400 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900"
              >
                <option value="01">01 — Balogo</option>
                <option value="02">02 — Caranan</option>
                <option value="03">03 — Dalupaon</option>
                <option value="04">04 — Odicon</option>
                <option value="05">05 — Tinalmud</option>
                <option value="06">06 — Macad</option>
                <option value="07">07 — Cuco</option>
                <option value="08">08 — Itulan</option>
              </select>
            </div>

            <div>
              <label htmlFor="pin-sec" className="block text-xs font-bold text-slate-800 mb-1">
                Section Code
              </label>
              <input
                id="pin-sec"
                type="text"
                maxLength={4}
                placeholder="e.g. 004"
                value={sectionCode}
                onChange={(e) => setSectionCode(e.target.value)}
                className="w-full min-h-[42px] bg-white border border-slate-400 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900"
              />
            </div>

            <div>
              <label htmlFor="pin-parcel" className="block text-xs font-bold text-slate-800 mb-1">
                Parcel Sequence No.
              </label>
              <input
                id="pin-parcel"
                type="text"
                maxLength={4}
                placeholder="e.g. 099"
                value={parcelCode}
                onChange={(e) => setParcelCode(e.target.value)}
                className="w-full min-h-[42px] bg-white border border-slate-400 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900"
              />
            </div>
          </div>

          <div
            className={`p-4 rounded-xl border-2 flex flex-wrap items-center justify-between gap-4 ${
              !hasPinInputs
                ? 'bg-slate-50 border-slate-300 text-slate-800'
                : pinCollision
                ? 'bg-red-50 border-red-600 text-red-950'
                : 'bg-emerald-50 border-emerald-600 text-emerald-950'
            }`}
          >
            <div className="space-y-1 text-xs">
              <div className="font-mono font-bold text-base">
                {hasPinInputs ? `PIN: ${proposedPin} • ARP: ${proposedArp}` : 'Enter Section Code & Parcel Sequence'}
              </div>
              {!hasPinInputs ? (
                <div className="text-slate-600">
                  Duplicate collision check runs automatically once codes are entered.
                </div>
              ) : pinCollision ? (
                <div className="font-bold flex items-center gap-1.5 text-red-900">
                  <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>DUPLICATE COLLISION DETECTED — PIN {proposedPin} is already assigned to an existing parcel!</span>
                </div>
              ) : (
                <div className="font-semibold flex items-center gap-1.5 text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Unique Parcel Identifier Available — Safe to Assign</span>
                </div>
              )}
            </div>

            <button
              type="button"
              disabled={!hasPinInputs || pinCollision}
              onClick={() => {
                pushToast(
                  'PIN & ARP Assigned',
                  `Reserved unique PIN ${proposedPin} and ${proposedArp} in Pasacao Cadastre Index.`,
                  'success'
                );
                setSectionCode('');
                setParcelCode('');
              }}
              className="min-h-[42px] px-4 py-2 bg-slate-900 hover:bg-black disabled:bg-slate-300 disabled:text-slate-600 text-white rounded-lg text-xs font-bold"
            >
              Reserve &amp; Assign PIN/ARP
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: PROPERTY IDENTIFICATION & OCULAR INSPECTION (Service 3) */}
      {subTab === 'ocular' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          <form
            onSubmit={handleScheduleOcular}
            className="xl:col-span-5 bg-white rounded-xl border border-slate-300 shadow-2xs p-5 space-y-4"
          >
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-2">
              Schedule Property Identification &amp; Ocular Inspection
            </h2>

            <div>
              <label htmlFor="oc-req" className="block text-xs font-bold text-slate-800 mb-1">
                Requestor / Claimant Name
              </label>
              <input
                id="oc-req"
                type="text"
                placeholder="Enter claimant full name..."
                value={ocRequestor}
                onChange={(e) => setOcRequestor(e.target.value)}
                className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-3 py-2 text-xs text-slate-900"
              />
            </div>

            <div>
              <label htmlFor="oc-desc" className="block text-xs font-bold text-slate-800 mb-1">
                Unidentified Lot Location / Description
              </label>
              <input
                id="oc-desc"
                type="text"
                placeholder="e.g. Interior lot beside Brgy. Hall"
                value={ocLotDesc}
                onChange={(e) => setOcLotDesc(e.target.value)}
                className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-3 py-2 text-xs text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="oc-brgy" className="block text-xs font-bold text-slate-800 mb-1">
                  Barangay
                </label>
                <select
                  id="oc-brgy"
                  value={ocBarangay}
                  onChange={(e) => setOcBarangay(e.target.value)}
                  className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-3 py-2 text-xs text-slate-900"
                >
                  {['Balogo', 'Caranan', 'Dalupaon', 'Odicon', 'Tinalmud', 'Macad', 'Cuco', 'Itulan', 'Sta. Rosa del Sur'].map(
                    (b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label htmlFor="oc-date" className="block text-xs font-bold text-slate-800 mb-1">
                  Ocular Inspection Date
                </label>
                <input
                  id="oc-date"
                  type="date"
                  value={ocDate}
                  onChange={(e) => setOcDate(e.target.value)}
                  className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-3 py-2 text-xs font-mono text-slate-900"
                />
              </div>
            </div>

            <div>
              <label htmlFor="oc-doc" className="block text-xs font-bold text-slate-800 mb-1">
                Supporting Legal Document Presented
              </label>
              <input
                id="oc-doc"
                type="text"
                placeholder="e.g. Old Deed / Tax Map / Survey Sketch"
                value={ocDocRef}
                onChange={(e) => setOcDocRef(e.target.value)}
                className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-3 py-2 text-xs text-slate-900"
              />
            </div>

            <button
              type="submit"
              className="w-full min-h-[44px] bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              <span>Schedule 1-Day Ocular Inspection</span>
            </button>
          </form>

          <div className="xl:col-span-7 bg-white rounded-xl border border-slate-300 shadow-2xs overflow-x-auto">
            <div className="p-4 border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-800">
              Scheduled Property Identification &amp; Ocular Queue ({ocularRequests.length})
            </div>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-800 border-b border-slate-300">
                  <th scope="col" className="py-3 px-4 font-bold">Ref ID</th>
                  <th scope="col" className="py-3 px-4 font-bold">Requestor &amp; Lot</th>
                  <th scope="col" className="py-3 px-4 font-bold">Schedule</th>
                  <th scope="col" className="py-3 px-4 text-center font-bold">Status</th>
                  <th scope="col" className="py-3 px-4 text-right font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sortedOcularRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">{req.id}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{req.requestorName}</div>
                      <div className="text-slate-600">
                        Brgy. {req.barangay} — {req.lotDescription}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-800 whitespace-nowrap">{req.scheduledDate}</td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <StatusChip status={req.status} />
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {req.status !== 'Verified & Identified' && (
                        <button
                          type="button"
                          onClick={() => markOcularVerified(req.id)}
                          className="min-h-[34px] px-3 py-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold"
                        >
                          Mark Identified
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
