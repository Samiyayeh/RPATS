import React, { useState } from 'react';
import { Calculator, CheckCircle2, FileEdit, History, PlusCircle, X } from 'lucide-react';
import { PropertyClassification } from '../types/rpatis';
import { useRpatis } from '../context/RpatisContext';

interface ViewSmvMatrixProps {
  onApplyRate?: (classification: PropertyClassification, unitValue: number, level: number) => void;
}

const CATEGORY_SORT_ORDER: Record<PropertyClassification, number> = {
  Residential: 1,
  Agricultural: 2,
  Commercial: 3
};

export const ViewSmvMatrix: React.FC<ViewSmvMatrixProps> = ({ onApplyRate }) => {
  const {
    dockets,
    activeDocketId,
    smvRates,
    activeSmvNotice,
    smvRevisions,
    updateSmvFromNotice,
    pushToast
  } = useRpatis();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [testArea, setTestArea] = useState('');

  // Blank-by-default Modal State for Updating SMV from New Provincial Notice
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [noticeMode, setNoticeMode] = useState<'revise' | 'add'>('revise');
  const [targetId, setTargetId] = useState('');
  const [noticeRef, setNoticeRef] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [newCategory, setNewCategory] = useState<PropertyClassification | ''>('');
  const [newSubclass, setNewSubclass] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newZones, setNewZones] = useState('');
  const [newRate, setNewRate] = useState('');
  const [newLevel, setNewLevel] = useState('');
  const [remarks, setRemarks] = useState('');

  const sortedSmvRates = [...smvRates].sort((a, b) => {
    const ca = CATEGORY_SORT_ORDER[a.category] ?? 99;
    const cb = CATEGORY_SORT_ORDER[b.category] ?? 99;
    return ca !== cb ? ca - cb : a.subclass.localeCompare(b.subclass, undefined, { numeric: true });
  });

  const selectedRow = sortedSmvRates[selectedIndex] || sortedSmvRates[0];
  const activeDocket = dockets.find((d) => d.id === activeDocketId) || dockets[0];

  const areaNum = Number(testArea) || 0;
  const proposedMarket = selectedRow ? areaNum * selectedRow.rate : 0;
  const proposedAssessed = selectedRow ? (proposedMarket * selectedRow.level) / 100 : 0;

  const targetExisting = targetId ? smvRates.find((r) => r.id === targetId) : undefined;

  const resetNoticeModalFields = () => {
    setTargetId('');
    setNoticeRef('');
    setEffectiveDate('');
    setNewCategory('');
    setNewSubclass('');
    setNewDescription('');
    setNewZones('');
    setNewRate('');
    setNewLevel('');
    setRemarks('');
  };

  const openNoticeModal = (mode: 'revise' | 'add', preselectId = '') => {
    resetNoticeModalFields();
    setNoticeMode(mode);
    setTargetId(preselectId);
    setShowNoticeModal(true);
  };

  const rateNum = Number(newRate) || 0;
  const levelNum = Number(newLevel) || 0;

  const canSubmitNotice =
    noticeRef.trim().length > 0 &&
    effectiveDate.trim().length > 0 &&
    rateNum > 0 &&
    (noticeMode === 'revise'
      ? Boolean(targetExisting) && (newLevel.trim() === '' || (levelNum > 0 && levelNum <= 100))
      : Boolean(newCategory) && newSubclass.trim().length > 0 && levelNum > 0 && levelNum <= 100);

  const handleSubmitNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmitNotice) return;

    if (noticeMode === 'revise' && targetExisting) {
      updateSmvFromNotice({
        targetId: targetExisting.id,
        category: targetExisting.category,
        subclass: targetExisting.subclass,
        description: newDescription,
        zones: newZones,
        rate: rateNum,
        level: newLevel.trim() ? levelNum : targetExisting.level,
        noticeRef,
        effectiveDate,
        remarks
      });
    } else if (noticeMode === 'add' && newCategory) {
      updateSmvFromNotice({
        category: newCategory,
        subclass: newSubclass,
        description: newDescription,
        zones: newZones,
        rate: rateNum,
        level: levelNum,
        noticeRef,
        effectiveDate,
        remarks
      });
    }

    resetNoticeModalFields();
    setShowNoticeModal(false);
  };

  return (
    <div className="p-5 sm:p-6 space-y-5">
      <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900">
            Provincial Schedule of Base Market Values (SMV Matrix)
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Active Schedule: <strong>{activeSmvNotice.ref}</strong> (Effective{' '}
            <span className="font-mono font-semibold">{activeSmvNotice.effectiveDate}</span>) • Statutory Assessment
            Levels under Section 218, RA 7160.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openNoticeModal('revise')}
          className="min-h-[42px] px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-bold flex items-center gap-2 shrink-0"
        >
          <PlusCircle className="w-4 h-4 text-emerald-400" aria-hidden="true" />
          <span>Update SMV from New Notice</span>
        </button>
      </div>

      {/* SMV Table */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-2xs overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 uppercase tracking-wider">
              <th scope="col" className="py-3 px-4">Sub-Class &amp; Governing Notice</th>
              <th scope="col" className="py-3 px-4">Description</th>
              <th scope="col" className="py-3 px-4">Applicable Pasacao Barangays</th>
              <th scope="col" className="py-3 px-4 text-right">Unit Value (PHP/sqm)</th>
              <th scope="col" className="py-3 px-4 text-right">Statutory Level</th>
              <th scope="col" className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {sortedSmvRates.map((row, idx) => (
              <tr
                key={row.id}
                className={selectedIndex === idx ? 'bg-blue-50/70' : 'hover:bg-slate-50'}
              >
                <td className="py-3.5 px-4">
                  <div className="font-bold text-slate-900">{row.subclass}</div>
                  <div className="text-[11px] font-mono text-slate-600 mt-0.5">
                    {row.ordinanceRef} • Eff. {row.effectiveDate}
                  </div>
                </td>
                <td className="py-3.5 px-4 text-slate-700 max-w-xs">{row.description}</td>
                <td className="py-3.5 px-4 font-medium text-slate-800">{row.zones}</td>
                <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                  ₱{row.rate.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800 whitespace-nowrap">
                  {row.level}%
                </td>
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openNoticeModal('revise', row.id)}
                      className="min-h-[36px] px-2.5 py-1.5 rounded-lg text-xs font-bold border border-slate-400 bg-white text-slate-800 hover:bg-slate-100 inline-flex items-center gap-1"
                    >
                      <FileEdit className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Revise</span>
                    </button>
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
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Explicit Destination & Current vs. Proposed Comparison */}
      {selectedRow && (
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
                placeholder="Enter area in sqm"
                value={testArea}
                onChange={(e) => setTestArea(e.target.value)}
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
      )}

      {/* Provincial SMV Notice Revision Audit Log */}
      {smvRevisions.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-300 shadow-2xs overflow-x-auto">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
            <History className="w-4 h-4 text-slate-700" aria-hidden="true" />
            <span>Provincial SMV Notice Revision Log ({smvRevisions.length})</span>
          </div>
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-800 border-b border-slate-300">
                <th scope="col" className="py-2.5 px-4 font-bold">Notice / Ordinance Ref.</th>
                <th scope="col" className="py-2.5 px-4 font-bold">Action &amp; Sub-Class</th>
                <th scope="col" className="py-2.5 px-4 font-bold">Rate Revision</th>
                <th scope="col" className="py-2.5 px-4 font-bold">Remarks</th>
                <th scope="col" className="py-2.5 px-4 font-bold">Updated By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {smvRevisions.map((rev) => (
                <tr key={rev.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-mono font-bold text-slate-900">{rev.noticeRef}</div>
                    <div className="text-[11px] text-slate-600 font-mono">Eff. {rev.effectiveDate}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-900 font-bold text-[11px]">
                      {rev.action}
                    </span>
                    <div className="font-bold text-slate-900 mt-1">{rev.subclass}</div>
                  </td>
                  <td className="py-3 px-4 font-mono whitespace-nowrap">
                    {rev.previousRate !== undefined ? (
                      <span>
                        ₱{rev.previousRate.toLocaleString()} →{' '}
                        <strong className="text-emerald-800">₱{rev.newRate.toLocaleString()}/sqm</strong>
                      </span>
                    ) : (
                      <strong className="text-emerald-800">₱{rev.newRate.toLocaleString()}/sqm</strong>
                    )}
                    <div className="text-[11px] text-slate-600">Level: {rev.newLevel}%</div>
                  </td>
                  <td className="py-3 px-4 text-slate-700 max-w-xs">{rev.remarks}</td>
                  <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                    <div className="font-semibold text-slate-900">{rev.updatedBy}</div>
                    <div className="text-[11px] text-slate-500">{rev.updatedAt}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Update SMV from New Provincial Notice (Strictly Blank by Default) */}
      {showNoticeModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="smv-notice-modal-title"
          className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4"
        >
          <form
            onSubmit={handleSubmitNotice}
            className="bg-white rounded-2xl border-2 border-slate-900 max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 id="smv-notice-modal-title" className="text-base font-bold text-slate-900">
                  Update Provincial SMV from New Notice / Ordinance
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Revise an existing base market value or register a new SMV sub-class per Provincial Assessor notice.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  resetNoticeModalFields();
                  setShowNoticeModal(false);
                }}
                aria-label="Close SMV update modal"
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switch */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setNoticeMode('revise');
                  setNewCategory('');
                  setNewSubclass('');
                }}
                className={`min-h-[40px] px-3 py-2 rounded-lg text-xs font-bold border ${
                  noticeMode === 'revise'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-800 border-slate-400 hover:bg-slate-100'
                }`}
              >
                Revise Existing Sub-Class
              </button>
              <button
                type="button"
                onClick={() => {
                  setNoticeMode('add');
                  setTargetId('');
                }}
                className={`min-h-[40px] px-3 py-2 rounded-lg text-xs font-bold border ${
                  noticeMode === 'add'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-800 border-slate-400 hover:bg-slate-100'
                }`}
              >
                Add New Sub-Class
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label htmlFor="smv-notice-ref" className="block font-bold text-slate-800 mb-1">
                  New Notice / Ordinance Reference (Required)
                </label>
                <input
                  id="smv-notice-ref"
                  type="text"
                  placeholder="e.g. Provincial Ordinance No. 2026-04"
                  value={noticeRef}
                  onChange={(e) => setNoticeRef(e.target.value)}
                  className="w-full min-h-[40px] border border-slate-400 rounded-lg px-3 py-2 font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label htmlFor="smv-eff-date" className="block font-bold text-slate-800 mb-1">
                  Effectivity Date (Required)
                </label>
                <input
                  id="smv-eff-date"
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="w-full min-h-[40px] border border-slate-400 rounded-lg px-3 py-2 font-mono text-slate-900"
                />
              </div>

              {noticeMode === 'revise' ? (
                <>
                  <div className="sm:col-span-2">
                    <label htmlFor="smv-target-select" className="block font-bold text-slate-800 mb-1">
                      Select Sub-Class to Revise (Required)
                    </label>
                    <select
                      id="smv-target-select"
                      value={targetId}
                      onChange={(e) => setTargetId(e.target.value)}
                      className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-3 py-2 font-semibold text-slate-900"
                    >
                      <option value="">-- Select existing sub-class --</option>
                      {sortedSmvRates.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.subclass} — Current ₱{r.rate.toLocaleString()}/sqm ({r.level}%)
                        </option>
                      ))}
                    </select>
                  </div>

                  {targetExisting && (
                    <div className="sm:col-span-2 p-3 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-2">
                      <span>
                        Current Rate: <strong className="font-mono text-slate-900">₱{targetExisting.rate.toLocaleString()}/sqm</strong> • Assessment Level: <strong className="font-mono text-slate-900">{targetExisting.level}%</strong>
                      </span>
                      <span className="font-mono text-[11px]">{targetExisting.ordinanceRef}</span>
                    </div>
                  )}

                  <div>
                    <label htmlFor="smv-new-rate" className="block font-bold text-slate-800 mb-1">
                      New Unit Value (PHP/sqm) (Required)
                    </label>
                    <input
                      id="smv-new-rate"
                      type="number"
                      min={1}
                      placeholder="Enter new rate per sqm"
                      value={newRate}
                      onChange={(e) => setNewRate(e.target.value)}
                      className="w-full min-h-[40px] border border-slate-400 rounded-lg px-3 py-2 font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label htmlFor="smv-new-level" className="block font-bold text-slate-800 mb-1">
                      New Assessment Level (%) (Optional)
                    </label>
                    <input
                      id="smv-new-level"
                      type="number"
                      min={1}
                      max={100}
                      placeholder="Leave blank to keep current"
                      value={newLevel}
                      onChange={(e) => setNewLevel(e.target.value)}
                      className="w-full min-h-[40px] border border-slate-400 rounded-lg px-3 py-2 font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="smv-new-zones" className="block font-bold text-slate-800 mb-1">
                      Updated Applicable Barangays (Optional)
                    </label>
                    <input
                      id="smv-new-zones"
                      type="text"
                      placeholder="Leave blank to keep existing barangay coverage"
                      value={newZones}
                      onChange={(e) => setNewZones(e.target.value)}
                      className="w-full min-h-[40px] border border-slate-400 rounded-lg px-3 py-2 text-slate-900"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label htmlFor="smv-add-cat" className="block font-bold text-slate-800 mb-1">
                      Property Classification (Required)
                    </label>
                    <select
                      id="smv-add-cat"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as PropertyClassification | '')}
                      className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-3 py-2 font-semibold text-slate-900"
                    >
                      <option value="">-- Select classification --</option>
                      <option value="Residential">Residential</option>
                      <option value="Agricultural">Agricultural</option>
                      <option value="Commercial">Commercial</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="smv-add-sub" className="block font-bold text-slate-800 mb-1">
                      Sub-Class Code &amp; Title (Required)
                    </label>
                    <input
                      id="smv-add-sub"
                      type="text"
                      placeholder="e.g. C-2 (Commercial Second Class)"
                      value={newSubclass}
                      onChange={(e) => setNewSubclass(e.target.value)}
                      className="w-full min-h-[40px] border border-slate-400 rounded-lg px-3 py-2 text-slate-900"
                    />
                  </div>

                  <div>
                    <label htmlFor="smv-add-rate" className="block font-bold text-slate-800 mb-1">
                      Unit Value (PHP/sqm) (Required)
                    </label>
                    <input
                      id="smv-add-rate"
                      type="number"
                      min={1}
                      placeholder="Enter rate per sqm"
                      value={newRate}
                      onChange={(e) => setNewRate(e.target.value)}
                      className="w-full min-h-[40px] border border-slate-400 rounded-lg px-3 py-2 font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label htmlFor="smv-add-level" className="block font-bold text-slate-800 mb-1">
                      Assessment Level (%) (Required)
                    </label>
                    <input
                      id="smv-add-level"
                      type="number"
                      min={1}
                      max={100}
                      placeholder="e.g. 50"
                      value={newLevel}
                      onChange={(e) => setNewLevel(e.target.value)}
                      className="w-full min-h-[40px] border border-slate-400 rounded-lg px-3 py-2 font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="smv-add-zones" className="block font-bold text-slate-800 mb-1">
                      Applicable Pasacao Barangays
                    </label>
                    <input
                      id="smv-add-zones"
                      type="text"
                      placeholder="e.g. Sta. Rosa del Norte, San Roque"
                      value={newZones}
                      onChange={(e) => setNewZones(e.target.value)}
                      className="w-full min-h-[40px] border border-slate-400 rounded-lg px-3 py-2 text-slate-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="smv-add-desc" className="block font-bold text-slate-800 mb-1">
                      Schedule Description
                    </label>
                    <input
                      id="smv-add-desc"
                      type="text"
                      placeholder="e.g. Secondary commercial corridor & public road frontage"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      className="w-full min-h-[40px] border border-slate-400 rounded-lg px-3 py-2 text-slate-900"
                    />
                  </div>
                </>
              )}

              <div className="sm:col-span-2">
                <label htmlFor="smv-notice-remarks" className="block font-bold text-slate-800 mb-1">
                  Notice Basis / Revision Remarks (Optional)
                </label>
                <textarea
                  id="smv-notice-remarks"
                  rows={2}
                  placeholder="Summarize the Sangguniang Panlalawigan ordinance or Provincial Assessor memorandum basis..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full border border-slate-400 rounded-lg p-2.5 text-slate-900"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  resetNoticeModalFields();
                  setShowNoticeModal(false);
                }}
                className="min-h-[40px] px-4 py-2 border border-slate-400 rounded-lg text-xs font-bold text-slate-800 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!canSubmitNotice}
                className="min-h-[40px] px-5 py-2 bg-slate-900 hover:bg-black disabled:bg-slate-300 disabled:text-slate-600 text-white rounded-lg text-xs font-bold"
              >
                Apply Notice &amp; Update SMV Schedule
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
