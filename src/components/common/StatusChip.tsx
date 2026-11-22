import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileEdit,
  ShieldCheck,
  XCircle
} from 'lucide-react';

interface StatusChipProps {
  status: string;
  size?: 'sm' | 'md';
}

/**
 * WCAG 2.2 Perceivable P-01 Compliant Multi-Cue Status Chip:
 * Never relies on color alone. Combines distinct iconography, high-contrast border,
 * high-contrast text (>= 4.5:1), and explicit text label.
 */
export const StatusChip: React.FC<StatusChipProps> = ({ status, size = 'sm' }) => {
  const normalized = status.toLowerCase();

  let styles = 'bg-slate-100 text-slate-900 border-slate-400';
  let Icon = FileEdit;

  if (
    normalized.includes('paid') ||
    normalized.includes('approved') ||
    normalized.includes('synced') ||
    normalized.includes('settled') ||
    normalized.includes('verified')
  ) {
    styles = 'bg-emerald-50 text-emerald-950 border-emerald-600';
    Icon = CheckCircle2;
  } else if (
    normalized.includes('review') ||
    normalized.includes('capitol') ||
    normalized.includes('pending') ||
    normalized.includes('signature') ||
    normalized.includes('partial')
  ) {
    styles = 'bg-amber-50 text-amber-950 border-amber-600';
    Icon = Clock;
  } else if (
    normalized.includes('flag') ||
    normalized.includes('deficien') ||
    normalized.includes('unpaid') ||
    normalized.includes('returned') ||
    normalized.includes('error')
  ) {
    styles = 'bg-red-50 text-red-950 border-red-600';
    Icon = AlertTriangle;
  } else if (normalized.includes('cis')) {
    styles = 'bg-blue-50 text-blue-950 border-blue-600';
    Icon = ShieldCheck;
  } else if (normalized.includes('cancel')) {
    styles = 'bg-slate-200 text-slate-900 border-slate-500';
    Icon = XCircle;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold border rounded-full whitespace-nowrap ${styles} ${
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-xs'
      }`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{status}</span>
    </span>
  );
};
