import { useState } from 'react';
import { Calendar, ExternalLink, GripVertical } from 'lucide-react';
import type { Application, Status } from '@/types/application';
import { STATUSES } from '@/types/application';
import { STATUS_CONFIG } from '@/lib/statusConfig';
import { formatDate } from '@/lib/format';

type Props = {
  grouped: Record<Status, Application[]>;
  onCardClick: (app: Application) => void;
  onStatusChange: (id: string, status: Status) => void;
};

export function KanbanBoard({ grouped, onCardClick, onStatusChange }: Props) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {STATUSES.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          apps={grouped[status]}
          onCardClick={onCardClick}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
}

function KanbanColumn({
  status,
  apps,
  onCardClick,
  onStatusChange,
}: {
  status: Status;
  apps: Application[];
  onCardClick: (app: Application) => void;
  onStatusChange: (id: string, status: Status) => void;
}) {
  const config = STATUS_CONFIG[status];
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <section
      className={`flex w-[280px] flex-shrink-0 flex-col rounded-xl border-t-4 bg-slate-50 ${config.column}`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        const id = e.dataTransfer.getData('text/plain');
        if (id) onStatusChange(id, status);
      }}
      aria-label={`${config.label} column with ${apps.length} applications`}
    >
      <header className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${config.dot}`} />
          <h3 className="text-sm font-semibold text-slate-700">{config.label}</h3>
        </div>
        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
          {apps.length}
        </span>
      </header>

      <div
        className={`flex-1 space-y-2 px-2 pb-3 transition ${
          isDragOver ? 'bg-slate-100 ring-2 ring-slate-300 ring-inset' : ''
        }`}
      >
        {apps.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-slate-400">
            No applications
          </p>
        ) : (
          apps.map((app) => (
            <KanbanCard
              key={app.id}
              app={app}
              onClick={() => onCardClick(app)}
              onStatusChange={(newStatus) => onStatusChange(app.id, newStatus)}
            />
          ))
        )}
      </div>
    </section>
  );
}

function KanbanCard({
  app,
  onClick,
  onStatusChange,
}: {
  app: Application;
  onClick: () => void;
  onStatusChange: (status: Status) => void;
}) {
  return (
    <article
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', app.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
      className="group cursor-pointer rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:border-slate-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-300"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`${app.company} — ${app.role}, ${app.status}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            {app.company}
          </p>
          <p className="truncate text-xs text-slate-500">{app.role}</p>
        </div>
        <GripVertical
          size={14}
          className="mt-0.5 flex-shrink-0 text-slate-300 opacity-0 transition group-hover:opacity-100"
          aria-hidden
        />
      </div>

      {(app.location || app.interview_date) && (
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
          {app.location && <span>{app.location}</span>}
          {app.interview_date && (
            <span className="inline-flex items-center gap-1 text-amber-600">
              <Calendar size={12} />
              {formatDate(app.interview_date)}
            </span>
          )}
        </div>
      )}

      <div className="mt-2 flex items-center justify-between">
        <select
          value={app.status}
          onChange={(e) => {
            e.stopPropagation();
            onStatusChange(e.target.value as Status);
          }}
          onClick={(e) => e.stopPropagation()}
          aria-label="Change status"
          className="rounded border border-slate-200 px-1.5 py-0.5 text-xs text-slate-600 transition hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-300"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_CONFIG[s].label}
            </option>
          ))}
        </select>
        {app.job_url && (
          <a
            href={app.job_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-slate-400 transition hover:text-slate-600"
            aria-label="Open job posting"
          >
            <ExternalLink size={14} />
          </a>
        )}
      </div>
    </article>
  );
}
