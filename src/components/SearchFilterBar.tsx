import { Search, X } from 'lucide-react';
import type { FilterOptions } from '@/lib/derive';
import { STATUSES } from '@/types/application';
import { STATUS_CONFIG } from '@/lib/statusConfig';

type Props = {
  query: string;
  onQueryChange: (q: string) => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
};

export function SearchFilterBar({ query, onQueryChange, filters, onFiltersChange }: Props) {
  const hasActiveFilters =
    filters.status !== 'all' ||
    filters.dateRange !== 'all' ||
    filters.interviewRange !== 'all' ||
    query.trim().length > 0;

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search
          size={18}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search company, role, location, notes…"
          aria-label="Search applications"
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect
          label="Status"
          value={filters.status}
          onChange={(v) => onFiltersChange({ ...filters, status: v as FilterOptions['status'] })}
          options={[
            { value: 'all', label: 'All statuses' },
            ...STATUSES.map((s) => ({ value: s, label: STATUS_CONFIG[s].label })),
          ]}
        />
        <FilterSelect
          label="Applied"
          value={filters.dateRange}
          onChange={(v) => onFiltersChange({ ...filters, dateRange: v as FilterOptions['dateRange'] })}
          options={[
            { value: 'all', label: 'Any time' },
            { value: '7d', label: 'Last 7 days' },
            { value: '30d', label: 'Last 30 days' },
            { value: '90d', label: 'Last 90 days' },
          ]}
        />
        <FilterSelect
          label="Interview"
          value={filters.interviewRange}
          onChange={(v) => onFiltersChange({ ...filters, interviewRange: v as FilterOptions['interviewRange'] })}
          options={[
            { value: 'all', label: 'Any time' },
            { value: '7d', label: 'Next 7 days' },
            { value: '14d', label: 'Next 14 days' },
            { value: '30d', label: 'Next 30 days' },
          ]}
        />
        {hasActiveFilters && (
          <button
            onClick={() => {
              onQueryChange('');
              onFiltersChange({ status: 'all', dateRange: 'all', interviewRange: 'all' });
            }}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            <X size={13} />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="inline-flex items-center gap-1.5 text-xs">
      <span className="text-slate-400">{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
