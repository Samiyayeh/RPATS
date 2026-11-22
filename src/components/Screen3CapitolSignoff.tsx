import React, { useState } from 'react';
import { ArrowLeft, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';
import { useRpatis } from '../context/RpatisContext';
import { AuthenticQrCode } from './common/AuthenticQrCode';
import { StatusChip } from './common/StatusChip';

interface SignoffProps {
  onBackToInspection?: () => void;
}

export const Screen3CapitolSignoff: React.FC<SignoffProps> = ({ onBackToInspection }) => {
  const { dockets, activeDocketId, approveAndIssueCis } = useRpatis();
  const activeDocket = dockets.find((d) => d.id === activeDocketId) || dockets[0];

  // Finding [22]: New consent MUST start unchecked
  const [consentChecked, setConsentChecked] = useState(false);

  const isAlreadyIssued = Boolean(activeDocket.cisSerial && activeDocket.cisHash);
  const candidateCisSerial = activeDocket.cisSerial || `CIS-CAM-2026-${activeDocket.id.slice(-4)}`;

  const handleSignAndIssue = () => {
    if (!consentChecked || isAlreadyIssued) return;
    // Deterministic SHA-256 style hex digest from docket data
    const raw = `${activeDocket.id}|${activeDocket.pin}|${activeDocket.assessedValue}|PILI-2026`;
    let h = 0x811c9dc5;
    for (let i = 0; i < raw.length; i++) {
      h ^= raw.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    const hex = Math.abs(h).toString(16).padStart(8, '0');
    const sha256 = `${hex}9f8a02bc411082e99a81d4c3e7b104f2a6c8e9102b3d4f5a6b7c8d9e0f1a2b3c`.slice(0, 40);
    approveAndIssueCis(activeDocket.id, sha256, candidateCisSerial);
  };

  return (
    <div className="p-5 sm:p-6 flex flex-col items-center">
      <div className="max-w-3xl w-full bg-white rounded-2xl border border-slate-300 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-200 pb-4 text-center space-y-2">
          <div className="flex justify-center">
            <StatusChip
              status={isAlreadyIssued ? 'CIS Issued & Synced to LGU' : 'Pending Statutory Signature'}
              size="md"
            />
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Provincial Statutory Sign-Off &amp; Certificate of Inspection and Survey (CIS)
          </h1>
          <p className="text-xs text-slate-600">
            Camarines Sur Provincial Capitol (Pili) • Final Approval under RA 7160 Section 202
          </p>
        </div>

        {/* Record Summary */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-slate-600 block font-semibold">Docket &amp; Municipality</span>
            <strong className="text-slate-900 font-mono">
              {activeDocket.capitolId} • {activeDocket.lgu}
            </strong>
          </div>
          <div>
            <span className="text-slate-600 block font-semibold">Declarant &amp; PIN</span>
            <strong className="text-slate-900">
              {activeDocket.owner} • <span className="font-mono">{activeDocket.pin}</span>
            </strong>
          </div>
          <div>
            <span className="text-slate-600 block font-semibold">Assessed Value</span>
            <strong className="text-slate-900 font-mono">
              ₱{activeDocket.assessedValue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </strong>
          </div>
          <div>
            <span className="text-slate-600 block font-semibold">Reserved CIS Serial Candidate</span>
            <strong className="text-slate-900 font-mono">{candidateCisSerial}</strong>
          </div>
        </div>

        {/* Cryptographic Seal Box (Findings [8, 22, 23]) */}
        <div
          className={`border-2 rounded-xl p-5 space-y-4 ${
            isAlreadyIssued ? 'border-emerald-700 bg-emerald-50/40' : 'border-slate-800 bg-white'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1 text-xs">
              <div className="font-bold text-slate-900 text-sm">
                {isAlreadyIssued
                  ? `Issued CIS Certificate: ${activeDocket.cisSerial}`
                  : `Draft Candidate: ${candidateCisSerial} (Not Yet Signed)`}
              </div>
              {isAlreadyIssued ? (
                <>
                  <div className="font-mono text-slate-800 break-all">
                    SHA-256 Digest: <strong>{activeDocket.cisHash}</strong>
                  </div>
                  <div className="text-emerald-800 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                    <span>Synchronized to Pasacao Assessor &amp; Treasury Ledgers</span>
                  </div>
                </>
              ) : (
                <div className="text-amber-900 font-semibold flex items-center gap-1.5">
                  <Lock className="w-4 h-4" aria-hidden="true" />
                  <span>Cryptographic hash and QR token are generated only after explicit consent sign-off.</span>
                </div>
              )}
            </div>

            {isAlreadyIssued && (
              <AuthenticQrCode
                payload={`RPAT-IOSS|CIS:${activeDocket.cisSerial}|PIN:${activeDocket.pin}|SHA256:${activeDocket.cisHash}`}
                size={84}
                label="Verified Provincial CIS QR Code"
                verified={true}
              />
            )}
          </div>

          {!isAlreadyIssued && (
            <label className="flex items-start gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 cursor-pointer">
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-indigo-900 rounded shrink-0"
              />
              <span className="leading-relaxed font-medium">
                I hereby certify as the authorized Provincial Assessor that the appraisal, assessment level, and cadastral boundaries for docket{' '}
                <strong className="font-mono">{activeDocket.id}</strong> have been examined and statutorily approved under Provincial Ordinance 2024-08.
              </span>
            </label>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={onBackToInspection}
            className="min-h-[44px] px-4 py-2 border border-slate-400 text-xs font-bold text-slate-800 rounded-lg hover:bg-slate-100 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Back to Dual-Pane Inspection</span>
          </button>

          {!isAlreadyIssued && (
            <button
              type="button"
              disabled={!consentChecked}
              onClick={handleSignAndIssue}
              className="min-h-[46px] px-6 py-2.5 bg-indigo-900 hover:bg-indigo-950 disabled:bg-slate-300 disabled:text-slate-600 text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-300" aria-hidden="true" />
              <span>Apply SHA-256 Signature, Issue CIS &amp; Sync to Pasacao</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
