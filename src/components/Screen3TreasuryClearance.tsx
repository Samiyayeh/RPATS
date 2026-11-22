import React from 'react';
import { Printer, Mail, ArrowLeft } from 'lucide-react';
import { AssessmentRollRow } from '../types/rpatis';
import { useRpatis } from '../context/RpatisContext';
import { AuthenticQrCode } from './common/AuthenticQrCode';

interface ClearanceProps {
  row: AssessmentRollRow;
  orNo: string;
  clearanceNo: string;
  amountPaid: number;
  onReturnToDashboard?: () => void;
}

export const Screen3TreasuryClearance: React.FC<ClearanceProps> = ({
  row,
  orNo,
  clearanceNo,
  amountPaid,
  onReturnToDashboard
}) => {
  const { pushToast } = useRpatis();

  const qrPayload = `RPAT-IOSS|TC:${clearanceNo}|OR:${orNo}|TD:${row.tdNo}|PIN:${row.pin}|PAID:${amountPaid}`;

  return (
    <div className="p-5 sm:p-6 flex flex-col items-center space-y-5">
      {/* Grouped Distribution Actions (Retained per Finding [8]) */}
      <div className="max-w-3xl w-full flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900">
            Electronic Tax Clearance &amp; Form 56 Issued
          </h1>
          <p className="text-xs text-slate-600">
            Authenticated real property tax clearance synchronized across LGU Pasacao offices.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              pushToast('Clearance Emailed', `Sent PDF copy of ${clearanceNo} to taxpayer email.`, 'info')
            }
            className="min-h-[40px] px-3.5 py-2 border border-slate-400 text-xs font-bold text-slate-800 rounded-lg hover:bg-slate-100 flex items-center gap-1.5"
          >
            <Mail className="w-4 h-4" aria-hidden="true" />
            <span>Email Taxpayer</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="min-h-[40px] px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" aria-hidden="true" />
            <span>Print Certificate</span>
          </button>

          <button
            type="button"
            onClick={onReturnToDashboard}
            className="min-h-[40px] px-3.5 py-2 border border-slate-400 text-xs font-bold text-slate-800 rounded-lg hover:bg-slate-100 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Treasury Dashboard</span>
          </button>
        </div>
      </div>

      {/* Certificate */}
      <div className="max-w-3xl w-full bg-white rounded-2xl border-2 border-slate-900 shadow-md p-8 space-y-6">
        <div className="text-center space-y-1">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-600">
            Republic of the Philippines • Province of Camarines Sur
          </div>
          <div className="text-sm font-bold text-slate-900">MUNICIPALITY OF PASACAO</div>
          <div className="text-xs font-semibold text-slate-700">OFFICE OF THE MUNICIPAL TREASURER</div>
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider pt-2">
            CERTIFICATION OF REAL PROPERTY TAX PAYMENT (TAX CLEARANCE)
          </h2>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-b border-slate-300 pb-2.5 font-mono">
          <div>
            <span className="text-slate-600">Clearance Serial:</span>{' '}
            <strong className="text-slate-900">{clearanceNo}</strong>
          </div>
          <div>
            <span className="text-slate-600">Issued:</span>{' '}
            <strong className="text-slate-900">March 18, 2026</strong> •{' '}
            <span className="text-emerald-800 font-bold">Valid thru Dec 31, 2026</span>
          </div>
        </div>

        <div className="space-y-3 text-sm text-justify leading-relaxed text-slate-800">
          <p>
            <strong>TO WHOM IT MAY CONCERN:</strong> This is to certify that according to the synchronized
            records of this Office, the real property declared in the name of{' '}
            <strong>{row.ownerFull.toUpperCase()}</strong>, covered by Tax Declaration No.{' '}
            <span className="font-mono font-bold">{row.tdNo}</span>, Property Index Number{' '}
            <span className="font-mono font-bold">{row.pin}</span>, situated at Brgy. {row.barangay},
            Pasacao, Camarines Sur, with an Assessed Value of{' '}
            <strong className="font-mono">
              ₱{row.assessedValue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </strong>
            , has been <strong>FULLY PAID</strong> of all Real Property Taxes and Special Education Funds
            up to and including Tax Year 2026.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-300 p-4 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-slate-600 block font-bold uppercase">Official Receipt (Form 56)</span>
            <strong className="text-slate-900 font-mono text-sm">{orNo}</strong>
          </div>
          <div>
            <span className="text-slate-600 block font-bold uppercase">Total Amount Settled</span>
            <strong className="text-slate-900 font-mono text-sm">
              ₱{amountPaid.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </strong>
          </div>
        </div>

        {/* Authentic QR Code Verification Seal (Resolves Finding [8]) */}
        <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-6 items-end border-t border-slate-300">
          <div className="flex items-center gap-3">
            <AuthenticQrCode
              payload={qrPayload}
              size={84}
              label="Verified Tax Clearance QR Code"
              verified={true}
            />
            <div className="text-xs text-slate-700 space-y-1">
              <div className="font-bold text-slate-900">Cryptographic Verification QR</div>
              <p className="leading-snug">
                Scan to verify authentic LGU Pasacao Form 56 settlement token (<span className="font-mono">{orNo}</span>).
              </p>
            </div>
          </div>

          <div className="text-right text-xs">
            <div className="border-b-2 border-slate-900 pb-1 font-bold text-slate-900 uppercase">
              HON. MUNICIPAL TREASURER
            </div>
            <div className="text-slate-600 mt-1 font-medium">
              Municipality of Pasacao, Camarines Sur
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
