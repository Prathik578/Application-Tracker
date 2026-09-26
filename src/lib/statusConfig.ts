import type { Status } from '@/types/application';

export const STATUS_CONFIG: Record<
  Status,
  { label: string; dot: string; badge: string; column: string }
> = {
  Saved: {
    label: 'Saved',
    dot: 'bg-slate-400',
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    column: 'border-slate-200',
  },
  Applied: {
    label: 'Applied',
    dot: 'bg-blue-500',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    column: 'border-blue-200',
  },
  Screening: {
    label: 'Screening',
    dot: 'bg-cyan-500',
    badge: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    column: 'border-cyan-200',
  },
  Interview: {
    label: 'Interview',
    dot: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    column: 'border-amber-200',
  },
  Offer: {
    label: 'Offer',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    column: 'border-emerald-200',
  },
  Rejected: {
    label: 'Rejected',
    dot: 'bg-rose-500',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    column: 'border-rose-200',
  },
  Withdrawn: {
    label: 'Withdrawn',
    dot: 'bg-zinc-400',
    badge: 'bg-zinc-100 text-zinc-600 border-zinc-200',
    column: 'border-zinc-200',
  },
};
