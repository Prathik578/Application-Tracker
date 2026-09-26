import { Calendar, Clock, TrendingUp } from 'lucide-react';
import type { Application, Status } from '@/types/application';
import { STATUSES } from '@/types/application';
import { STATUS_CONFIG } from '@/lib/statusConfig';
import { countByStatus, upcomingInterviews, recentlyUpdated } from '@/lib/derive';
import { formatDate, formatRelative } from '@/lib/format';
import { StatusBadge } from './StatusBadge';

type Props = {
  applications: Application[];
  onAppClick: (app: Application) => void;
};

export function Dashboard({ applications, onAppClick }: Props) {
  const counts = countByStatus(applications);
  const interviews = upcomingInterviews(applications).slice(0, 5);
  const recent = recentlyUpdated(applications, 5);

  const activeCount = applications.filter(
    (a) => !['Rejected', 'Withdrawn'].includes(a.status)
  ).length;

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Total applications"
          value={applications.length}
          icon={<TrendingUp size={18} />}
          accent="text-slate-700 bg-slate-100"
        />
        <StatCard
          label="Active"
          value={activeCount}
          icon={<Clock size={18} />}
          accent="text-blue-700 bg-blue-100"
        />
        <StatCard
          label="Upcoming interviews"
          value={interviews.length}
          icon={<Calendar size={18} />}
          accent="text-amber-700 bg-amber-100"
        />
        <StatCard
          label="Offers"
          value={counts['Offer']}
          icon={<TrendingUp size={18} />}
          accent="text-emerald-700 bg-emerald-100"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Status breakdown */}
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">
            Applications by status
          </h2>
          <div className="space-y-2">
            {STATUSES.map((status: Status) => {
              const count = counts[status];
              const pct =
                applications.length > 0
                  ? Math.round((count / applications.length) * 100)
                  : 0;
              const config = STATUS_CONFIG[status];
              return (
                <div key={status} className="flex items-center gap-3">
                  <span className="w-20 text-xs text-slate-500">
                    {config.label}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${config.dot} transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-xs font-medium text-slate-600">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Upcoming interviews */}
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">
            Upcoming interviews
          </h2>
          {interviews.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">
              No upcoming interviews scheduled.
            </p>
          ) : (
            <ul className="space-y-2">
              {interviews.map((app) => (
                <li key={app.id}>
                  <button
                    onClick={() => onAppClick(app)}
                    className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-left transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {app.company}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {app.role}
                      </p>
                    </div>
                    <span className="inline-flex flex-shrink-0 items-center gap-1 text-xs font-medium text-amber-600">
                      <Calendar size={13} />
                      {formatDate(app.interview_date)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Recently updated */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">
          Recently updated
        </h2>
        {recent.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">
            No applications yet.
          </p>
        ) : (
          <ul className="divide-y divide-slate-50">
            {recent.map((app) => (
              <li key={app.id}>
                <button
                  onClick={() => onAppClick(app)}
                  className="flex w-full items-center justify-between gap-2 py-2.5 text-left transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {app.company}
                    </p>
                    <p className="truncate text-xs text-slate-500">{app.role}</p>
                  </div>
                  <StatusBadge status={app.status} />
                  <span className="hidden flex-shrink-0 text-xs text-slate-400 sm:inline">
                    {formatRelative(app.updated_at)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${accent}`}>
          {icon}
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
