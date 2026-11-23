import React, { useState } from 'react';
import { Award, Printer, CheckCircle2, Receipt, AlertCircle } from 'lucide-react';
import { useRpatis } from '../../context/RpatisContext';
import { CertificationRequest, CertificationType } from '../../types/rpatis';
import { AuthenticQrCode } from '../common/AuthenticQrCode';
import { StatusChip } from '../common/StatusChip';

const CERT_TYPES: CertificationType[] = [
  'Certified True Copy of Tax Declaration',
  'Certification of With / Without Improvement',
  'Certification of Aggregate Landholdings',
  'Certification of Current & Existing Tax Declaration',
  'Certificate of No Property'
];

export const ViewCertifications: React.FC = () => {
  const { assessmentRoll, certifications, issueCertification } = useRpatis();

  const [certType, setCertType] = useState<CertificationType>(CERT_TYPES[0]);
  const [selectedTd, setSelectedTd] = useState<string>('');
  const [requestorName, setRequestorName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [proofChecked, setProofChecked] = useState(false);
  const [spaChecked, setSpaChecked] = useState(false);
  const [treasuryOrNo, setTreasuryOrNo] = useState('');
  const [feeAmount, setFeeAmount] = useState('');
  const [previewCert, setPreviewCert] = useState<CertificationRequest | null>(
    certifications[0] || null
  );

  const selectedRow = assessmentRoll.find((r) => r.tdNo === selectedTd);
  const isNoProperty = certType === 'Certificate of No Property';
  const feeNum = Number(feeAmount) || 0;
  const canIssue =
    requestorName.trim().length > 0 &&
    treasuryOrNo.trim().length >= 4 &&
    feeNum > 0 &&
    (isNoProperty || (selectedTd !== '' && proofChecked));

  const handleIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canIssue) return;
    const issued = issueCertification({
      type: certType,
      tdNo: isNoProperty ? 'N/A (No Property Held)' : selectedRow?.tdNo || selectedTd,
      pin: isNoProperty ? 'N/A' : selectedRow?.pin || '',
      requestorName: requestorName.trim(),
      purpose: purpose.trim() || 'Taxation / Legal Purposes',
      proofOfOwnershipVerified: proofChecked,
      spaVerified: spaChecked,
      treasuryOrNo: treasuryOrNo.trim().toUpperCase(),
      feeAmount: feeNum
    });
    setPreviewCert(issued);
    setSelectedTd('');
    setRequestorName('');
    setPurpose('');
    setTreasuryOrNo('');
    setFeeAmount('');
    setProofChecked(false);
    setSpaChecked(false);
  };

  return (
    <div className="p-5 sm:p-6 space-y-5">
      <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-slate-600">
            Municipal Assessor &gt; Frontline Services &gt; Certifications &amp; Certified True Copies
          </div>
          <h1 className="text-lg font-bold text-slate-900 mt-0.5">
            Issuance of Certifications &amp; Certified True Copies
          </h1>
        </div>
        <div className="text-xs font-semibold bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-lg text-slate-800">
          Charter SLA: <strong>15 minutes</strong> • Fee: <strong>Certification Fee (Treasury OR)</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left: Request Intake & Mandatory Requirements */}
        <form
          onSubmit={handleIssue}
          className="xl:col-span-6 bg-white rounded-xl border border-slate-300 shadow-2xs p-5 space-y-4"
        >
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-2">
            1. Certification Request &amp; Verification
          </h2>

          <div>
            <label htmlFor="cert-type" className="block text-xs font-bold text-slate-800 mb-1">
              Certification Type
            </label>
            <select
              id="cert-type"
              value={certType}
              onChange={(e) => setCertType(e.target.value as CertificationType)}
              className="w-full min-h-[42px] bg-white border border-slate-400 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900"
            >
              {CERT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {!isNoProperty && (
            <div>
              <label htmlFor="cert-td" className="block text-xs font-bold text-slate-800 mb-1">
                Linked Property Record (Assessment Roll)
              </label>
              <select
                id="cert-td"
                value={selectedTd}
                onChange={(e) => setSelectedTd(e.target.value)}
                className="w-full min-h-[42px] bg-white border border-slate-400 rounded-lg px-3 py-2 text-xs font-mono font-semibold text-slate-900"
              >
                <option value="">-- Select Property Record --</option>
                {assessmentRoll.map((r) => (
                  <option key={r.tdNo} value={r.tdNo}>
                    {r.tdNo} — {r.ownerFull} (Brgy. {r.barangay})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="cert-requestor" className="block text-xs font-bold text-slate-800 mb-1">
                Requestor / Property Owner Name
              </label>
              <input
                id="cert-requestor"
                type="text"
                placeholder="Enter requestor full name..."
                value={requestorName}
                onChange={(e) => setRequestorName(e.target.value)}
                className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-3 py-2 text-xs text-slate-900"
              />
            </div>

            <div>
              <label htmlFor="cert-purpose" className="block text-xs font-bold text-slate-800 mb-1">
                Stated Purpose
              </label>
              <input
                id="cert-purpose"
                type="text"
                placeholder="e.g. Conveyance / Bank Requirement"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full min-h-[40px] bg-white border border-slate-400 rounded-lg px-3 py-2 text-xs text-slate-900"
              />
            </div>
          </div>

          {/* Mandatory Requirements Checklist */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-800">
              2. Mandatory Requirements Verification
            </span>

            {!isNoProperty && (
              <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-300 bg-slate-50 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={proofChecked}
                  onChange={(e) => setProofChecked(e.target.checked)}
                  className="w-4 h-4 accent-slate-900 rounded"
                />
                <span className="font-semibold text-slate-900">
                  Proof of Ownership verified against Assessment Roll
                </span>
              </label>
            )}

            <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-300 bg-slate-50 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={spaChecked}
                onChange={(e) => setSpaChecked(e.target.checked)}
                className="w-4 h-4 accent-slate-900 rounded"
              />
              <span className="font-semibold text-slate-900">
                SPA or Written Authorization from Owner (if requested by representative)
              </span>
            </label>
          </div>

          {/* Treasury Certification Fee OR Verification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
            <div>
              <label htmlFor="cert-or" className="block text-xs font-bold text-slate-800 mb-1">
                Municipal Treasurer OR No. (Required)
              </label>
              <div className="relative">
                <Receipt className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  id="cert-or"
                  type="text"
                  placeholder="e.g. OR-7712310"
                  value={treasuryOrNo}
                  onChange={(e) => setTreasuryOrNo(e.target.value)}
                  className="w-full min-h-[42px] bg-white border border-slate-400 rounded-lg pl-9 pr-3 py-2 text-xs font-mono font-bold text-slate-900"
                />
              </div>
            </div>

            <div>
              <label htmlFor="cert-fee" className="block text-xs font-bold text-slate-800 mb-1">
                Certification Fee Paid (PHP)
              </label>
              <input
                id="cert-fee"
                type="number"
                min={1}
                placeholder="e.g. 150"
                value={feeAmount}
                onChange={(e) => setFeeAmount(e.target.value)}
                className="w-full min-h-[42px] bg-white border border-slate-400 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900"
              />
            </div>
          </div>

          {!canIssue && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-400 text-xs text-amber-950 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" aria-hidden="true" />
              <span>
                Verify Proof of Ownership and enter the Municipal Treasurer Official Receipt number before releasing.
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={!canIssue}
            className="w-full min-h-[46px] bg-slate-900 hover:bg-black disabled:bg-slate-300 disabled:text-slate-600 text-white font-bold text-xs rounded-lg px-4 py-2.5 flex items-center justify-center gap-2"
          >
            <Award className="w-4 h-4 text-emerald-400" aria-hidden="true" />
            <span>Sign &amp; Release Official Certification</span>
          </button>
        </form>

        {/* Right: Printable Official Certification Preview */}
        <div className="xl:col-span-6 space-y-5">
          {previewCert && (
            <div className="bg-white rounded-xl border-2 border-slate-900 p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Municipality of Pasacao • Office of the Municipal Assessor
                  </div>
                  <h2 className="text-base font-extrabold text-slate-900 uppercase mt-0.5">
                    {previewCert.type}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="min-h-[38px] px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" aria-hidden="true" />
                  <span>Print</span>
                </button>
              </div>

              <div className="text-xs text-slate-800 leading-relaxed space-y-2">
                <p>
                  <strong>TO WHOM IT MAY CONCERN:</strong> This certifies that based on the official
                  Assessment Rolls of the Municipality of Pasacao, Camarines Sur, this{' '}
                  <strong>{previewCert.type}</strong> is issued to{' '}
                  <strong>{previewCert.requestorName.toUpperCase()}</strong> for{' '}
                  <strong>{previewCert.purpose}</strong>.
                </p>
                <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 grid grid-cols-2 gap-2 font-mono">
                  <div>Cert Serial: <strong>{previewCert.id}</strong></div>
                  <div>Treasury OR: <strong>{previewCert.treasuryOrNo}</strong></div>
                  <div>TD Reference: <strong>{previewCert.tdNo}</strong></div>
                  <div>Fee Settled: <strong>₱{previewCert.feeAmount.toFixed(2)}</strong></div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-4">
                <AuthenticQrCode
                  payload={`RPAT-IOSS|CERT:${previewCert.id}|OR:${previewCert.treasuryOrNo}|TD:${previewCert.tdNo}`}
                  size={72}
                  label="Certification Verification QR"
                  verified={true}
                />
                <div className="text-right text-xs">
                  <div className="font-bold text-slate-900 border-b border-slate-900 pb-1">
                    RAMON S. ALCANTARA
                  </div>
                  <div className="text-slate-600 mt-1">Municipal Assessor, Pasacao</div>
                </div>
              </div>
            </div>
          )}

          {/* Issued Register */}
          <div className="bg-white rounded-xl border border-slate-300 shadow-2xs overflow-x-auto">
            <div className="p-3.5 border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-800">
              Released Certifications Log ({certifications.length})
            </div>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-800 border-b border-slate-300">
                  <th scope="col" className="py-2.5 px-3 font-bold">Serial</th>
                  <th scope="col" className="py-2.5 px-3 font-bold">Type</th>
                  <th scope="col" className="py-2.5 px-3 font-bold">Treasury OR</th>
                  <th scope="col" className="py-2.5 px-3 text-center font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {certifications.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setPreviewCert(c)}
                    className="hover:bg-slate-50 cursor-pointer"
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{c.id}</td>
                    <td className="py-2.5 px-3 text-slate-800 font-medium">{c.type}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{c.treasuryOrNo}</td>
                    <td className="py-2.5 px-3 text-center">
                      <StatusChip status={c.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
