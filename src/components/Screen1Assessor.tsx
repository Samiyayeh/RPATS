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
  PlusCircle,
  Database,
  Hammer,
  Cog
} from 'lucide-react';
import { useRpatis } from '../context/RpatisContext';
import {
  AssessmentDocket,
  AssessmentRollRow,
  MachineryClassification,
  PropertyClassification
} from '../types/rpatis';
import { StatusChip } from './common/StatusChip';
import { CollapsibleSidebarLayout } from './layout/CollapsibleSidebarLayout';
import { ViewEndorsementQueue } from './ViewEndorsementQueue';
import { ViewLegacyVault } from './ViewLegacyVault';
import { ViewSmvMatrix } from './ViewSmvMatrix';
import { ViewCertifications } from './assessor/ViewCertifications';
import { ViewLiensMortgages } from './assessor/ViewLiensMortgages';
import { ViewValidationPinId } from './assessor/ViewValidationPinId';
import { ViewProblemResolution } from './assessor/ViewProblemResolution';
import { ViewAssessmentRoll } from './assessor/ViewAssessmentRoll';

const SMV_RATES: Record<PropertyClassification, { subclass: string; unitValue: number; level: number }> = {
  Residential: { subclass: 'R-1 (Residential First Class)', unitValue: 1200, level: 20 },
  Agricultural: { subclass: 'Ag-1 (Irrigated Riceland)', unitValue: 85, level: 40 },
  Commercial: { subclass: 'C-1 (Commercial Strip)', unitValue: 2500, level: 50 }
};

const MACHINERY_LEVELS: Record<MachineryClassification, number> = {
  Agricultural: 40,
  Residential: 50,
  'Commercial / Industrial': 80
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
  | 'assessmentRoll'
  | 'queue'
  | 'certifications'
  | 'liens'
  | 'validationPin'
  | 'legacy'
  | 'smvMatrix'
  | 'problems';

export const Screen1Assessor: React.FC = () => {
  const {
    dockets,
    assessmentRoll,
    smvRates,
    activeSmvNotice,
    setActiveDocketId,
    createOrUpdateDocket,
    endorseDocketsToCapitol,
    problemTickets
  } = useRpatis();

  const getPrimaryRateInfo = (cls: PropertyClassification) => {
    const liveMatch = smvRates.find((r) => r.category === cls);
    if (liveMatch) {
      return { subclass: liveMatch.subclass, unitValue: liveMatch.rate, level: liveMatch.level };
    }
    return SMV_RATES[cls];
  };

  const [activeSubView, setActiveSubView] = useState<AssessorSubView>('smvEngine');

  const [selectedDocketId, setSelectedDocketId] = useState<string>('');
  const selectedDocket = dockets.find((d) => d.id === selectedDocketId);

  const [transactionType, setTransactionType] = useState<'Discovery' | 'Transfer' | 'Reassessment' | 'Cancellation'>(
    'Discovery'
  );
  const [transferTrack, setTransferTrack] = useState<'standard' | 'dar' | 'ejs'>('standard');
  const [verifiedDocs, setVerifiedDocs] = useState<string[]>([]);
  const [docketIdField, setDocketIdField] = useState('');
  const [pin, setPin] = useState('');
  const [tdNo, setTdNo] = useState('');
  const [lotNo, setLotNo] = useState('');
  const [owner, setOwner] = useState('');
  const [barangay, setBarangay] = useState('');
  const [classification, setClassification] = useState<PropertyClassification>('Residential');
  const [areaSqm, setAreaSqm] = useState<string>('');
  const [unitValue, setUnitValue] = useState<string>('');
  const [assessmentLevel, setAssessmentLevel] = useState<number>(20);

  const [includeBuilding, setIncludeBuilding] = useState<boolean>(false);
  const [structuralType, setStructuralType] = useState('Type III-A Concrete Bungalow');
  const [floorArea, setFloorArea] = useState<string>('');
  const [yearBuilt, setYearBuilt] = useState<string>('');
  const [depreciation, setDepreciation] = useState<string>('');

  const [includeStructure, setIncludeStructure] = useState<boolean>(false);
  const [structureType, setStructureType] = useState<string>('');
  const [structureDesc, setStructureDesc] = useState<string>('');
  const [structureAreaOrUnits, setStructureAreaOrUnits] = useState<string>('');
  const [structureYearBuilt, setStructureYearBuilt] = useState<string>('');
  const [structureReplacementCost, setStructureReplacementCost] = useState<string>('');
  const [structureDepreciation, setStructureDepreciation] = useState<string>('');
  const [structureLevel, setStructureLevel] = useState<number>(20);

  const [includeMachinery, setIncludeMachinery] = useState<boolean>(false);
  const [machineryDesc, setMachineryDesc] = useState<string>('');
  const [machineryBrandModel, setMachineryBrandModel] = useState<string>('');
  const [machineryClass, setMachineryClass] = useState<MachineryClassification | ''>('');
  const [machineryCost, setMachineryCost] = useState<string>('');
  const [machineryYearAcquired, setMachineryYearAcquired] = useState<string>('');
  const [machineryDepreciation, setMachineryDepreciation] = useState<string>('');

  const resetOptionalComponents = () => {
    setIncludeBuilding(false);
    setFloorArea('');
    setYearBuilt('');
    setDepreciation('');
    setIncludeStructure(false);
    setStructureType('');
    setStructureDesc('');
    setStructureAreaOrUnits('');
    setStructureYearBuilt('');
    setStructureReplacementCost('');
    setStructureDepreciation('');
    setStructureLevel(20);
    setIncludeMachinery(false);
    setMachineryDesc('');
    setMachineryBrandModel('');
    setMachineryClass('');
    setMachineryCost('');
    setMachineryYearAcquired('');
    setMachineryDepreciation('');
  };

  const handleStartNewDocket = () => {
    setSelectedDocketId('');
    setDocketIdField('');
    setTdNo('');
    setPin('');
    setLotNo('');
    setOwner('');
    setBarangay('');
    setTransactionType('Discovery');
    setClassification('Residential');
    setAreaSqm('');
    setUnitValue('');
    setAssessmentLevel(20);
    resetOptionalComponents();
    setVerifiedDocs([]);
  };

  const applyDocketObjectToForm = (found: AssessmentDocket) => {
    setSelectedDocketId(found.id);
    setActiveDocketId(found.id);
    setDocketIdField(found.id);
    setTransactionType(found.transactionType);
    setPin(found.pin);
    setTdNo(found.tdNo);
    setLotNo(found.lotNo);
    setOwner(found.owner);
    setBarangay(found.barangay);
    setClassification(found.classification);
    setAreaSqm(found.areaSqm > 0 ? String(found.areaSqm) : '');
    setUnitValue(found.unitValue > 0 ? String(found.unitValue) : '');
    setAssessmentLevel(found.assessmentLevel);
    setIncludeBuilding(Boolean(found.building));
    if (found.building) {
      setStructuralType(found.building.structuralType);
      setFloorArea(String(found.building.floorAreaSqm));
      setYearBuilt(String(found.building.yearBuilt));
      setDepreciation(String(found.building.depreciationPercent));
    } else {
      setFloorArea('');
      setYearBuilt('');
      setDepreciation('');
    }
    setIncludeStructure(Boolean(found.otherStructure));
    if (found.otherStructure) {
      setStructureType(found.otherStructure.structureType);
      setStructureDesc(found.otherStructure.description);
      setStructureAreaOrUnits(found.otherStructure.areaOrUnits ? String(found.otherStructure.areaOrUnits) : '');
      setStructureYearBuilt(found.otherStructure.yearBuilt ? String(found.otherStructure.yearBuilt) : '');
      setStructureReplacementCost(String(found.otherStructure.replacementCost));
      setStructureDepreciation(String(found.otherStructure.depreciationPercent));
      setStructureLevel(found.otherStructure.assessmentLevel);
    } else {
      setStructureType('');
      setStructureDesc('');
      setStructureAreaOrUnits('');
      setStructureYearBuilt('');
      setStructureReplacementCost('');
      setStructureDepreciation('');
      setStructureLevel(20);
    }
    setIncludeMachinery(Boolean(found.machinery));
    if (found.machinery) {
      setMachineryDesc(found.machinery.description);
      setMachineryBrandModel(found.machinery.brandModel);
      setMachineryClass(found.machinery.machineryClass);
      setMachineryCost(String(found.machinery.acquisitionCost));
      setMachineryYearAcquired(found.machinery.yearAcquired ? String(found.machinery.yearAcquired) : '');
      setMachineryDepreciation(String(found.machinery.depreciationPercent));
    } else {
      setMachineryDesc('');
      setMachineryBrandModel('');
      setMachineryClass('');
      setMachineryCost('');
      setMachineryYearAcquired('');
      setMachineryDepreciation('');
    }
  };

  const loadDocketIntoForm = (id: string) => {
    if (!id) {
      handleStartNewDocket();
      return;
    }
    const found = dockets.find((d) => d.id === id);
    if (!found) return;
    applyDocketObjectToForm(found);
  };

  const loadRollRowIntoFaas = (row: AssessmentRollRow) => {
    const existingDocket = dockets.find((d) => d.tdNo === row.tdNo || d.pin === row.pin);
    if (existingDocket) {
      loadDocketIntoForm(existingDocket.id);
    } else {
      setSelectedDocketId('');
      setDocketIdField('');
      setTransactionType('Reassessment');
      setPin(row.pin);
      setTdNo(row.tdNo);
      setLotNo(`Brgy. ${row.barangay} Parcel`);
      setOwner(row.ownerFull);
      setBarangay(`Brgy. ${row.barangay}, Pasacao`);
      setClassification(row.classification);
      setAreaSqm(String(row.areaSqm));
      setUnitValue(String(row.unitValue));
      setAssessmentLevel(Math.round(row.assessmentLevel * 100));
      resetOptionalComponents();
    }
    setActiveSubView('smvEngine');
  };

  const handleClassChange = (val: PropertyClassification) => {
    setClassification(val);
    const rateInfo = getPrimaryRateInfo(val);
    setUnitValue(String(rateInfo.unitValue));
    setAssessmentLevel(rateInfo.level);
  };

  const areaNum = Number(areaSqm) || 0;
  const unitValNum = Number(unitValue) || 0;
  const floorAreaNum = Number(floorArea) || 0;
  const yearBuiltNum = Number(yearBuilt) || 2026;
  const depreciationNum = Number(depreciation) || 0;

  const landMarketValue = areaNum * unitValNum;
  const landAssessedValue = (landMarketValue * assessmentLevel) / 100;

  const buildingUnitCost = 11500;
  const buildingGross = includeBuilding ? floorAreaNum * buildingUnitCost : 0;
  const buildingMarketValue = includeBuilding ? Math.round(buildingGross * (1 - depreciationNum / 100)) : 0;
  const buildingAssessedValue = includeBuilding ? Math.round(buildingMarketValue * 0.2) : 0;

  const structureCostNum = Number(structureReplacementCost) || 0;
  const structureDepNum = Math.min(80, Math.max(0, Number(structureDepreciation) || 0));
  const structureMarketValue = includeStructure ? Math.round(structureCostNum * (1 - structureDepNum / 100)) : 0;
  const structureAssessedValue = includeStructure ? Math.round((structureMarketValue * structureLevel) / 100) : 0;

  const machineryCostNum = Number(machineryCost) || 0;
  const machineryDepNum = Math.min(80, Math.max(0, Number(machineryDepreciation) || 0));
  const machineryLevel = machineryClass ? MACHINERY_LEVELS[machineryClass] : 0;
  const machineryMarketValue = includeMachinery ? Math.round(machineryCostNum * (1 - machineryDepNum / 100)) : 0;
  const machineryAssessedValue = includeMachinery ? Math.round((machineryMarketValue * machineryLevel) / 100) : 0;

  const totalMarketValue = landMarketValue + buildingMarketValue + structureMarketValue + machineryMarketValue;
  const totalAssessedValue =
    landAssessedValue + buildingAssessedValue + structureAssessedValue + machineryAssessedValue;

  const canSaveOrEndorse = owner.trim().length > 0 && pin.trim().length > 0 && totalMarketValue > 0;

  const handleSaveDraft = () => {
    if (!canSaveOrEndorse) return null;
    const ownerName = owner.trim();
    const parts = ownerName.split(' ');
    const masked =
      parts.length >= 2 ? `${parts[parts.length - 1]}, ${parts[0][0]}.` : ownerName;
    const nextNum = 852 + dockets.length;
    const resolvedId = docketIdField.trim() || `PAS-2026-0${nextNum}`;
    const resolvedTd = tdNo.trim() || `TD-26-049${nextNum.toString().slice(-2)}`;

    createOrUpdateDocket({
      id: resolvedId,
      capitolId: `CAP-${resolvedId}`,
      lgu: 'Pasacao',
      contact: selectedDocket?.contact || '',
      transactionType,
      pin: pin.trim(),
      tdNo: resolvedTd,
      lotNo: lotNo.trim() || 'Pending Survey Ref',
      owner: ownerName,
      ownerMasked: masked,
      barangay: barangay.trim() || 'Pasacao, Camarines Sur',
      classification,
      smvSubclass: getPrimaryRateInfo(classification).subclass,
      areaSqm: areaNum,
      unitValue: unitValNum,
      assessmentLevel,
      marketValue: totalMarketValue,
      assessedValue: totalAssessedValue,
      building: includeBuilding
        ? {
            structuralType,
            floorAreaSqm: floorAreaNum,
            yearBuilt: yearBuiltNum,
            depreciationPercent: depreciationNum,
            unitCostPerSqm: buildingUnitCost
          }
        : undefined,
      otherStructure:
        includeStructure && structureCostNum > 0
          ? {
              structureType: structureType || 'Other Permanent Structure',
              description: structureDesc.trim(),
              areaOrUnits: Number(structureAreaOrUnits) || 0,
              yearBuilt: Number(structureYearBuilt) || 2026,
              replacementCost: structureCostNum,
              depreciationPercent: structureDepNum,
              assessmentLevel: structureLevel
            }
          : undefined,
      machinery:
        includeMachinery && machineryCostNum > 0 && machineryClass
          ? {
              description: machineryDesc.trim() || 'Taxable Machinery',
              brandModel: machineryBrandModel.trim(),
              machineryClass,
              acquisitionCost: machineryCostNum,
              yearAcquired: Number(machineryYearAcquired) || 2026,
              depreciationPercent: machineryDepNum,
              assessmentLevel: machineryLevel
            }
          : undefined,
      status: 'Needs Signature',
      submittedAt: 'March 18, 2026 • Just now',
      deficiencies: selectedDocket?.id === resolvedId ? selectedDocket.deficiencies : []
    });
    setDocketIdField(resolvedId);
    setTdNo(resolvedTd);
    setSelectedDocketId(resolvedId);
    return resolvedId;
  };

  const pasacaoPendingCount = dockets.filter(
    (d) => d.lgu === 'Pasacao' && (d.status === 'Needs Signature' || d.status === 'Flagged')
  ).length;
  const openProblemsCount =
    dockets.filter((d) => d.lgu === 'Pasacao' && d.status === 'Flagged').length +
    problemTickets.filter((t) => t.status === 'Open').length;

const ASSESSOR_VIEW_LABELS: Record<AssessorSubView, string> = {
  smvEngine: 'FAAS Appraisal Engine',
  assessmentRoll: 'Property Records (Roll)',
  queue: 'Endorsement Queue',
  certifications: 'Certifications & CTC',
  liens: 'Liens & Mortgages',
  validationPin: 'TD Validation & PIN/ARP',
  legacy: 'Historical Cadastre Vault',
  smvMatrix: 'SMV Matrix 2024',
  problems: 'Problem & Deficiency Log'
};

  const navBtnClass = (view: AssessorSubView) =>
    `w-full min-h-[42px] flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
      activeSubView === view
        ? 'bg-slate-900 text-white shadow-2xs'
        : 'text-slate-700 hover:bg-slate-100'
    }`;

  return (
    <CollapsibleSidebarLayout
      ariaLabel="Municipal Assessor Navigation"
      sidebarSubtitle="Municipality of Pasacao • Frontline & FAAS"
      activeSectionLabel={ASSESSOR_VIEW_LABELS[activeSubView]}
      sidebarContent={
        <div className="space-y-5">
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
            <button
              type="button"
              onClick={() => setActiveSubView('assessmentRoll')}
              className={navBtnClass('assessmentRoll')}
            >
              <span className="flex items-center gap-2.5">
                <Database className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Property Records (Roll)</span>
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-mono ${
                  activeSubView === 'assessmentRoll'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 text-slate-900'
                }`}
              >
                {assessmentRoll.length}
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
                <span>Historical Cadastre Vault</span>
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
      }
    >
      {/* Active Sub-View Content */}
        {activeSubView === 'assessmentRoll' && (
          <ViewAssessmentRoll onOpenPropertyInFaas={loadRollRowIntoFaas} />
        )}
        {activeSubView === 'queue' && <ViewEndorsementQueue />}
        {activeSubView === 'certifications' && <ViewCertifications />}
        {activeSubView === 'liens' && <ViewLiensMortgages />}
        {activeSubView === 'validationPin' && <ViewValidationPinId />}
        {activeSubView === 'problems' && <ViewProblemResolution />}
        {activeSubView === 'legacy' && (
          <ViewLegacyVault
            onMigrateToDraft={(newDocket) => {
              applyDocketObjectToForm(newDocket);
              setActiveSubView('smvEngine');
            }}
          />
        )}
        {activeSubView === 'smvMatrix' && (
          <ViewSmvMatrix
            onApplyRate={(cls, rate, level) => {
              setClassification(cls);
              setUnitValue(String(rate));
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
                    Load Existing Docket (Optional)
                  </label>
                  <select
                    id="active-docket-select"
                    value={selectedDocketId}
                    onChange={(e) => loadDocketIntoForm(e.target.value)}
                    className="min-h-[40px] bg-slate-50 border border-slate-400 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-900"
                  >
                    <option value="">-- New / Blank Appraisal Form --</option>
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
                  <span>Clear / New Form</span>
                </button>

                <StatusChip status={selectedDocket?.status || 'Draft'} size="md" />
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
                        placeholder="e.g. 024-18-0012-005-22"
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
                        placeholder="Enter owner full name..."
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
                        placeholder="e.g. Lot 4102-B, Psd-05-01294"
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
                        placeholder="Enter area in sqm"
                        value={areaSqm}
                        onChange={(e) => setAreaSqm(e.target.value)}
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
                        placeholder="Enter rate per sqm"
                        value={unitValue}
                        onChange={(e) => setUnitValue(e.target.value)}
                        className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 flex items-start gap-2 text-xs text-blue-950">
                    <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <strong>Rate Provenance:</strong> Linked to {activeSmvNotice.ref} (
                      <span className="font-mono font-semibold">{getPrimaryRateInfo(classification).subclass}</span>).
                      Statutory assessment level locked at <strong>{assessmentLevel}%</strong> under Section 218, RA
                      7160.
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
                          placeholder="e.g. 120"
                          value={floorArea}
                          onChange={(e) => setFloorArea(e.target.value)}
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
                          placeholder="e.g. 2018"
                          value={yearBuilt}
                          onChange={(e) => setYearBuilt(e.target.value)}
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
                          placeholder="e.g. 12"
                          value={depreciation}
                          onChange={(e) => setDepreciation(e.target.value)}
                          className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Other Permanent Structures & Improvements */}
                <div className="space-y-3 pb-4 border-b border-slate-200">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <Hammer className="w-4 h-4 text-slate-700" aria-hidden="true" />
                      <span>4. Other Permanent Structures &amp; Improvements</span>
                    </h2>
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeStructure}
                        onChange={(e) => setIncludeStructure(e.target.checked)}
                        className="w-4 h-4 accent-slate-900 rounded"
                      />
                      <span>Include Permanent Structure / Improvement</span>
                    </label>
                  </div>

                  {includeStructure && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label htmlFor="struct-type" className="block text-xs font-semibold text-slate-800 mb-1">
                          Structure Type
                        </label>
                        <select
                          id="struct-type"
                          value={structureType}
                          onChange={(e) => setStructureType(e.target.value)}
                          className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900"
                        >
                          <option value="">-- Select structure type --</option>
                          <option value="Perimeter Concrete Fence">Perimeter Concrete Fence</option>
                          <option value="Retaining Wall / Riprap">Retaining Wall / Riprap</option>
                          <option value="Deep Well / Overhead Water Tank">Deep Well / Overhead Water Tank</option>
                          <option value="Swimming Pool">Swimming Pool</option>
                          <option value="Concrete Pavement / Yard">Concrete Pavement / Yard</option>
                          <option value="Warehouse Annex / Utility Shed">Warehouse Annex / Utility Shed</option>
                          <option value="Wharf / Pier / Dock">Wharf / Pier / Dock</option>
                          <option value="Other Permanent Structure">Other Permanent Structure</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="struct-desc" className="block text-xs font-semibold text-slate-800 mb-1">
                          Description / Material
                        </label>
                        <input
                          id="struct-desc"
                          type="text"
                          placeholder="e.g. CHB perimeter wall with steel gate"
                          value={structureDesc}
                          onChange={(e) => setStructureDesc(e.target.value)}
                          className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-3 py-2 text-xs text-slate-900"
                        />
                      </div>

                      <div>
                        <label htmlFor="struct-area" className="block text-xs font-semibold text-slate-800 mb-1">
                          Area / Linear Meters / Units
                        </label>
                        <input
                          id="struct-area"
                          type="number"
                          min={0}
                          placeholder="e.g. 85"
                          value={structureAreaOrUnits}
                          onChange={(e) => setStructureAreaOrUnits(e.target.value)}
                          className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900"
                        />
                      </div>

                      <div>
                        <label htmlFor="struct-year" className="block text-xs font-semibold text-slate-800 mb-1">
                          Year Built / Completed
                        </label>
                        <input
                          id="struct-year"
                          type="number"
                          min={1949}
                          max={2026}
                          placeholder="e.g. 2020"
                          value={structureYearBuilt}
                          onChange={(e) => setStructureYearBuilt(e.target.value)}
                          className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900"
                        />
                      </div>

                      <div>
                        <label htmlFor="struct-cost" className="block text-xs font-semibold text-slate-800 mb-1">
                          Replacement Cost New (PHP)
                        </label>
                        <input
                          id="struct-cost"
                          type="number"
                          min={0}
                          placeholder="e.g. 350000"
                          value={structureReplacementCost}
                          onChange={(e) => setStructureReplacementCost(e.target.value)}
                          className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900"
                        />
                      </div>

                      <div>
                        <label htmlFor="struct-dep" className="block text-xs font-semibold text-slate-800 mb-1">
                          Depreciation (%)
                        </label>
                        <input
                          id="struct-dep"
                          type="number"
                          min={0}
                          max={80}
                          placeholder="e.g. 15"
                          value={structureDepreciation}
                          onChange={(e) => setStructureDepreciation(e.target.value)}
                          className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="struct-level" className="block text-xs font-semibold text-slate-800 mb-1">
                          Statutory Assessment Level
                        </label>
                        <select
                          id="struct-level"
                          value={structureLevel}
                          onChange={(e) => setStructureLevel(Number(e.target.value))}
                          className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900"
                        >
                          <option value={20}>20% — Residential</option>
                          <option value={40}>40% — Agricultural</option>
                          <option value={50}>50% — Commercial / Industrial</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. Machinery Appraisal (RA 7160 Sec. 218(c) & Sec. 225) */}
                <div className="space-y-3 pb-4 border-b border-slate-200">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <Cog className="w-4 h-4 text-slate-700" aria-hidden="true" />
                      <span>5. Machinery Appraisal (RA 7160 Sec. 218(c) &amp; Sec. 225)</span>
                    </h2>
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeMachinery}
                        onChange={(e) => setIncludeMachinery(e.target.checked)}
                        className="w-4 h-4 accent-slate-900 rounded"
                      />
                      <span>Include Taxable Machinery</span>
                    </label>
                  </div>

                  {includeMachinery && (
                    <div className="space-y-3 pt-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="mach-desc" className="block text-xs font-semibold text-slate-800 mb-1">
                            Machinery / Equipment Name
                          </label>
                          <input
                            id="mach-desc"
                            type="text"
                            placeholder="e.g. Rice Mill Polisher / Industrial Generator"
                            value={machineryDesc}
                            onChange={(e) => setMachineryDesc(e.target.value)}
                            className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-3 py-2 text-xs text-slate-900"
                          />
                        </div>

                        <div>
                          <label htmlFor="mach-brand" className="block text-xs font-semibold text-slate-800 mb-1">
                            Brand / Model / Serial No.
                          </label>
                          <input
                            id="mach-brand"
                            type="text"
                            placeholder="e.g. Kubota / Serial #KM-4821"
                            value={machineryBrandModel}
                            onChange={(e) => setMachineryBrandModel(e.target.value)}
                            className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-3 py-2 text-xs text-slate-900"
                          />
                        </div>

                        <div>
                          <label htmlFor="mach-class" className="block text-xs font-semibold text-slate-800 mb-1">
                            Machinery Class &amp; Statutory Rate
                          </label>
                          <select
                            id="mach-class"
                            value={machineryClass}
                            onChange={(e) => setMachineryClass(e.target.value as MachineryClassification | '')}
                            className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900"
                          >
                            <option value="">-- Select machinery class --</option>
                            <option value="Agricultural">Agricultural (40% Assessment Level)</option>
                            <option value="Residential">Residential (50% Assessment Level)</option>
                            <option value="Commercial / Industrial">
                              Commercial / Industrial (80% Assessment Level)
                            </option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="mach-cost" className="block text-xs font-semibold text-slate-800 mb-1">
                            Acquisition / Replacement Cost (PHP)
                          </label>
                          <input
                            id="mach-cost"
                            type="number"
                            min={0}
                            placeholder="e.g. 650000"
                            value={machineryCost}
                            onChange={(e) => setMachineryCost(e.target.value)}
                            className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900"
                          />
                        </div>

                        <div>
                          <label htmlFor="mach-year" className="block text-xs font-semibold text-slate-800 mb-1">
                            Year Acquired / Installed
                          </label>
                          <input
                            id="mach-year"
                            type="number"
                            min={1949}
                            max={2026}
                            placeholder="e.g. 2022"
                            value={machineryYearAcquired}
                            onChange={(e) => setMachineryYearAcquired(e.target.value)}
                            className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900"
                          />
                        </div>

                        <div>
                          <label htmlFor="mach-dep" className="block text-xs font-semibold text-slate-800 mb-1">
                            Accumulated Depreciation (%)
                          </label>
                          <input
                            id="mach-dep"
                            type="number"
                            min={0}
                            max={80}
                            placeholder="0–80 (20% residual floor)"
                            value={machineryDepreciation}
                            onChange={(e) => setMachineryDepreciation(e.target.value)}
                            className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900"
                          />
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 flex items-start gap-2 text-xs text-blue-950">
                        <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" aria-hidden="true" />
                        <div>
                          <strong>RA 7160 Sec. 225 Residual Floor:</strong> Accumulated machinery depreciation is
                          statutorily capped at <strong>80%</strong> (minimum 20% remaining residual value while in
                          operation).
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    disabled={!canSaveOrEndorse}
                    onClick={handleSaveDraft}
                    className="min-h-[44px] px-4 py-2.5 bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-100 disabled:border-slate-300 disabled:text-slate-400 disabled:hover:bg-white rounded-lg text-xs font-bold flex items-center gap-2 transition-colors"
                  >
                    <Save className="w-4 h-4" aria-hidden="true" />
                    <span>Save Appraisal Draft</span>
                  </button>

                  <button
                    type="button"
                    disabled={!canSaveOrEndorse}
                    onClick={() => {
                      const savedId = handleSaveDraft();
                      if (savedId) {
                        endorseDocketsToCapitol([savedId]);
                        setActiveSubView('queue');
                      }
                    }}
                    className="min-h-[44px] px-5 py-2.5 bg-slate-900 hover:bg-black disabled:bg-slate-300 disabled:text-slate-600 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
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
                      {docketIdField || 'New Draft'} / {tdNo || 'Pending TD'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600 block font-semibold">Property Index No.</span>
                    <span className="font-mono font-bold text-slate-900">{pin || 'Pending PIN'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-600 block font-semibold">Owner / Declarant</span>
                    <span className="font-bold text-slate-900 text-sm">{owner || 'Pending Entry'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-600 block font-semibold">Location &amp; Cadastral Lot</span>
                    <span className="text-slate-900 font-medium">
                      {lotNo || 'Pending Lot Ref'} — {barangay || 'Pasacao, Camarines Sur'}
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
                      {(landMarketValue > 0 || (!includeBuilding && !includeStructure && !includeMachinery)) && (
                        <tr>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900">{classification} Land</div>
                            <div className="text-slate-600 font-mono">
                              {areaNum.toLocaleString()} sqm × ₱{unitValNum.toLocaleString()} ({assessmentLevel}%)
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-900">
                            ₱{landMarketValue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                            ₱{landAssessedValue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      )}
                      {includeBuilding && (
                        <tr>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900">{structuralType}</div>
                            <div className="text-slate-600 font-mono">
                              {floorAreaNum} sqm • Built {yearBuilt || '—'} ({depreciationNum}% dep.)
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
                      {includeStructure && (
                        <tr>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900">
                              {structureType || 'Other Permanent Structure'}
                            </div>
                            <div className="text-slate-600 font-mono">
                              {structureDesc ? `${structureDesc} • ` : ''}Built {structureYearBuilt || '—'} (
                              {structureDepNum}% dep. • {structureLevel}%)
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-900">
                            ₱{structureMarketValue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                            ₱{structureAssessedValue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      )}
                      {includeMachinery && (
                        <tr>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900">
                              {machineryDesc || 'Taxable Machinery'}
                            </div>
                            <div className="text-slate-600 font-mono">
                              {machineryBrandModel ? `${machineryBrandModel} • ` : ''}
                              {machineryClass || 'Unclassified'} ({machineryLevel}%) • Acq.{' '}
                              {machineryYearAcquired || '—'} ({machineryDepNum}% dep.)
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-900">
                            ₱{machineryMarketValue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                            ₱{machineryAssessedValue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
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
    </CollapsibleSidebarLayout>
  );
};
