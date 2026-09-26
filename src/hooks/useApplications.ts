import { useCallback, useEffect, useState } from 'react';
import type { Application, ApplicationInput, Status } from '@/types/application';
import {
  fetchApplications,
  createApplication,
  updateApplication,
  updateStatus,
  deleteApplication,
} from '@/lib/applicationsApi';

export type ApplicationsState = {
  applications: Application[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addApplication: (input: ApplicationInput) => Promise<Application>;
  editApplication: (id: string, changes: Partial<ApplicationInput>) => Promise<Application>;
  changeStatus: (id: string, status: Status) => Promise<void>;
  removeApplication: (id: string) => Promise<void>;
};

export function useApplications(): ApplicationsState {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchApplications();
      setApplications(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load applications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addApplication = useCallback(async (input: ApplicationInput) => {
    const created = await createApplication(input);
    setApplications((prev) => [created, ...prev]);
    return created;
  }, []);

  const editApplication = useCallback(
    async (id: string, changes: Partial<ApplicationInput>) => {
      const updated = await updateApplication(id, changes);
      setApplications((prev) => prev.map((a) => (a.id === id ? updated : a)));
      return updated;
    },
    []
  );

  const changeStatus = useCallback(async (id: string, status: Status) => {
    const updated = await updateStatus(id, status);
    setApplications((prev) => prev.map((a) => (a.id === id ? updated : a)));
  }, []);

  const removeApplication = useCallback(async (id: string) => {
    await deleteApplication(id);
    setApplications((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return {
    applications,
    loading,
    error,
    refresh,
    addApplication,
    editApplication,
    changeStatus,
    removeApplication,
  };
}
