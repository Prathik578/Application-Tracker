import { Calendar, FileText, Link2, MapPin, Pencil, Trash2, X } from 'lucide-react';
import type { Application } from '@/types/application';
import { STATUSES } from '@/types/application';
import { STATUS_CONFIG } from '@/lib/statusConfig';
import { StatusBadge } from './StatusBadge';
import { formatDate, formatRelative } from '@/lib/format';

type Props = {
  application: Application | null;
  onClose: () => void;
  onEdit: (app: Application) => void;
  onDelete: (app: Application) => void;
  onStatusChange: (id: string, status: Application['status']) => void;
};

export function ApplicationDetail({
  application,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
}: Props) {
  if (!application) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-end bg-slate-900/40 sm:items-center sm:justify-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Application details"
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-semibold text-slate-900">
              {application.company}
            </h2>
            <p className="truncate text-sm text-slate-500">{application.role}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <StatusBadge status={application.status} />
            <span className="text-xs text-slate-400">
              Updated {formatRelative(application.updated_at)}
            </span>
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">
              Status
            </label>
            <select
              value={application.status}
              onChange={(e) =>
                onStatusChange(application.id, e.target.value as Application['status'])
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_CONFIG[s].label}
                </option>
              ))}
            </select>
          </div>

          <dl className="space-y-3">
            <DetailRow
              icon={<Calendar size={16} />}
              label="Applied date"
              value={formatDate(application.applied_date)}
            />
            <DetailRow
              icon={<Calendar size={16} />}
              label="Interview date"
              value={formatDate(application.interview_date)}
            />
            <DetailRow
              icon={<MapPin size={16} />}
              label="Location"
              value={application.location || '—'}
            />
            <DetailRow
              icon={<Link2 size={16} />}
              label="Job URL"
              value={
                application.job_url ? (
                  <a
                    href={application.job_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    {application.job_url}
                  </a>
                ) : (
                  '—'
                )
              }
            />
            <DetailRow
              icon={<FileText size={16} />}
              label="Notes"
              value={
                application.notes ? (
                  <p className="whitespace-pre-wrap text-sm text-slate-700">
                    {application.notes}
                  </p>
                ) : (
                  '—'
                )
              }
            />
          </dl>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={() => onDelete(application)}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-300"
          >
            <Trash2 size={16} />
            Delete
          </button>
          <button
            type="button"
            onClick={() => onEdit(application)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <Pencil size={16} />
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex-shrink-0 text-slate-400">{icon}</div>
      <div className="min-w-0 flex-1">
        <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {label}
        </dt>
        <dd className="mt-0.5 break-words text-sm text-slate-800">{value}</dd>
      </div>
    </div>
  );
}
