import React, { useState } from 'react';
import { Search, Printer, ArrowRight, CheckCircle2, PlusCircle, X, FileInput } from 'lucide-react';
import { useRpatis } from '../context/RpatisContext';
import { AssessmentDocket, PropertyClassification } from '../types/rpatis';

interface ViewLegacyVaultProps {
  onMigrateToDraft?: (docket: AssessmentDocket) => void;
}

const SMV_DEFAULTS: Record<PropertyClassification, { subclass: string; rate: number; level: number }> = {
  Residential: { subclass: 'R-1 (Residential First Class)', rate: 1200, level: 20 },
  Agricultural: { subclass: 'Ag-1 (Irrigated Riceland)', rate: 85, level: 40 },
  Commercial: { subclass: 'C-1 (Commercial Strip)', rate: 2500, level: 50 }
};

export const ViewLegacyVault: React.FC<ViewLegacyVaultProps> = ({ onMigrateToDraft }) => {
  const { legacyRecords, addLegacyRecord, migrateLegacyToModern, dockets, pushToast } = useRpatis();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string>(legacyRecords[0]?.id || '');

  // Digitize Paper Ledger Modal State (Blank by default)
  const [showDigitizeModal, setShowDigitizeModal] = useState(false);
  const [digVintageTd, setDigVintageTd] = useState('');
  const [digRevision, setDigRevision] = useState('');
  const [digOwner, setDigOwner] = useState('');
  const [digLot, setDigLot] = useState('');
  const [digArea, setDigArea] = useState('');
  const [digLocation, setDigLocation] = useState('');
  const [digTranscription, setDigTranscription] = useState('');

  // Transfer Historical Record to Modern System Modal State (Blank by default)
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [txType, setTxType] = useState<'Transfer' | 'Reassessment' | 'Discovery'>('Transfer');
  const [newOwner, setNewOwner] = useState('');
  const [newPin, setNewPin] = useState('');
  const [newTdNo, setNewTdNo] = useState('');
  const [newLotNo, setNewLotNo] = useState('');
  const [newBarangay, setNewBarangay] = useState('');
  const [newClassification, setNewClassification] = useState<PropertyClassification>('Residential');
  const [newAreaSqm, setNewAreaSqm] = useState('');
  const [newUnitValue, setNewUnitValue] = useState('');

  const filtered = legacyRecords.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.vintageTd.toLowerCase().includes(q) ||
      r.owner.toLowerCase().includes(q) ||
      r.lot.toLowerCase().includes(q) ||
      r.revision.toLowerCase().includes(q)
    );
  });

  const activeRecord =
    legacyRecords.find((r) => r.id === selectedId) || filtered[0] || legacyRecords[0];

  const canDigitize =
    digVintageTd.trim().length > 0 &&
    digOwner.trim().length > 0 &&
    digLot.trim().length > 0;

  const handleDigitizeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canDigitize) return;
    const created = addLegacyRecord({
      vintageTd: digVintageTd.trim(),
      revision: digRevision.trim() || 'Historical Ledger',
      owner: digOwner.trim(),
      lot: digLot.trim(),
      area: digArea.trim() || 'Unspecified Area',
      location: digLocation.trim() || 'Municipal Archive Vault',
      transcription: digTranscription.trim() || 'Digitized paper ledger entry.'
    });
    setSelectedId(created.id);
    setDigVintageTd('');
    setDigRevision('');
    setDigOwner('');
    setDigLot('');
    setDigArea('');
    setDigLocation('');
    setDigTranscription('');
    setShowDigitizeModal(false);
  };

  const areaNum = Number(newAreaSqm) || 0;
  const unitValNum = Number(newUnitValue) || 0;
  const levelPct = SMV_DEFAULTS[newClassification].level;
  const marketVal = areaNum * unitValNum;
  const assessedVal = (marketVal * levelPct) / 100;

  const canTransferModern =
    Boolean(activeRecord) &&
    newOwner.trim().length > 0 &&
    newPin.trim().length > 0 &&
    areaNum > 0 &&
    unitValNum > 0;

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canTransferModern || !activeRecord) return;
    const nextNum = 852 + dockets.length;
    const docketId = `PAS-2026-0${nextNum}`;
    const tdNumber = newTdNo.trim() || `TD-26-049${nextNum.toString().slice(-2)}`;
    const ownerName = newOwner.trim();
    const parts = ownerName.split(' ');
    const masked =
      parts.length >= 2 ? `${parts[parts.length - 1]}, ${parts[0][0]}.` : ownerName;

    const newDocketObj: AssessmentDocket = {
      id: docketId,
      capitolId: `CAP-${docketId}`,
      tdNo: tdNumber,
      pin: newPin.trim(),
      lgu: 'Pasacao',
      barangay: newBarangay.trim() || 'Pasacao, Camarines Sur',
      lotNo: newLotNo.trim() || activeRecord.lot,
      owner: ownerName,
      ownerMasked: masked,
      contact: '',
      transactionType: txType,
      classification: newClassification,
      smvSubclass: SMV_DEFAULTS[newClassification].subclass,
      areaSqm: areaNum,
      unitValue: unitValNum,
      assessmentLevel: levelPct,
      marketValue: marketVal,
      assessedValue: assessedVal,
      status: 'Needs Signature',
      submittedAt: 'March 18, 2026 • Just now',
      deficiencies: []
    };

    migrateLegacyToModern(activeRecord.id, newDocketObj);

    setNewOwner('');
    setNewPin('');
    setNewTdNo('');
    setNewLotNo('');
    setNewBarangay('');
    setNewAreaSqm('');
    setNewUnitValue('');
    setShowTransferModal(false);
    onMigrateToDraft && onMigrateToDraft(newDocketObj);
  };

  return (
    <div className="p-5 sm:p-6 space-y-5">
      <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900">
            Historical Cadastre Vault
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Compare digitized historical paper ledgers against modern draft records and transfer vintage records into the active system. Source records remain preserved read-only.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowDigitizeModal(true)}
          className="min-h-[42px] px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-bold flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4 text-emerald-400" aria-hidden="true" />
          <span>Digitize Paper Ledger</span>
        </button>
      </div>

      {/* Persistent Search Label */}
      <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-2xs">
        <label htmlFor="legacy-vault-search" className="block text-xs font-bold text-slate-800 mb-1.5">
          Search Historical Cadastre Ledgers (Vintage TD, Historical Owner, or Cadastral Lot)
        </label>
        <div className="relative">
          <Search
            className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            id="legacy-vault-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter Vintage TD, historical owner name, or cadastral lot..."
            className="w-full min-h-[42px] bg-white border border-slate-400 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Match List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Archival Matches ({filtered.length})
          </div>
          {filtered.map((rec) => (
            <button
              key={rec.id}
              type="button"
              onClick={() => setSelectedId(rec.id)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                activeRecord?.id === rec.id
                  ? 'bg-white border-slate-900 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-400'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-bold text-sm text-slate-900">
                  Vintage TD #{rec.vintageTd}
                </span>
                <span className="text-xs font-bold bg-amber-100 text-amber-950 border border-amber-400 px-2 py-0.5 rounded">
                  {rec.revision}
                </span>
              </div>
              <div className="text-xs font-bold text-slate-800 mt-1">{rec.owner}</div>
              <p className="text-xs text-slate-600 mt-0.5">{rec.lot}</p>
              <div className="text-xs font-mono text-slate-700 mt-2 pt-2 border-t border-slate-200">
                {rec.location}
              </div>
            </button>
          ))}
        </div>

        {/* Right Side-by-Side Archival Scan & Transfer to Modern System */}
        {activeRecord && (
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-300 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="font-bold text-sm text-slate-900">
                Archive Source vs. Modern Assessment Mapping
              </h2>
              <span className="text-xs font-mono bg-slate-100 border border-slate-300 px-2 py-0.5 rounded text-slate-800">
                Read-Only 1200 DPI Master
              </span>
            </div>

            <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-5 font-serif text-xs text-amber-950 space-y-3">
              <div className="text-center border-b border-amber-400 pb-2">
                <div className="font-sans text-xs font-bold uppercase tracking-wider">
                  Republic of the Philippines • Province of Camarines Sur
                </div>
                <div className="text-sm font-bold mt-0.5">
                  DECLARACION DE PROPIEDAD REAL ({activeRecord.revision})
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
                <div>DECLARANTE: {activeRecord.owner}</div>
                <div>VINTAGE TD: #{activeRecord.vintageTd}</div>
                <div>CADASTRAL: {activeRecord.lot}</div>
                <div>AREA: {activeRecord.area}</div>
              </div>
              <div className="p-3 bg-white/80 border border-amber-400 rounded font-sans text-xs">
                <strong>Archival Transcription:</strong> &ldquo;{activeRecord.transcription}&rdquo;
              </div>
            </div>

            {activeRecord.modernDraftTarget && (
              <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-400 text-xs text-emerald-950 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <strong>Linked Modern Record:</strong> {activeRecord.modernDraftTarget}. Creating or transferring a modern record preserves the original archival source untouched.
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() =>
                  pushToast(
                    'Certified True Copy Queued',
                    `Prepared 1200 DPI Certified True Copy of Vintage TD #${activeRecord.vintageTd}.`,
                    'info'
                  )
                }
                className="min-h-[42px] px-4 py-2 border border-slate-400 text-xs font-bold text-slate-800 rounded-lg hover:bg-slate-100 flex items-center gap-2"
              >
                <Printer className="w-4 h-4" aria-hidden="true" />
                <span>Print Certified True Copy</span>
              </button>

              <button
                type="button"
                onClick={() => setShowTransferModal(true)}
                className="min-h-[42px] px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg flex items-center gap-2"
              >
                <FileInput className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                <span>Transfer Record to Modern System</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: Digitize New Historical Paper Ledger (Blank Form) */}
      {showDigitizeModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="digitize-modal-title"
          className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4"
        >
          <form
            onSubmit={handleDigitizeSubmit}
            className="bg-white rounded-2xl border-2 border-slate-900 max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 id="digitize-modal-title" className="text-base font-bold text-slate-900">
                  Digitize &amp; Ingest Historical Paper Ledger
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Encode physical archive details into the read-only Historical Cadastre Vault.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDigitizeModal(false)}
                aria-label="Close digitize modal"
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label htmlFor="dig-td" className="block font-bold text-slate-800 mb-1">
                  Vintage TD Number
                </label>
                <input
                  id="dig-td"
                  type="text"
                  placeholder="e.g. 1970-0814"
                  value={digVintageTd}
                  onChange={(e) => setDigVintageTd(e.target.value)}
                  className="w-full min-h-[40px] border border-slate-400 rounded-lg px-3 py-2 font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label htmlFor="dig-rev" className="block font-bold text-slate-800 mb-1">
                  General Revision Era
                </label>
                <input
                  id="dig-rev"
                  type="text"
                  placeholder="e.g. 1970 Revision"
                  value={digRevision}
                  onChange={(e) => setDigRevision(e.target.value)}
                  className="w-full min-h-[40px] border border-slate-400 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="dig-owner" className="block font-bold text-slate-800 mb-1">
                  Original Historical Declarant
                </label>
                <input
                  id="dig-owner"
                  type="text"
                  placeholder="Enter original owner name from paper ledger..."
                  value={digOwner}
                  onChange={(e) => setDigOwner(e.target.value)}
                  className="w-full min-h-[40px] border border-slate-400 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="dig-lot" className="block font-bold text-slate-800 mb-1">
                  Cadastral Lot &amp; Barangay
                </label>
                <input
                  id="dig-lot"
                  type="text"
                  placeholder="e.g. Cadastral Lot 2210, Brgy. Balogo, Pasacao"
                  value={digLot}
                  onChange={(e) => setDigLot(e.target.value)}
                  className="w-full min-h-[40px] border border-slate-400 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label htmlFor="dig-area" className="block font-bold text-slate-800 mb-1">
                  Recorded Area
                </label>
                <input
                  id="dig-area"
                  type="text"
                  placeholder="e.g. 600.00 sqm"
                  value={digArea}
                  onChange={(e) => setDigArea(e.target.value)}
                  className="w-full min-h-[40px] border border-slate-400 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label htmlFor="dig-loc" className="block font-bold text-slate-800 mb-1">
                  Physical Shelf / Binder Location
                </label>
                <input
                  id="dig-loc"
                  type="text"
                  placeholder="e.g. Vault Room A, Shelf 3, Binder 1970-B"
                  value={digLocation}
                  onChange={(e) => setDigLocation(e.target.value)}
                  className="w-full min-h-[40px] border border-slate-400 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="dig-trans" className="block font-bold text-slate-800 mb-1">
                  Archival Callout Transcription
                </label>
                <textarea
                  id="dig-trans"
                  rows={2}
                  placeholder="Transcribe handwritten marginal notes or partition remarks..."
                  value={digTranscription}
                  onChange={(e) => setDigTranscription(e.target.value)}
                  className="w-full border border-slate-400 rounded-lg p-2.5 text-slate-900"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowDigitizeModal(false)}
                className="min-h-[40px] px-4 py-2 border border-slate-400 rounded-lg text-xs font-bold text-slate-800 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!canDigitize}
                className="min-h-[40px] px-5 py-2 bg-slate-900 hover:bg-black disabled:bg-slate-300 disabled:text-slate-600 text-white rounded-lg text-xs font-bold"
              >
                Save to Historical Vault
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: Transfer Historical Record into Modern System (Blank Form) */}
      {showTransferModal && activeRecord && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="transfer-legacy-title"
          className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4"
        >
          <form
            onSubmit={handleTransferSubmit}
            className="bg-white rounded-2xl border-2 border-slate-900 max-w-4xl w-full p-6 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 id="transfer-legacy-title" className="text-base font-bold text-slate-900">
                  Transfer Historical Record to Modern Assessment System
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Source Vintage TD #{activeRecord.vintageTd} stays preserved read-only while generating a new modern Property Record &amp; Assessment Docket.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowTransferModal(false)}
                aria-label="Close transfer modal"
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Left: Read-Only Historical Source Reference */}
              <div className="lg:col-span-5 bg-amber-50 border border-amber-300 rounded-xl p-4 space-y-2 text-xs text-amber-950">
                <div className="font-bold uppercase tracking-wider text-[11px] text-amber-900">
                  Read-Only Historical Source
                </div>
                <div className="font-mono font-bold text-sm">Vintage TD #{activeRecord.vintageTd}</div>
                <div>
                  <strong>Original Owner:</strong> {activeRecord.owner}
                </div>
                <div>
                  <strong>Lot / Location:</strong> {activeRecord.lot}
                </div>
                <div>
                  <strong>Recorded Area:</strong> {activeRecord.area}
                </div>
                <div className="pt-2 border-t border-amber-300 text-[11px]">
                  <strong>Notes:</strong> {activeRecord.transcription}
                </div>
              </div>

              {/* Right: Blank Modern Transfer Form */}
              <div className="lg:col-span-7 space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="mig-tx" className="block font-bold text-slate-800 mb-1">
                      Transaction Type
                    </label>
                    <select
                      id="mig-tx"
                      value={txType}
                      onChange={(e) => setTxType(e.target.value as any)}
                      className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-3 py-2 font-semibold text-slate-900"
                    >
                      <option value="Transfer">Transfer of Ownership (Conveyance)</option>
                      <option value="Discovery">Migration / Initial Digital Encoding</option>
                      <option value="Reassessment">Reassessment / Subdivision</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="mig-pin" className="block font-bold text-slate-800 mb-1">
                      Assigned Modern PIN (Required)
                    </label>
                    <input
                      id="mig-pin"
                      type="text"
                      placeholder="e.g. 024-18-0012-005-25"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      className="w-full min-h-[40px] border border-slate-400 rounded-lg px-3 py-2 font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="mig-owner" className="block font-bold text-slate-800 mb-1">
                      New / Current Property Owner (Required)
                    </label>
                    <input
                      id="mig-owner"
                      type="text"
                      placeholder="Enter current declarant or transferee full name..."
                      value={newOwner}
                      onChange={(e) => setNewOwner(e.target.value)}
                      className="w-full min-h-[40px] border border-slate-400 rounded-lg px-3 py-2 font-semibold text-slate-900"
                    />
                  </div>

                  <div>
                    <label htmlFor="mig-td" className="block font-bold text-slate-800 mb-1">
                      New Modern TD No. (Optional)
                    </label>
                    <input
                      id="mig-td"
                      type="text"
                      placeholder="Auto-assigned if blank"
                      value={newTdNo}
                      onChange={(e) => setNewTdNo(e.target.value)}
                      className="w-full min-h-[40px] border border-slate-400 rounded-lg px-3 py-2 font-mono text-slate-900"
                    />
                  </div>

                  <div>
                    <label htmlFor="mig-brgy" className="block font-bold text-slate-800 mb-1">
                      Barangay / Municipality
                    </label>
                    <input
                      id="mig-brgy"
                      type="text"
                      placeholder="e.g. Brgy. Sta. Rosa del Sur, Pasacao"
                      value={newBarangay}
                      onChange={(e) => setNewBarangay(e.target.value)}
                      className="w-full min-h-[40px] border border-slate-400 rounded-lg px-3 py-2 text-slate-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="mig-lot" className="block font-bold text-slate-800 mb-1">
                      Subdivided / Modern Cadastral Lot
                    </label>
                    <input
                      id="mig-lot"
                      type="text"
                      placeholder="e.g. Lot 4102-C, Psd-05-01294"
                      value={newLotNo}
                      onChange={(e) => setNewLotNo(e.target.value)}
                      className="w-full min-h-[40px] border border-slate-400 rounded-lg px-3 py-2 text-slate-900"
                    />
                  </div>

                  <div>
                    <label htmlFor="mig-class" className="block font-bold text-slate-800 mb-1">
                      Classification (SMV)
                    </label>
                    <select
                      id="mig-class"
                      value={newClassification}
                      onChange={(e) => setNewClassification(e.target.value as PropertyClassification)}
                      className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-3 py-2 font-semibold text-slate-900"
                    >
                      <option value="Residential">Residential (20%)</option>
                      <option value="Agricultural">Agricultural (40%)</option>
                      <option value="Commercial">Commercial (50%)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="mig-area" className="block font-bold text-slate-800 mb-1">
                        Area (sqm)
                      </label>
                      <input
                        id="mig-area"
                        type="number"
                        min={1}
                        placeholder="sqm"
                        value={newAreaSqm}
                        onChange={(e) => setNewAreaSqm(e.target.value)}
                        className="w-full min-h-[40px] border border-slate-400 rounded-lg px-2.5 py-2 font-mono font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label htmlFor="mig-rate" className="block font-bold text-slate-800 mb-1">
                        Unit Rate (₱)
                      </label>
                      <input
                        id="mig-rate"
                        type="number"
                        min={1}
                        placeholder="₱/sqm"
                        value={newUnitValue}
                        onChange={(e) => setNewUnitValue(e.target.value)}
                        className="w-full min-h-[40px] border border-slate-400 rounded-lg px-2.5 py-2 font-mono font-bold text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 text-white flex items-center justify-between font-mono">
                  <span className="font-sans font-bold">
                    Calculated Assessed Value ({levelPct}%):
                  </span>
                  <strong className="text-sm text-emerald-300">
                    ₱{assessedVal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </strong>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowTransferModal(false)}
                className="min-h-[42px] px-4 py-2 border border-slate-400 rounded-lg text-xs font-bold text-slate-800 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!canTransferModern}
                className="min-h-[42px] px-5 py-2 bg-slate-900 hover:bg-black disabled:bg-slate-300 disabled:text-slate-600 text-white rounded-lg text-xs font-bold flex items-center gap-2"
              >
                <span>Create Modern Property Record &amp; Open in FAAS</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
