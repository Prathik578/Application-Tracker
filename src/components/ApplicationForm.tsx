import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { Application, ApplicationInput, Status } from '@/types/application';
import { STATUSES } from '@/types/application';
import { validateApplication, hasErrors, type ValidationErrors } from '@/lib/validation';
import { STATUS_CONFIG } from '@/lib/statusConfig';

type Props = {
  open: boolean;
  initial?: Application | null;
  onClose: () => void;
  onSubmit: (input: ApplicationInput) => Promise<void>;
};

const empty: ApplicationInput = {
  company: '',
  role: '',
  status: 'Saved',
  applied_date: null,
  interview_date: null,
  location: '',
  job_url: '',
  notes: '',
};

function toDateInput(iso: string | null): string {
  if (!iso) return '';
  return iso.slice(0, 10);
}

export function ApplicationForm({ open, initial, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<ApplicationInput>(empty);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSubmitError(null);
      setErrors({});
      if (initial) {
        setForm({
          company: initial.company,
          role: initial.role,
          status: initial.status,
          applied_date: initial.applied_date,
          interview_date: initial.interview_date,
          location: initial.location ?? '',
          job_url: initial.job_url ?? '',
          notes: initial.notes ?? '',
        });
      } else {
        setForm(empty);
      }
    }
  }, [open, initial]);

  if (!open) return null;

  const update = <K extends keyof ApplicationInput>(key: K, value: ApplicationInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const errs = validateApplication(form);
    setErrors(errs);
    if (hasErrors(errs)) return;

    setSubmitting(true);
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={initial ? 'Edit application' : 'Add application'}
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {initial ? 'Edit application' : 'Add application'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Company" error={errors.company} required>
                <input
                  type="text"
                  value={form.company}
                  onChange={(e) => update('company', e.target.value)}
                  maxLength={500}
                  className={inputClass(errors.company)}
                  aria-invalid={!!errors.company}
                />
              </Field>
              <Field label="Role" error={errors.role} required>
                <input
                  type="text"
                  value={form.role}
                  onChange={(e) => update('role', e.target.value)}
                  maxLength={500}
                  className={inputClass(errors.role)}
                  aria-invalid={!!errors.role}
                />
              </Field>
            </div>

            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) => update('status', e.target.value as Status)}
                className={inputClass()}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_CONFIG[s].label}
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Applied date" error={errors.applied_date}>
                <input
                  type="date"
                  value={toDateInput(form.applied_date)}
                  onChange={(e) =>
                    update('applied_date', e.target.value || null)
                  }
                  className={inputClass(errors.applied_date)}
                  aria-invalid={!!errors.applied_date}
                />
              </Field>
              <Field label="Interview date" error={errors.interview_date}>
                <input
                  type="date"
                  value={toDateInput(form.interview_date)}
                  onChange={(e) =>
                    update('interview_date', e.target.value || null)
                  }
                  className={inputClass(errors.interview_date)}
                  aria-invalid={!!errors.interview_date}
                />
              </Field>
            </div>

            <Field label="Location" error={errors.location}>
              <input
                type="text"
                value={form.location ?? ''}
                onChange={(e) => update('location', e.target.value)}
                maxLength={500}
                placeholder="Remote, San Francisco, etc."
                className={inputClass(errors.location)}
              />
            </Field>

            <Field label="Job URL" error={errors.job_url}>
              <input
                type="url"
                value={form.job_url ?? ''}
                onChange={(e) => update('job_url', e.target.value)}
                placeholder="https://..."
                className={inputClass(errors.job_url)}
              />
            </Field>

            <Field label="Notes" error={errors.notes}>
              <textarea
                value={form.notes ?? ''}
                onChange={(e) => update('notes', e.target.value)}
                maxLength={5000}
                rows={4}
                placeholder="Any details about the role, recruiter, etc."
                className={inputClass(errors.notes)}
              />
            </Field>

            {submitError && (
              <p
                role="alert"
                className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700"
              >
                {submitError}
              </p>
            )}
          </div>
        </form>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            {submitting ? 'Saving…' : initial ? 'Save changes' : 'Add application'}
          </button>
        </div>
      </div>
    </div>
  );
}

function inputClass(error?: string): string {
  return `w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition focus:outline-none focus:ring-2 focus:ring-slate-400 ${
    error
      ? 'border-rose-300 bg-rose-50 focus:border-rose-400 focus:ring-rose-300'
      : 'border-slate-200 bg-white focus:border-slate-400'
  }`;
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </span>
      {children}
      {error && (
        <span className="mt-1 block text-xs text-rose-600">{error}</span>
      )}
    </label>
  );
}
