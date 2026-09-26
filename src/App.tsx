import { useMemo, useState } from 'react';
import { AlertCircle, LayoutDashboard, List, Plus, RefreshCw, Trello } from 'lucide-react';
import type { Application, ApplicationInput, SortKey } from '@/types/application';
import { useApplications } from '@/hooks/useApplications';
import {
  groupByStatus,
  searchApplications,
  filterApplications,
  sortApplications,
  type FilterOptions,
} from '@/lib/derive';
import { Dashboard } from '@/components/Dashboard';
import { KanbanBoard } from '@/components/KanbanBoard';
import { ApplicationList } from '@/components/ApplicationList';
import { SearchFilterBar } from '@/components/SearchFilterBar';
import { ApplicationForm } from '@/components/ApplicationForm';
import { ApplicationDetail } from '@/components/ApplicationDetail';
import { DeleteConfirm } from '@/components/DeleteConfirm';

type View = 'dashboard' | 'kanban' | 'list';

export default function App() {
  const {
    applications,
    loading,
    error,
    refresh,
    addApplication,
    editApplication,
    changeStatus,
    removeApplication,
  } = useApplications();

  const [view, setView] = useState<View>('dashboard');
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    dateRange: 'all',
    interviewRange: 'all',
  });
  const [sort, setSort] = useState<SortKey>('newest');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Application | null>(null);
  const [detail, setDetail] = useState<Application | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Application | null>(null);

  // Single derivation pipeline: search → filter → sort
  const visibleApplications = useMemo(() => {
    const searched = searchApplications(applications, query);
    const filtered = filterApplications(searched, filters);
    return sortApplications(filtered, sort);
  }, [applications, query, filters, sort]);

  const grouped = useMemo(
    () => groupByStatus(visibleApplications),
    [visibleApplications]
  );

  const handleSubmit = async (input: ApplicationInput) => {
    if (editing) {
      await editApplication(editing.id, input);
    } else {
      await addApplication(input);
    }
  };

  const handleEdit = (app: Application) => {
    setDetail(null);
    setEditing(app);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await removeApplication(deleteTarget.id);
    setDeleteTarget(null);
    setDetail(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Trello size={20} />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-slate-900">
                Application Tracker
              </h1>
              <p className="hidden text-xs text-slate-400 sm:block">
                {applications.length} application{applications.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refresh}
              aria-label="Refresh"
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Add application</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* View tabs */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <nav className="flex gap-1" aria-label="Views">
            <TabButton
              active={view === 'dashboard'}
              onClick={() => setView('dashboard')}
              icon={<LayoutDashboard size={16} />}
              label="Dashboard"
            />
            <TabButton
              active={view === 'kanban'}
              onClick={() => setView('kanban')}
              icon={<Trello size={16} />}
              label="Kanban"
            />
            <TabButton
              active={view === 'list'}
              onClick={() => setView('list')}
              icon={<List size={16} />}
              label="List"
            />
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {error && (
          <div
            role="alert"
            className="mb-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            <AlertCircle size={18} />
            <span>{error}</span>
            <button
              onClick={refresh}
              className="ml-auto rounded-md px-2 py-1 text-xs font-medium text-rose-600 underline hover:text-rose-800"
            >
              Try again
            </button>
          </div>
        )}

        {loading && applications.length === 0 ? (
          <LoadingState />
        ) : applications.length === 0 ? (
          <EmptyState onAdd={() => setFormOpen(true)} />
        ) : (
          <>
            {view !== 'dashboard' && (
              <div className="mb-4">
                <SearchFilterBar
                  query={query}
                  onQueryChange={setQuery}
                  filters={filters}
                  onFiltersChange={setFilters}
                />
              </div>
            )}

            {view === 'dashboard' && (
              <Dashboard applications={applications} onAppClick={setDetail} />
            )}

            {view === 'kanban' && (
              <KanbanBoard
                grouped={grouped}
                onCardClick={setDetail}
                onStatusChange={changeStatus}
              />
            )}

            {view === 'list' && (
              <ApplicationList
                applications={visibleApplications}
                onRowClick={setDetail}
                sort={sort}
                onSortChange={setSort}
              />
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <ApplicationForm
        open={formOpen}
        initial={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />

      <ApplicationDetail
        application={detail}
        onClose={() => setDetail(null)}
        onEdit={handleEdit}
        onDelete={setDeleteTarget}
        onStatusChange={changeStatus}
      />

      <DeleteConfirm
        open={!!deleteTarget}
        company={deleteTarget?.company ?? ''}
        role={deleteTarget?.role ?? ''}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`inline-flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-slate-300 ${
        active
          ? 'border-slate-900 text-slate-900'
          : 'border-transparent text-slate-500 hover:text-slate-700'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-200" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-48 animate-pulse rounded-xl bg-slate-200" />
        ))}
      </div>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
        <Trello size={28} className="text-slate-400" />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-slate-900">
        No applications yet
      </h2>
      <p className="mt-1 max-w-sm text-sm text-slate-500">
        Start tracking your job and internship applications. Add your first one
        to see it appear on the dashboard, Kanban board, and list.
      </p>
      <button
        onClick={onAdd}
        className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
      >
        <Plus size={18} />
        Add your first application
      </button>
    </div>
  );
}
