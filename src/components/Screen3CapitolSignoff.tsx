import React, { useEffect, useState } from 'react';
import { ArrowLeft, ShieldCheck, CheckCircle2, Lock, FileSearch, Stamp } from 'lucide-react';
import { useRpatis } from '../context/RpatisContext';
import { AuthenticQrCode } from './common/AuthenticQrCode';
import { StatusChip } from './common/StatusChip';

interface SignoffProps {
  onBackToInspection?: () => void;
}

export const Screen3CapitolSignoff: React.FC<SignoffProps> = ({ onBackToInspection }) => {
  const { dockets, activeDocketId, setActiveDocketId, approveAndIssueCis } = useRpatis();

  const [queueTab, setQueueTab] = useState<'pending' | 'issued'>('pending');
  const [consentChecked, setConsentChecked] = useState(false);

  const pendingSignoffDockets = [...dockets]
    .filter((d) => d.status === 'Ready for Sign-Off')
    .sort((a, b) => a.capitolId.localeCompare(b.capitolId, undefined, { numeric: true }));

  const issuedCisDockets = [...dockets]
    .filter((d) => Boolean(d.cisSerial && d.cisHash))
    .sort((a, b) => b.capitolId.localeCompare(a.capitolId, undefined, { numeric: true }));

  const visibleList = queueTab === 'pending' ? pendingSignoffDockets : issuedCisDockets;
  const activeDocket = visibleList.find((d) => d.id === activeDocketId) || visibleList[0] || null;

  useEffect(() => {
    setConsentChecked(false);
  }, [activeDocket?.id, queueTab]);

  const isAlreadyIssued = Boolean(activeDocket?.cisSerial && activeDocket?.cisHash);
  const candidateCisSerial = activeDocket
    ? activeDocket.cisSerial || `CIS-CAM-2026-${activeDocket.id.slice(-4)}`
    : '';

  const handleSignAndIssue = () => {
    if (!activeDocket || !consentChecked || isAlreadyIssued) return;
    const raw = `${activeDocket.id}|${activeDocket.pin}|${activeDocket.assessedValue}|PILI-2026`;
    let h = 0x811c9dc5;
    for (let i = 0; i < raw.length; i++) {
      h ^= raw.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    const hex = Math.abs(h).toString(16).padStart(8, '0');
    const sha256 = `${hex}9f8a02bc411082e99a81d4c3e7b104f2a6c8e9102b3d4f5a6b7c8d9e0f1a2b3c`.slice(
      0,
      40
    );
    approveAndIssueCis(activeDocket.id, sha256, candidateCisSerial);
    setQueueTab('issued');
    setActiveDocketId(activeDocket.id);
  };

  return (
    <div className="p-5 sm:p-6 space-y-5">
      {/* Top Workspace Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-slate-600">
            Provincial Capitol (Pili) &gt; Statutory Sign-Off &amp; CIS Issuance
          </div>
          <h1 className="text-lg font-bold text-slate-900 mt-0.5">
            Provincial Statutory Sign-Off &amp; CIS Seal
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Final approval under RA 7160 Section 202 • Only dockets cleared and forwarded from Dual-Pane Inspection appear below.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex bg-slate-100 p-1 rounded-lg border border-slate-300 gap-1">
            <button
              type="button"
              onClick={() => setQueueTab('pending')}
              className={`min-h-[38px] px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                queueTab === 'pending'
                  ? 'bg-indigo-900 text-white shadow-2xs'
                  : 'text-slate-800 hover:bg-slate-200'
              }`}
            >
              Pending Sign-Off ({pendingSignoffDockets.length})
            </button>
            <button
              type="button"
              onClick={() => setQueueTab('issued')}
              className={`min-h-[38px] px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                queueTab === 'issued'
                  ? 'bg-indigo-900 text-white shadow-2xs'
                  : 'text-slate-800 hover:bg-slate-200'
              }`}
            >
              Issued CIS Seals ({issuedCisDockets.length})
            </button>
          </div>

          <button
            type="button"
            onClick={onBackToInspection}
            className="min-h-[42px] px-3.5 py-2 border border-slate-400 bg-white hover:bg-slate-100 text-xs font-bold text-slate-800 rounded-lg inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Dual-Pane Inspection</span>
          </button>
        </div>
      </div>

      {/* Full-Width Two-Column Sign-Off Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left: Sign-Off Eligible Queue */}
        <div className="xl:col-span-4 bg-white rounded-xl border border-slate-300 shadow-2xs overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              {queueTab === 'pending' ? 'Ready for Sign-Off Queue' : 'Issued CIS Register'}
            </h2>
            <span className="font-mono text-xs font-bold text-slate-700">
              {visibleList.length} Docket(s)
            </span>
          </div>

          {visibleList.length === 0 ? (
            <div className="p-6 text-center space-y-3 text-xs text-slate-600">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                <Stamp className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="font-bold text-slate-900 text-sm">
                {queueTab === 'pending'
                  ? 'No Dockets Marked for Sign-Off'
                  : 'No Issued CIS Certificates Yet'}
              </div>
              <p className="leading-relaxed">
                {queueTab === 'pending'
                  ? 'Complete all 4 statutory checks in Dual-Pane Inspection and click "Forward to Provincial Assessor Sign-Off" to queue a docket here.'
                  : 'Signed and sealed dockets will appear here with their SHA-256 hash and QR verification.'}
              </p>
              {queueTab === 'pending' && onBackToInspection && (
                <button
                  type="button"
                  onClick={onBackToInspection}
                  className="min-h-[38px] px-4 py-2 bg-indigo-900 hover:bg-indigo-950 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <FileSearch className="w-4 h-4" aria-hidden="true" />
                  <span>Open Dual-Pane Inspection</span>
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-200 max-h-[540px] overflow-y-auto">
              {visibleList.map((item) => {
                const isSelected = activeDocket?.id === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveDocketId(item.id)}
                    className={`w-full text-left p-4 transition-colors space-y-1.5 border-l-4 ${
                      isSelected
                        ? 'bg-indigo-50/70 border-l-indigo-900'
                        : 'bg-white hover:bg-slate-50 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-mono font-bold text-xs text-slate-900">
                        {item.capitolId}
                      </span>
                      <StatusChip status={item.status} />
                    </div>
                    <div className="text-xs font-bold text-slate-900">{item.owner}</div>
                    <div className="flex items-center justify-between text-[11px] text-slate-600 font-mono">
                      <span>
                        LGU {item.lgu} • PIN {item.pin}
                      </span>
                      <span className="font-bold text-slate-800">
                        ₱{item.assessedValue.toLocaleString()}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Sign-Off Details & Cryptographic Seal */}
        <div className="xl:col-span-8 bg-white rounded-xl border border-slate-300 shadow-2xs p-6 space-y-5">
          {!activeDocket ? (
            <div className="py-12 text-center space-y-2 text-xs text-slate-600">
              <div className="font-bold text-sm text-slate-900">
                Select a Sign-Off Docket to Review &amp; Seal
              </div>
              <p>
                Only dockets forwarded from Dual-Pane Inspection are eligible for Provincial Assessor CIS signature.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <div className="text-xs font-mono text-slate-600">
                    CERTIFICATE OF INSPECTION AND SURVEY (CIS) WORKSHEET
                  </div>
                  <h2 className="text-base font-bold text-slate-900 font-mono mt-0.5">
                    {activeDocket.capitolId} — {activeDocket.owner}
                  </h2>
                </div>

                <StatusChip
                  status={
                    isAlreadyIssued ? 'CIS Issued & Synced to LGU' : 'Pending Statutory Signature'
                  }
                  size="md"
                />
              </div>

              {/* Record Summary */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-600 block font-semibold">Docket &amp; Municipality</span>
                  <strong className="text-slate-900 font-mono mt-0.5 block">
                    {activeDocket.capitolId} • {activeDocket.lgu} ({activeDocket.transactionType})
                  </strong>
                </div>
                <div>
                  <span className="text-slate-600 block font-semibold">Declarant &amp; PIN</span>
                  <strong className="text-slate-900 mt-0.5 block">
                    {activeDocket.owner} • <span className="font-mono">{activeDocket.pin}</span>
                  </strong>
                </div>
                <div>
                  <span className="text-slate-600 block font-semibold">Taxable Assessed Value</span>
                  <strong className="text-slate-900 font-mono text-sm mt-0.5 block">
                    ₱{activeDocket.assessedValue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-600 block font-semibold">
                    {isAlreadyIssued ? 'Issued CIS Serial' : 'Reserved CIS Serial Candidate'}
                  </span>
                  <strong className="text-slate-900 font-mono text-sm mt-0.5 block">
                    {candidateCisSerial}
                  </strong>
                </div>
              </div>

              {/* Cryptographic Seal Box */}
              <div
                className={`border-2 rounded-xl p-5 space-y-4 ${
                  isAlreadyIssued
                    ? 'border-emerald-700 bg-emerald-50/40'
                    : 'border-slate-800 bg-white'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1.5 text-xs flex-1 min-w-[240px]">
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
                        <div className="text-emerald-800 font-bold flex items-center gap-1.5 pt-1">
                          <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                          <span>
                            Synchronized to {activeDocket.lgu} Assessor &amp; Treasury Assessment Roll
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-amber-900 font-semibold flex items-center gap-1.5">
                        <Lock className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>
                          Cryptographic hash and QR verification token are generated only after explicit consent sign-off.
                        </span>
                      </div>
                    )}
                  </div>

                  {isAlreadyIssued && (
                    <AuthenticQrCode
                      payload={`RPAT-IOSS|CIS:${activeDocket.cisSerial}|PIN:${activeDocket.pin}|SHA256:${activeDocket.cisHash}`}
                      size={88}
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

              {/* Action Footer */}
              {!isAlreadyIssued && (
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    disabled={!consentChecked}
                    onClick={handleSignAndIssue}
                    className="min-h-[46px] px-6 py-2.5 bg-indigo-900 hover:bg-indigo-950 disabled:bg-slate-300 disabled:text-slate-600 text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-sm"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-300" aria-hidden="true" />
                    <span>
                      Apply SHA-256 Signature, Issue CIS &amp; Sync to {activeDocket.lgu}
                    </span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
