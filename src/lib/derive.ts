import type { Application, Status } from '@/types/application';
import { STATUSES } from '@/types/application';

export function groupByStatus(apps: Application[]): Record<Status, Application[]> {
  const groups = Object.fromEntries(
    STATUSES.map((s) => [s, [] as Application[]])
  ) as Record<Status, Application[]>;
  for (const app of apps) {
    groups[app.status].push(app);
  }
  return groups;
}

export function countByStatus(apps: Application[]): Record<Status, number> {
  const counts = Object.fromEntries(
    STATUSES.map((s) => [s, 0])
  ) as Record<Status, number>;
  for (const app of apps) {
    counts[app.status] += 1;
  }
  return counts;
}

export function searchApplications(apps: Application[], query: string): Application[] {
  const q = query.trim().toLowerCase();
  if (!q) return apps;
  return apps.filter((a) =>
    [a.company, a.role, a.location, a.notes]
      .filter(Boolean)
      .some((field) => field!.toLowerCase().includes(q))
  );
}

export type FilterOptions = {
  status: Status | 'all';
  dateRange: 'all' | '7d' | '30d' | '90d';
  interviewRange: 'all' | '7d' | '14d' | '30d';
};

export function filterApplications(
  apps: Application[],
  filters: FilterOptions
): Application[] {
  let result = apps;

  if (filters.status !== 'all') {
    result = result.filter((a) => a.status === filters.status);
  }

  if (filters.dateRange !== 'all') {
    const days = parseInt(filters.dateRange, 10);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    result = result.filter((a) => {
      if (!a.applied_date) return false;
      return new Date(a.applied_date) >= cutoff;
    });
  }

  if (filters.interviewRange !== 'all') {
    const days = parseInt(filters.interviewRange, 10);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    result = result.filter((a) => {
      if (!a.interview_date) return false;
      return new Date(a.interview_date) >= cutoff;
    });
  }

  return result;
}

export function sortApplications(
  apps: Application[],
  sort: 'newest' | 'oldest' | 'interview' | 'company'
): Application[] {
  const sorted = [...apps];
  switch (sort) {
    case 'newest':
      return sorted.sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    case 'oldest':
      return sorted.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    case 'interview':
      return sorted.sort((a, b) => {
        const aD = a.interview_date ? new Date(a.interview_date).getTime() : Infinity;
        const bD = b.interview_date ? new Date(b.interview_date).getTime() : Infinity;
        return aD - bD;
      });
    case 'company':
      return sorted.sort((a, b) => a.company.localeCompare(b.company));
  }
}

export function upcomingInterviews(apps: Application[]): Application[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return apps
    .filter((a) => a.interview_date && new Date(a.interview_date) >= today)
    .sort(
      (a, b) =>
        new Date(a.interview_date!).getTime() - new Date(b.interview_date!).getTime()
    );
}

export function recentlyUpdated(apps: Application[], limit = 5): Application[] {
  return [...apps]
    .sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )
    .slice(0, limit);
}
