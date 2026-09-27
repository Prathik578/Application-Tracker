import { requireSupabase } from './supabaseClient';
import type { Application, ApplicationInput, Status } from '@/types/application';

function withUpdatedAt(input: Partial<ApplicationInput>): Record<string, unknown> {
  return { ...input, updated_at: new Date().toISOString() };
}

export async function fetchApplications(): Promise<Application[]> {
  const { data, error } = await requireSupabase()
    .from('applications')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Application[];
}

export async function createApplication(input: ApplicationInput): Promise<Application> {
  const payload = { ...input, updated_at: new Date().toISOString() };
  const { data, error } = await requireSupabase()
    .from('applications')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as Application;
}

export async function updateApplication(
  id: string,
  changes: Partial<ApplicationInput>
): Promise<Application> {
  const { data, error } = await requireSupabase()
    .from('applications')
    .update(withUpdatedAt(changes))
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Application;
}

export async function updateStatus(id: string, status: Status): Promise<Application> {
  return updateApplication(id, { status });
}

export async function deleteApplication(id: string): Promise<void> {
  const { error } = await requireSupabase().from('applications').delete().eq('id', id);
  if (error) throw error;
}
