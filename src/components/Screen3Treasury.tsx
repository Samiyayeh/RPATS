import React, { useState } from 'react';
import { LayoutGrid, Calculator, CreditCard, FileCheck } from 'lucide-react';
import { useRpatis } from '../context/RpatisContext';
import { Screen3TreasuryDashboard } from './Screen3TreasuryDashboard';
import { Screen3TreasuryBilling } from './Screen3TreasuryBilling';
import { Screen3TreasuryCashier } from './Screen3TreasuryCashier';
import { Screen3TreasuryClearance } from './Screen3TreasuryClearance';
import { CollapsibleSidebarLayout } from './layout/CollapsibleSidebarLayout';

const TREASURY_VIEW_LABELS: Record<'dashboard' | 'billing' | 'cashier' | 'clearance', string> = {
  dashboard: 'Dashboard & Roll Ledger',
  billing: 'Tax Billing Calculator',
  cashier: 'Cashier Window #3',
  clearance: 'Tax Clearance & Form 56'
};

export const Screen3Treasury: React.FC = () => {
  const { assessmentRoll } = useRpatis();
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'billing' | 'cashier' | 'clearance'>('dashboard');
  const [selectedTdNo, setSelectedTdNo] = useState<string>('TD-26-04912');
  const [billingNetDue, setBillingNetDue] = useState<number>(1944);
  const [issuedOrNo, setIssuedOrNo] = useState<string>('OR-2026-993841');
  const [issuedClearanceNo, setIssuedClearanceNo] = useState<string>('TC-PAS-2026-0419');

  const activeRow = assessmentRoll.find((r) => r.tdNo === selectedTdNo) || assessmentRoll[0];

  return (
    <CollapsibleSidebarLayout
      ariaLabel="Municipal Treasury Navigation"
      sidebarSubtitle="Pasacao • Land Tax Billing & Cashiering"
      activeSectionLabel={TREASURY_VIEW_LABELS[activeMenu]}
      sidebarContent={
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-500 text-emerald-950 text-xs font-bold px-2.5 py-1 rounded-full w-full">
            <span className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse" aria-hidden="true" />
            <span>Assessor Bridge: Active</span>
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
      }
    >
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
          onSelectRow={(tdNo) => {
            setSelectedTdNo(tdNo);
            const found = assessmentRoll.find((r) => r.tdNo === tdNo);
            if (found) setBillingNetDue(Math.round(found.totalTaxDue * 0.9));
          }}
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
          onSelectRow={(tdNo, computedNetDue) => {
            setSelectedTdNo(tdNo);
            setBillingNetDue(computedNetDue);
          }}
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
    </CollapsibleSidebarLayout>
  );
};
