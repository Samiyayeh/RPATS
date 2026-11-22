import React, { useState } from 'react';
import { LayoutGrid, Calculator, CreditCard, FileCheck } from 'lucide-react';
import { useRpatis } from '../context/RpatisContext';
import { Screen3TreasuryDashboard } from './Screen3TreasuryDashboard';
import { Screen3TreasuryBilling } from './Screen3TreasuryBilling';
import { Screen3TreasuryCashier } from './Screen3TreasuryCashier';
import { Screen3TreasuryClearance } from './Screen3TreasuryClearance';

export const Screen3Treasury: React.FC = () => {
  const { currentUser, assessmentRoll } = useRpatis();
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'billing' | 'cashier' | 'clearance'>('dashboard');
  const [selectedTdNo, setSelectedTdNo] = useState<string>('TD-26-04912');
  const [billingNetDue, setBillingNetDue] = useState<number>(1944);
  const [issuedOrNo, setIssuedOrNo] = useState<string>('OR-2026-993841');
  const [issuedClearanceNo, setIssuedClearanceNo] = useState<string>('TC-PAS-2026-0419');

  const activeRow = assessmentRoll.find((r) => r.tdNo === selectedTdNo) || assessmentRoll[0];

  return (
    <div className="flex flex-col lg:flex-row flex-1 w-full bg-slate-50 text-slate-900">
      {/* Municipal Treasury Sidebar */}
      <aside
        aria-label="Municipal Treasury Navigation"
        className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-slate-300 flex flex-col justify-between shrink-0"
      >
        <div className="p-4 space-y-4">
          <div className="pb-3 border-b border-slate-200 space-y-2">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                Municipal Treasury
              </div>
              <div className="text-xs text-slate-600 mt-0.5 font-medium">
                Land Tax Billing &amp; Cashiering
              </div>
            </div>

            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-500 text-emerald-950 text-xs font-bold px-2.5 py-1 rounded-full w-full">
              <span className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse" aria-hidden="true" />
              <span>Assessor Bridge: Active</span>
            </div>
          </div>

          <nav className="space-y-1.5">
            {[
              { id: 'dashboard', label: 'Dashboard & Roll Ledger', icon: LayoutGrid },
              { id: 'billing', label: 'Tax Billing Calculator', icon: Calculator },
              { id: 'cashier', label: 'Cashier Window #3', icon: CreditCard },
              { id: 'clearance', label: 'Tax Clearance & Form 56', icon: FileCheck }
            ].map((item) => {
              const Icon = item.icon;
              const active = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveMenu(item.id as any)}
                  className={`w-full min-h-[44px] flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold rounded-lg transition-colors ${
                    active
                      ? 'bg-emerald-800 text-white shadow-2xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-700 space-y-1">
          <div className="font-bold text-slate-900">Active Cashier Terminal</div>
          <div>{currentUser?.name}</div>
          <div className="font-mono text-slate-600">{currentUser?.employeeId}</div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {activeMenu === 'dashboard' && (
          <Screen3TreasuryDashboard
            onSelectRow={(tdNo) => {
              setSelectedTdNo(tdNo);
              const found = assessmentRoll.find((r) => r.tdNo === tdNo);
              if (found) setBillingNetDue(Math.round(found.totalTaxDue * 0.9));
              setActiveMenu('billing');
            }}
          />
        )}

        {activeMenu === 'billing' && (
          <Screen3TreasuryBilling
            row={activeRow}
            onProceedToCashier={(netDue) => {
              setBillingNetDue(netDue);
              setActiveMenu('cashier');
            }}
          />
        )}

        {activeMenu === 'cashier' && (
          <Screen3TreasuryCashier
            row={activeRow}
            netDue={billingNetDue}
            onPaymentSettled={(orNo, clearanceNo) => {
              setIssuedOrNo(orNo);
              setIssuedClearanceNo(clearanceNo);
              setActiveMenu('clearance');
            }}
          />
        )}

        {activeMenu === 'clearance' && (
          <Screen3TreasuryClearance
            row={activeRow}
            orNo={issuedOrNo}
            clearanceNo={issuedClearanceNo}
            amountPaid={billingNetDue}
            onReturnToDashboard={() => setActiveMenu('dashboard')}
          />
        )}
      </div>
    </div>
  );
};
