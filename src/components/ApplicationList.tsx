import { Calendar, ExternalLink, MapPin } from 'lucide-react';
import type { Application, SortKey } from '@/types/application';
import { StatusBadge } from './StatusBadge';
import { formatDate, formatRelative } from '@/lib/format';

type Props = {
  applications: Application[];
  onRowClick: (app: Application) => void;
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
};

export function ApplicationList({
  applications,
  onRowClick,
  sort,
  onSortChange,
}: Props) {
  if (applications.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center">
        <p className="text-sm text-slate-400">No applications to display.</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Applied</th>
              <th className="px-4 py-3 font-medium">Interview</th>
              <th className="px-4 py-3 font-medium">
                <SortSelect sort={sort} onSortChange={onSortChange} />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {applications.map((app) => (
              <tr
                key={app.id}
                onClick={() => onRowClick(app)}
                className="cursor-pointer transition hover:bg-slate-50 focus:outline-none"
              >
                <td className="px-4 py-3 font-medium text-slate-900">
                  {app.company}
                </td>
                <td className="px-4 py-3 text-slate-600">{app.role}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={app.status} />
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {app.location || '—'}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {formatDate(app.applied_date)}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {app.interview_date ? (
                    <span className="inline-flex items-center gap-1 text-amber-600">
                      <Calendar size={13} />
                      {formatDate(app.interview_date)}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="px-4 py-3 text-right text-xs text-slate-400">
                  {app.job_url ? (
                    <a
                      href={app.job_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-slate-400 transition hover:text-slate-600"
                      aria-label="Open job posting"
                    >
                      <ExternalLink size={14} />
                    </a>
                  ) : (
                    formatRelative(app.updated_at)
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-2 md:hidden">
        <div className="flex items-center justify-between px-1 pb-1">
          <span className="text-xs text-slate-400">
            {applications.length} application{applications.length === 1 ? '' : 's'}
          </span>
          <SortSelect sort={sort} onSortChange={onSortChange} />
        </div>
        {applications.map((app) => (
          <button
            key={app.id}
            onClick={() => onRowClick(app)}
            className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">
                  {app.company}
                </p>
                <p className="truncate text-sm text-slate-500">{app.role}</p>
              </div>
              <StatusBadge status={app.status} />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
              {app.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin size={12} />
                  {app.location}
                </span>
              )}
              {app.applied_date && (
                <span className="inline-flex items-center gap-1">
                  <Calendar size={12} />
                  Applied {formatDate(app.applied_date)}
                </span>
              )}
              {app.interview_date && (
                <span className="inline-flex items-center gap-1 text-amber-600">
                  <Calendar size={12} />
                  {formatDate(app.interview_date)}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </>
  );
}

function SortSelect({
  sort,
  onSortChange,
}: {
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
}) {
  return (
    <label className="inline-flex items-center gap-1.5 text-xs font-normal normal-case tracking-normal text-slate-500">
      <span>Sort:</span>
      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value as SortKey)}
        className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-300"
      >
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="interview">Upcoming interview</option>
        <option value="company">Company A–Z</option>
      </select>
    </label>
  );
}
