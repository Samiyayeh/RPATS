import React, { useState } from 'react';
import { Calculator, CheckCircle2 } from 'lucide-react';
import { PropertyClassification } from '../types/rpatis';
import { useRpatis } from '../context/RpatisContext';

interface ViewSmvMatrixProps {
  onApplyRate?: (classification: PropertyClassification, unitValue: number, level: number) => void;
}

const SMV_ROWS: Array<{
  category: PropertyClassification;
  subclass: string;
  description: string;
  zones: string;
  rate: number;
  level: number;
}> = [
  {
    category: 'Residential',
    subclass: 'R-1 (Residential First Class)',
    description: 'Paved concrete road frontage, complete water & power access',
    zones: 'Poblacion, Sta. Rosa del Sur, Balogo, Odicon',
    rate: 1200,
    level: 20
  },
  {
    category: 'Residential',
    subclass: 'R-2 (Residential Second Class)',
    description: 'Gravel road, interior access within 500m of main highway',
    zones: 'Macad, San Roque, Dalupaon',
    rate: 1000,
    level: 20
  },
  {
    category: 'Agricultural',
    subclass: 'Ag-1 (Irrigated Riceland / Coconut)',
    description: 'Productive agricultural land under Section 218 RA 7160',
    zones: 'Caranan, Tinalmud, Itulan',
    rate: 85,
    level: 40
  },
  {
    category: 'Commercial',
    subclass: 'C-1 (Commercial First Class)',
    description: 'Primary commercial strip and municipal market perimeter',
    zones: 'Dalupaon Highway, Cuco, Poblacion Market',
    rate: 2500,
    level: 50
  }
];

export const ViewSmvMatrix: React.FC<ViewSmvMatrixProps> = ({ onApplyRate }) => {
  const { dockets, activeDocketId, pushToast } = useRpatis();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [testArea, setTestArea] = useState(450);

  const selectedRow = SMV_ROWS[selectedIndex];
  const activeDocket = dockets.find((d) => d.id === activeDocketId) || dockets[0];

  const proposedMarket = testArea * selectedRow.rate;
  const proposedAssessed = (proposedMarket * selectedRow.level) / 100;

  return (
    <div className="p-5 sm:p-6 space-y-5">
      <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-2xs">
        <h1 className="text-lg font-bold text-slate-900">
          Provincial Schedule of Base Market Values (SMV Matrix 2024)
        </h1>
        <p className="text-xs text-slate-600 mt-0.5">
          Camarines Sur Provincial Ordinance No. 2024-08 • Statutory Assessment Levels under Section 218, Republic Act 7160.
        </p>
      </div>

      {/* SMV Table */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-2xs overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 uppercase tracking-wider">
              <th scope="col" className="py-3 px-4">Sub-Class</th>
              <th scope="col" className="py-3 px-4">Description</th>
              <th scope="col" className="py-3 px-4">Applicable Pasacao Barangays</th>
              <th scope="col" className="py-3 px-4 text-right">Unit Value (PHP/sqm)</th>
              <th scope="col" className="py-3 px-4 text-right">Statutory Level</th>
              <th scope="col" className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {SMV_ROWS.map((row, idx) => (
              <tr
                key={row.subclass}
                className={selectedIndex === idx ? 'bg-blue-50/70' : 'hover:bg-slate-50'}
              >
                <td className="py-3.5 px-4 font-bold text-slate-900">{row.subclass}</td>
                <td className="py-3.5 px-4 text-slate-700 max-w-xs">{row.description}</td>
                <td className="py-3.5 px-4 font-medium text-slate-800">{row.zones}</td>
                <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                  ₱{row.rate.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800">
                  {row.level}%
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => setSelectedIndex(idx)}
                    className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold border ${
                      selectedIndex === idx
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-800 border-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    {selectedIndex === idx ? 'Selected' : 'Compare'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Explicit Destination & Current vs. Proposed Comparison (Findings [11, 16]) */}
      <div className="bg-white border-2 border-slate-900 rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Calculator className="w-5 h-5" aria-hidden="true" />
            <span>Rate Applicability &amp; Draft Update Preview</span>
          </div>
          <div className="text-xs font-mono bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-lg text-slate-800">
            Target Docket: <strong>{activeDocket.id}</strong> ({activeDocket.owner})
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label htmlFor="smv-test-area" className="block text-xs font-bold text-slate-800 mb-1">
              Test Area (sqm)
            </label>
            <input
              id="smv-test-area"
              type="number"
              min={1}
              value={testArea}
              onChange={(e) => setTestArea(Math.max(1, Number(e.target.value)))}
              className="w-full min-h-[42px] bg-white border border-slate-400 rounded-lg px-3 py-2 text-sm font-mono font-bold text-slate-900"
            />
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-300 text-xs">
            <div className="text-slate-600 font-semibold">Current Docket Assessed Value</div>
            <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
              ₱{activeDocket.assessedValue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-400 text-xs">
            <div className="text-emerald-900 font-semibold">
              Proposed ({selectedRow.subclass} @ {selectedRow.level}%)
            </div>
            <div className="font-mono font-bold text-emerald-950 text-sm mt-0.5">
              ₱{proposedAssessed.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              pushToast(
                'SMV Rate Applied to Draft',
                `Applied ${selectedRow.subclass} (₱${selectedRow.rate}/sqm, ${selectedRow.level}%) to ${activeDocket.id}.`,
                'success'
              );
              onApplyRate && onApplyRate(selectedRow.category, selectedRow.rate, selectedRow.level);
            }}
            className="min-h-[44px] px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" aria-hidden="true" />
            <span>Apply {selectedRow.subclass} Rate to Active Draft</span>
          </button>
        </div>
      </div>
    </div>
  );
};
