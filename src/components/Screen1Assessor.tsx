import React, { useState } from 'react';
import {
  Calculator,
  FileCheck,
  Archive,
  Layers,
  CheckCircle2,
  Building2,
  Save,
  Send,
  ExternalLink,
  Info,
  Award,
  Landmark,
  ShieldCheck,
  Wrench,
  PlusCircle
} from 'lucide-react';
import { useRpatis } from '../context/RpatisContext';
import { PropertyClassification } from '../types/rpatis';
import { StatusChip } from './common/StatusChip';
import { ViewEndorsementQueue } from './ViewEndorsementQueue';
import { ViewLegacyVault } from './ViewLegacyVault';
import { ViewSmvMatrix } from './ViewSmvMatrix';
import { ViewCertifications } from './assessor/ViewCertifications';
import { ViewLiensMortgages } from './assessor/ViewLiensMortgages';
import { ViewValidationPinId } from './assessor/ViewValidationPinId';
import { ViewProblemResolution } from './assessor/ViewProblemResolution';

const SMV_RATES: Record<PropertyClassification, { subclass: string; unitValue: number; level: number }> = {
  Residential: { subclass: 'R-1 (Residential First Class)', unitValue: 1200, level: 20 },
  Agricultural: { subclass: 'Ag-1 (Irrigated Riceland)', unitValue: 85, level: 40 },
  Commercial: { subclass: 'C-1 (Commercial Strip)', unitValue: 2500, level: 50 }
};

const TRANSFER_TRACKS: Record<'standard' | 'dar' | 'ejs', { label: string; docs: string[] }> = {
  standard: {
    label: 'Standard Transfer (Residential & Agricultural)',
    docs: [
      'Notarized Deed of Conveyance / Deed of Absolute Sale',
      'Current Copy of Tax Declaration & Certified True Copy of TD',
      'Tax Payment Certification / Transfer Tax Payment (Provincial Treasurer)',
      'Certification of Non-Improvement & Effectivity of Latest TD',
      'Duplicate Copy of Title (ROD Camarines Sur) & Sketch Plan',
      'BIR Capital Gains Tax, DST & Certificate Authorizing Registration (CAR)',
      'DAR Clearance & BARC Certification (for Agricultural Land)',
      'TIN Nos. & Affidavit of Buyer and Seller + ROD Approval (Naga City)'
    ]
  },
  dar: {
    label: 'DAR Covered Properties (EP / CLOA)',
    docs: [
      'Emancipation Patent (EP) and/or Certificate of Land Ownership Award (CLOA)',
      'Master List of Beneficiaries',
      'Land Bank (LBP) Certification of Full Payment of Farmer Beneficiary',
      'Parcellary Map',
      'MARO Letter Request for Issuance of Tax Declarations',
      'Tax Payment Certification (or Statement of Delinquency)'
    ]
  },
  ejs: {
    label: 'Extra-Judicial Settlement with Deed of Sale',
    docs: [
      'Notarized Extra-Judicial Settlement of Property with Deed of Sale',
      'Death Certificate of Declared Owner',
      'Landholdings Certification (Provincial Assessor) & CTC of TD at Time of Death',
      'Certification of Non-Improvement & Tax Payment Certification (1945–Present)',
      'Publication in Local Newspaper (3 Consecutive Weeks)',
      'BIR DST, Capital Gains Tax & Estate Tax + Transfer Tax',
      'DAR Clearance, TIN Nos., ROD Approval & Brgy. Sites Titling (MOPA)'
    ]
  }
};

type AssessorSubView =
  | 'smvEngine'
  | 'queue'
  | 'certifications'
  | 'liens'
  | 'validationPin'
  | 'legacy'
  | 'smvMatrix'
  | 'problems';

export const Screen1Assessor: React.FC = () => {
  const {
    currentUser,
    dockets,
    activeDocketId,
    setActiveDocketId,
    createOrUpdateDocket,
    endorseDocketsToCapitol,
    problemTickets
  } = useRpatis();

  const [activeSubView, setActiveSubView] = useState<AssessorSubView>('smvEngine');

  const activeDocket = dockets.find((d) => d.id === activeDocketId) || dockets[0];

  const [transactionType, setTransactionType] = useState<'Discovery' | 'Transfer' | 'Reassessment' | 'Cancellation'>(
    activeDocket.transactionType
  );
  const [transferTrack, setTransferTrack] = useState<'standard' | 'dar' | 'ejs'>('standard');
  const [verifiedDocs, setVerifiedDocs] = useState<string[]>([]);
  const [docketIdField, setDocketIdField] = useState(activeDocket.id);
  const [pin, setPin] = useState(activeDocket.pin);
  const [tdNo, setTdNo] = useState(activeDocket.tdNo);
  const [lotNo, setLotNo] = useState(activeDocket.lotNo);
  const [owner, setOwner] = useState(activeDocket.owner);
  const [barangay, setBarangay] = useState(activeDocket.barangay);
  const [classification, setClassification] = useState<PropertyClassification>(activeDocket.classification);
  const [areaSqm, setAreaSqm] = useState<number>(activeDocket.areaSqm);
  const [unitValue, setUnitValue] = useState<number>(activeDocket.unitValue);
  const [assessmentLevel, setAssessmentLevel] = useState<number>(activeDocket.assessmentLevel);

  const [includeBuilding, setIncludeBuilding] = useState<boolean>(Boolean(activeDocket.building));
  const [structuralType, setStructuralType] = useState(
    activeDocket.building?.structuralType || 'Type III-A Concrete Bungalow'
  );
  const [floorArea, setFloorArea] = useState<number>(activeDocket.building?.floorAreaSqm || 120);
  const [yearBuilt, setYearBuilt] = useState<number>(activeDocket.building?.yearBuilt || 2018);
  const [depreciation, setDepreciation] = useState<number>(activeDocket.building?.depreciationPercent || 12);

  const loadDocketIntoForm = (id: string) => {
    const found = dockets.find((d) => d.id === id);
    if (!found) return;
    setActiveDocketId(found.id);
    setDocketIdField(found.id);
    setTransactionType(found.transactionType);
    setPin(found.pin);
    setTdNo(found.tdNo);
    setLotNo(found.lotNo);
    setOwner(found.owner);
    setBarangay(found.barangay);
    setClassification(found.classification);
    setAreaSqm(found.areaSqm);
    setUnitValue(found.unitValue);
    setAssessmentLevel(found.assessmentLevel);
    setIncludeBuilding(Boolean(found.building));
    if (found.building) {
      setStructuralType(found.building.structuralType);
      setFloorArea(found.building.floorAreaSqm);
      setYearBuilt(found.building.yearBuilt);
      setDepreciation(found.building.depreciationPercent);
    }
  };

  const handleStartNewDocket = () => {
    const nextNum = 852 + dockets.length;
    const newId = `PAS-2026-0${nextNum}`;
    setDocketIdField(newId);
    setTdNo(`TD-26-049${nextNum.toString().slice(-2)}`);
    setPin(`024-18-0005-014-${nextNum.toString().slice(-2)}`);
    setLotNo('');
    setOwner('');
    setBarangay('Brgy. Balogo, Pasacao');
    setTransactionType('Discovery');
    setClassification('Residential');
    setAreaSqm(250);
    setUnitValue(1200);
    setAssessmentLevel(20);
    setIncludeBuilding(false);
    setVerifiedDocs([]);
  };

  const handleClassChange = (val: PropertyClassification) => {
    setClassification(val);
    const rateInfo = SMV_RATES[val];
    setUnitValue(rateInfo.unitValue);
    setAssessmentLevel(rateInfo.level);
  };

  const landMarketValue = areaSqm * unitValue;
  const landAssessedValue = (landMarketValue * assessmentLevel) / 100;

  const buildingUnitCost = 11500;
  const buildingGross = includeBuilding ? floorArea * buildingUnitCost : 0;
  const buildingMarketValue = includeBuilding ? Math.round(buildingGross * (1 - depreciation / 100)) : 0;
  const buildingAssessedValue = includeBuilding ? Math.round(buildingMarketValue * 0.2) : 0;

  const totalMarketValue = landMarketValue + buildingMarketValue;
  const totalAssessedValue = landAssessedValue + buildingAssessedValue;

  const handleSaveDraft = () => {
    const ownerName = owner.trim() || 'Unnamed Declarant';
    const parts = ownerName.split(' ');
    const masked =
      parts.length >= 2 ? `${parts[parts.length - 1]}, ${parts[0][0]}.` : ownerName;

    createOrUpdateDocket({
      ...activeDocket,
      id: docketIdField,
      capitolId: `CAP-${docketIdField}`,
      lgu: 'Pasacao',
      transactionType,
      pin,
      tdNo,
      lotNo: lotNo || 'Lot Pending Survey',
      owner: ownerName,
      ownerMasked: masked,
      barangay,
      classification,
      smvSubclass: SMV_RATES[classification].subclass,
      areaSqm,
      unitValue,
      assessmentLevel,
      marketValue: landMarketValue,
      assessedValue: landAssessedValue,
      building: includeBuilding
        ? {
            structuralType,
            floorAreaSqm: floorArea,
            yearBuilt,
            depreciationPercent: depreciation,
            unitCostPerSqm: buildingUnitCost
          }
        : undefined,
      status: 'Needs Signature',
      submittedAt: 'March 18, 2026 • Just now',
      deficiencies: activeDocket.id === docketIdField ? activeDocket.deficiencies : []
    });
  };

  const pasacaoPendingCount = dockets.filter(
    (d) => d.lgu === 'Pasacao' && (d.status === 'Needs Signature' || d.status === 'Flagged')
  ).length;
  const openProblemsCount =
    dockets.filter((d) => d.lgu === 'Pasacao' && d.status === 'Flagged').length +
    problemTickets.filter((t) => t.status === 'Open').length;

  const navBtnClass = (view: AssessorSubView) =>
    `w-full min-h-[42px] flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
      activeSubView === view
        ? 'bg-slate-900 text-white shadow-2xs'
        : 'text-slate-700 hover:bg-slate-100'
    }`;

  return (
    <div className="flex flex-col lg:flex-row flex-1 w-full bg-slate-50 text-slate-900">
      {/* Grouped Municipal Assessor Sidebar (All 11 Official Frontline Services) */}
      <aside
        aria-label="Municipal Assessor Navigation"
        className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-slate-300 flex flex-col justify-between shrink-0"
      >
        <div className="p-4 space-y-5 overflow-y-auto">
          {/* Group 1: Appraisal & Endorsement */}
          <div className="space-y-1.5">
            <div className="px-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Appraisal &amp; Endorsement
            </div>
            <button type="button" onClick={() => setActiveSubView('smvEngine')} className={navBtnClass('smvEngine')}>
              <span className="flex items-center gap-2.5">
                <Calculator className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>FAAS Appraisal Engine</span>
              </span>
            </button>
            <button type="button" onClick={() => setActiveSubView('queue')} className={navBtnClass('queue')}>
              <span className="flex items-center gap-2.5">
                <FileCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Endorsement Queue</span>
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-mono ${
                  activeSubView === 'queue'
                    ? 'bg-white/20 text-white'
                    : 'bg-amber-100 text-amber-950 border border-amber-400'
                }`}
              >
                {pasacaoPendingCount}
              </span>
            </button>
          </div>

          {/* Group 2: Frontline Counter Services (Services 1–5) */}
          <div className="space-y-1.5 pt-3 border-t border-slate-200">
            <div className="px-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Frontline Counter Services
            </div>
            <button
              type="button"
              onClick={() => setActiveSubView('certifications')}
              className={navBtnClass('certifications')}
            >
              <span className="flex items-center gap-2.5">
                <Award className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Certifications &amp; CTC</span>
              </span>
            </button>
            <button type="button" onClick={() => setActiveSubView('liens')} className={navBtnClass('liens')}>
              <span className="flex items-center gap-2.5">
                <Landmark className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Liens &amp; Mortgages</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubView('validationPin')}
              className={navBtnClass('validationPin')}
            >
              <span className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>TD Validation &amp; PIN/ARP</span>
              </span>
            </button>
          </div>

          {/* Group 3: Archives, Rates & Resolution */}
          <div className="space-y-1.5 pt-3 border-t border-slate-200">
            <div className="px-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Archives, Rates &amp; Disputes
            </div>
            <button type="button" onClick={() => setActiveSubView('legacy')} className={navBtnClass('legacy')}>
              <span className="flex items-center gap-2.5">
                <Archive className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>1949 Historical Vault</span>
              </span>
            </button>
            <button type="button" onClick={() => setActiveSubView('smvMatrix')} className={navBtnClass('smvMatrix')}>
              <span className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>SMV Matrix 2024</span>
              </span>
            </button>
            <button type="button" onClick={() => setActiveSubView('problems')} className={navBtnClass('problems')}>
              <span className="flex items-center gap-2.5">
                <Wrench className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Problem &amp; Deficiency Log</span>
              </span>
              {openProblemsCount > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-mono ${
                    activeSubView === 'problems'
                      ? 'bg-white/20 text-white'
                      : 'bg-red-100 text-red-950 border border-red-400'
                  }`}
                >
                  {openProblemsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-700 space-y-1">
          <div className="font-bold text-slate-900">Acting Officer</div>
          <div>{currentUser?.name}</div>
          <div className="font-mono text-slate-600">{currentUser?.employeeId}</div>
        </div>
      </aside>

      {/* Active Sub-View Content */}
      <div className="flex-1 overflow-y-auto">
        {activeSubView === 'queue' && <ViewEndorsementQueue />}
        {activeSubView === 'certifications' && <ViewCertifications />}
        {activeSubView === 'liens' && <ViewLiensMortgages />}
        {activeSubView === 'validationPin' && <ViewValidationPinId />}
        {activeSubView === 'problems' && <ViewProblemResolution />}
        {activeSubView === 'legacy' && (
          <ViewLegacyVault
            onMigrateToDraft={() => {
              setActiveSubView('smvEngine');
            }}
          />
        )}
        {activeSubView === 'smvMatrix' && (
          <ViewSmvMatrix
            onApplyRate={(cls, rate, level) => {
              setClassification(cls);
              setUnitValue(rate);
              setAssessmentLevel(level);
              setActiveSubView('smvEngine');
            }}
          />
        )}

        {activeSubView === 'smvEngine' && (
          <div className="p-5 sm:p-6 space-y-5">
            {/* Header + Docket Selector + New Docket Intake */}
            <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-2xs flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs font-mono text-slate-600">
                  Municipal Assessor &gt; FAAS Appraisal &amp; Valuation Engine
                </div>
                <h1 className="text-lg font-bold text-slate-900 mt-0.5">
                  Field Appraisal &amp; Assessment Sheet (FAAS) Encoder
                </h1>
              </div>

              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label htmlFor="active-docket-select" className="block text-xs font-bold text-slate-700 mb-1">
                    Active Docket Record
                  </label>
                  <select
                    id="active-docket-select"
                    value={activeDocket.id}
                    onChange={(e) => loadDocketIntoForm(e.target.value)}
                    className="min-h-[40px] bg-slate-50 border border-slate-400 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-900"
                  >
                    {dockets
                      .filter((d) => d.lgu === 'Pasacao')
                      .map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.id} — {d.owner} (PIN {d.pin})
                        </option>
                      ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleStartNewDocket}
                  className="min-h-[40px] px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" aria-hidden="true" />
                  <span>New Docket</span>
                </button>

                <StatusChip status={activeDocket.status} size="md" />
              </div>
            </div>

            {/* Two-Column Appraisal + Live e-TD Preview */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              <div className="xl:col-span-7 bg-white rounded-xl border border-slate-300 shadow-2xs p-5 space-y-5">
                <div className="space-y-3 pb-4 border-b border-slate-200">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    1. Statutory Transaction &amp; Property Identification
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="tx-type" className="block text-xs font-semibold text-slate-800 mb-1">
                        Transaction Type
                      </label>
                      <select
                        id="tx-type"
                        value={transactionType}
                        onChange={(e) => setTransactionType(e.target.value as any)}
                        className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900"
                      >
                        <option value="Transfer">Transfer of Ownership (Conveyance)</option>
                        <option value="Discovery">New Assessment / Discovery</option>
                        <option value="Reassessment">Reassessment / Physical Update</option>
                        <option value="Cancellation">Cancellation / Subdivision</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="faas-pin" className="block text-xs font-semibold text-slate-800 mb-1">
                        Property Index Number (PIN)
                      </label>
                      <input
                        id="faas-pin"
                        type="text"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label htmlFor="faas-owner" className="block text-xs font-semibold text-slate-800 mb-1">
                        Declarant / Property Owner
                      </label>
                      <input
                        id="faas-owner"
                        type="text"
                        value={owner}
                        onChange={(e) => setOwner(e.target.value)}
                        className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900"
                      />
                    </div>

                    <div>
                      <label htmlFor="faas-lot" className="block text-xs font-semibold text-slate-800 mb-1">
                        Cadastral Lot &amp; Survey Reference
                      </label>
                      <input
                        id="faas-lot"
                        type="text"
                        value={lotNo}
                        onChange={(e) => setLotNo(e.target.value)}
                        className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-3 py-2 text-xs text-slate-900"
                      />
                    </div>
                  </div>

                  {/* 3-Track Transfer Document Verification Checklist (Service 7) */}
                  {transactionType === 'Transfer' && (
                    <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-300 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          Transfer Document Completeness Verification
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {(Object.keys(TRANSFER_TRACKS) as Array<'standard' | 'dar' | 'ejs'>).map((k) => (
                            <button
                              key={k}
                              type="button"
                              onClick={() => {
                                setTransferTrack(k);
                                setVerifiedDocs([]);
                              }}
                              className={`px-2.5 py-1 rounded text-xs font-bold border ${
                                transferTrack === k
                                  ? 'bg-slate-900 text-white border-slate-900'
                                  : 'bg-white text-slate-800 border-slate-400'
                              }`}
                            >
                              {k === 'standard' ? 'Standard Sale' : k === 'dar' ? 'DAR / CLOA' : 'Extra-Judicial'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                        {TRANSFER_TRACKS[transferTrack].docs.map((doc) => {
                          const checked = verifiedDocs.includes(doc);
                          return (
                            <label key={doc} className="flex items-start gap-2 cursor-pointer text-slate-800">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() =>
                                  setVerifiedDocs((prev) =>
                                    prev.includes(doc) ? prev.filter((x) => x !== doc) : [...prev, doc]
                                  )
                                }
                                className="mt-0.5 w-3.5 h-3.5 accent-slate-900 rounded shrink-0"
                              />
                              <span className={checked ? 'line-through text-slate-500' : ''}>{doc}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Land Valuation */}
                <div className="space-y-3 pb-4 border-b border-slate-200">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      2. Land Valuation &amp; SMV Rate Provenance (RA 7160 Sec. 218)
                    </h2>
                    <button
                      type="button"
                      onClick={() => setActiveSubView('smvMatrix')}
                      className="text-xs font-bold text-blue-700 hover:text-blue-900 underline flex items-center gap-1"
                    >
                      <span>Verify in Provincial SMV Matrix</span>
                      <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label htmlFor="land-class" className="block text-xs font-semibold text-slate-800 mb-1">
                        Land Classification
                      </label>
                      <select
                        id="land-class"
                        value={classification}
                        onChange={(e) => handleClassChange(e.target.value as PropertyClassification)}
                        className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900"
                      >
                        <option value="Residential">Residential (20%)</option>
                        <option value="Agricultural">Agricultural (40%)</option>
                        <option value="Commercial">Commercial (50%)</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="land-area" className="block text-xs font-semibold text-slate-800 mb-1">
                        Land Area (sqm)
                      </label>
                      <input
                        id="land-area"
                        type="number"
                        min={1}
                        value={areaSqm}
                        onChange={(e) => setAreaSqm(Math.max(0, Number(e.target.value)))}
                        className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label htmlFor="unit-rate" className="block text-xs font-semibold text-slate-800 mb-1">
                        SMV Unit Rate (PHP/sqm)
                      </label>
                      <input
                        id="unit-rate"
                        type="number"
                        min={1}
                        value={unitValue}
                        onChange={(e) => setUnitValue(Math.max(0, Number(e.target.value)))}
                        className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 flex items-start gap-2 text-xs text-blue-950">
                    <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <strong>Rate Provenance:</strong> Linked to Camarines Sur Provincial Ordinance No. 2024-08 (
                      <span className="font-mono font-semibold">{SMV_RATES[classification].subclass}</span>). Statutory
                      assessment level locked at <strong>{assessmentLevel}%</strong> under Section 218, RA 7160.
                    </div>
                  </div>
                </div>

                {/* 3. Building Sub-Components */}
                <div className="space-y-3 pb-4 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-slate-700" aria-hidden="true" />
                      <span>3. Building Sub-Components</span>
                    </h2>
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeBuilding}
                        onChange={(e) => setIncludeBuilding(e.target.checked)}
                        className="w-4 h-4 accent-slate-900 rounded"
                      />
                      <span>Include Building Improvement</span>
                    </label>
                  </div>

                  {includeBuilding && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label htmlFor="bldg-type" className="block text-xs font-semibold text-slate-800 mb-1">
                          Structural Type
                        </label>
                        <select
                          id="bldg-type"
                          value={structuralType}
                          onChange={(e) => setStructuralType(e.target.value)}
                          className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900"
                        >
                          <option>Type III-A Concrete Bungalow</option>
                          <option>Type II-B Semi-Concrete Residential</option>
                          <option>Type IV-A Reinforced Commercial</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="bldg-area" className="block text-xs font-semibold text-slate-800 mb-1">
                          Floor Area (sqm)
                        </label>
                        <input
                          id="bldg-area"
                          type="number"
                          min={0}
                          value={floorArea}
                          onChange={(e) => setFloorArea(Math.max(0, Number(e.target.value)))}
                          className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900"
                        />
                      </div>

                      <div>
                        <label htmlFor="bldg-year" className="block text-xs font-semibold text-slate-800 mb-1">
                          Year Constructed
                        </label>
                        <input
                          id="bldg-year"
                          type="number"
                          min={1949}
                          max={2026}
                          value={yearBuilt}
                          onChange={(e) => setYearBuilt(Number(e.target.value))}
                          className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900"
                        />
                      </div>

                      <div>
                        <label htmlFor="bldg-dep" className="block text-xs font-semibold text-slate-800 mb-1">
                          Depreciation (%)
                        </label>
                        <input
                          id="bldg-dep"
                          type="number"
                          min={0}
                          max={80}
                          value={depreciation}
                          onChange={(e) => setDepreciation(Math.min(80, Math.max(0, Number(e.target.value))))}
                          className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="min-h-[44px] px-4 py-2.5 bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors"
                  >
                    <Save className="w-4 h-4" aria-hidden="true" />
                    <span>Save Appraisal Draft</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleSaveDraft();
                      endorseDocketsToCapitol([docketIdField]);
                      setActiveSubView('queue');
                    }}
                    className="min-h-[44px] px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
                  >
                    <Send className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                    <span>Sign Recommending Approval &amp; Endorse to Pili</span>
                  </button>
                </div>
              </div>

              {/* Right: Live Electronic Tax Declaration Draft Preview */}
              <div className="xl:col-span-5 bg-white rounded-xl border-2 border-slate-800 shadow-sm p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Republic of the Philippines • Municipality of Pasacao
                    </div>
                    <h2 className="text-sm font-extrabold text-slate-900 mt-0.5">
                      TAX DECLARATION OF REAL PROPERTY (DRAFT)
                    </h2>
                  </div>
                  <span className="bg-amber-100 text-amber-950 border border-amber-500 px-2.5 py-1 rounded text-xs font-bold">
                    DRAFT PREVIEW
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-600 block font-semibold">Docket / TD No.</span>
                    <span className="font-mono font-bold text-slate-900">
                      {docketIdField} / {tdNo}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600 block font-semibold">Property Index No.</span>
                    <span className="font-mono font-bold text-slate-900">{pin}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-600 block font-semibold">Owner / Declarant</span>
                    <span className="font-bold text-slate-900 text-sm">{owner || 'Pending Entry'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-600 block font-semibold">Location &amp; Cadastral Lot</span>
                    <span className="text-slate-900 font-medium">
                      {lotNo || 'Pending Lot Ref'} — {barangay}
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-300 rounded-lg">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 border-b border-slate-300">
                        <th scope="col" className="py-2 px-3 font-bold">Component</th>
                        <th scope="col" className="py-2 px-3 text-right font-bold">Market Value</th>
                        <th scope="col" className="py-2 px-3 text-right font-bold">Assessed Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{classification} Land</div>
                          <div className="text-slate-600 font-mono">
                            {areaSqm.toLocaleString()} sqm × ₱{unitValue.toLocaleString()} ({assessmentLevel}%)
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-900">
                          ₱{landMarketValue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                          ₱{landAssessedValue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                      {includeBuilding && (
                        <tr>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900">{structuralType}</div>
                            <div className="text-slate-600 font-mono">
                              {floorArea} sqm • Built {yearBuilt} ({depreciation}% dep.)
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-900">
                            ₱{buildingMarketValue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                            ₱{buildingAssessedValue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      )}
                      <tr className="bg-slate-900 text-white font-bold">
                        <td className="py-3 px-3">TOTAL STATUTORY VALUATION</td>
                        <td className="py-3 px-3 text-right font-mono">
                          ₱{totalMarketValue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-emerald-300">
                          ₱{totalAssessedValue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-xs text-emerald-950 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
                  <span>
                    Estimated Annual RPT (2% Basic + SEF):{' '}
                    <strong className="font-mono">
                      ₱{(totalAssessedValue * 0.02).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
