import React, { useState } from 'react';
import { Search, Printer, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useRpatis } from '../context/RpatisContext';

interface ViewLegacyVaultProps {
  onMigrateToDraft?: () => void;
}

const ARCHIVE_RECORDS = [
  {
    id: 1,
    vintageTd: '1949-0412',
    revision: '1949 Foundation',
    owner: 'Don Mariano Dela Cruz (Deceased 1968)',
    lot: 'Cadastral Lot 4102 (Original Madre Lot), Pasacao',
    area: '1,800.00 sqm (Subdivided into 4 lots in 1972)',
    location: 'Vault Room B, Shelf 4, Binder 1949-A',
    transcription:
      'Lote original dividido en cuatro partes segun Escritura de Particion de Fecha 12 de Junio de 1972.',
    modernDraftTarget: 'PAS-2026-0849 • Juan M. Dela Cruz (Lot 4102-B, 450 sqm)'
  },
  {
    id: 2,
    vintageTd: '1967-1189',
    revision: '1967 General Revision',
    owner: 'Fausto M. Asido',
    lot: 'Cadastral Lot 3891, Brgy. Caranan, Pasacao',
    area: '1,280.00 sqm',
    location: 'Vault Room A, Shelf 2, Binder 1967-08',
    transcription:
      'Original coastal agricultural lot reclassified along Caranan municipal highway.',
    modernDraftTarget: 'PAS-2026-0850 • Caranan Fishing Corp. (Lot 3891-C, 320 sqm)'
  }
];

export const ViewLegacyVault: React.FC<ViewLegacyVaultProps> = ({ onMigrateToDraft }) => {
  const { pushToast } = useRpatis();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<number>(1);

  const filtered = ARCHIVE_RECORDS.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.vintageTd.toLowerCase().includes(q) ||
      r.owner.toLowerCase().includes(q) ||
      r.lot.toLowerCase().includes(q)
    );
  });

  const activeRecord = ARCHIVE_RECORDS.find((r) => r.id === selectedId) || ARCHIVE_RECORDS[0];

  return (
    <div className="p-5 sm:p-6 space-y-5">
      <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-2xs">
        <h1 className="text-lg font-bold text-slate-900">
          Historical Cadastre Vault (1949–Present)
        </h1>
        <p className="text-xs text-slate-600 mt-0.5">
          Compare digitized 1949 paper ledgers against modern draft records. Source records are preserved read-only.
        </p>
      </div>

      {/* Persistent Search Label (Finding [26]) */}
      <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-2xs">
        <label htmlFor="legacy-vault-search" className="block text-xs font-bold text-slate-800 mb-1.5">
          Search 1949–2021 Archival Ledgers (Vintage TD, Historical Owner, or Cadastral Lot)
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
            placeholder="e.g. 1949-0412, Mariano Dela Cruz, Lot 4102..."
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
                selectedId === rec.id
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

        {/* Right Side-by-Side Archival Scan & Proposed Modern Draft Mapping */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-300 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="font-bold text-sm text-slate-900">
              Archive Source vs. Proposed Modern Draft Mapping
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

          {/* Proposed Draft Mapping Callout */}
          <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-400 text-xs text-emerald-950 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <strong>Reversible Modern Draft Target:</strong> {activeRecord.modernDraftTarget}. Creating a modern draft preserves the original 1949 source record untouched.
            </div>
          </div>

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
              onClick={() => {
                pushToast(
                  'Reversible Draft Linked',
                  `Archival provenance from TD #${activeRecord.vintageTd} attached to FAAS Encoder.`,
                  'success'
                );
                onMigrateToDraft && onMigrateToDraft();
              }}
              className="min-h-[42px] px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg flex items-center gap-2"
            >
              <span>Open Linked Modern e-TD Draft</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
