import type { ApplicationInput } from '@/types/application';
import { STATUSES } from '@/types/application';

export type ValidationErrors = Partial<Record<keyof ApplicationInput, string>>;

const MAX_TEXT = 500;
const MAX_NOTES = 5000;

export function validateApplication(input: Partial<ApplicationInput>): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!input.company || input.company.trim().length === 0) {
    errors.company = 'Company is required.';
  } else if (input.company.length > MAX_TEXT) {
    errors.company = `Company must be under ${MAX_TEXT} characters.`;
  }

  if (!input.role || input.role.trim().length === 0) {
    errors.role = 'Role is required.';
  } else if (input.role.length > MAX_TEXT) {
    errors.role = `Role must be under ${MAX_TEXT} characters.`;
  }

  if (input.status && !STATUSES.includes(input.status)) {
    errors.status = 'Invalid status.';
  }

  if (input.applied_date && Number.isNaN(Date.parse(input.applied_date))) {
    errors.applied_date = 'Invalid applied date.';
  }

  if (input.interview_date && Number.isNaN(Date.parse(input.interview_date))) {
    errors.interview_date = 'Invalid interview date.';
  }

  if (
    input.applied_date &&
    input.interview_date &&
    !Number.isNaN(Date.parse(input.applied_date)) &&
    !Number.isNaN(Date.parse(input.interview_date)) &&
    Date.parse(input.interview_date) < Date.parse(input.applied_date)
  ) {
    errors.interview_date = 'Interview date cannot be before the applied date.';
  }

  if (input.location && input.location.length > MAX_TEXT) {
    errors.location = `Location must be under ${MAX_TEXT} characters.`;
  }

  if (input.job_url && input.job_url.trim().length > 0) {
    try {
      const url = new URL(input.job_url);
      if (!['http:', 'https:'].includes(url.protocol)) {
        errors.job_url = 'URL must start with http:// or https://';
      }
    } catch {
      errors.job_url = 'Enter a valid URL.';
    }
  }

  if (input.notes && input.notes.length > MAX_NOTES) {
    errors.notes = `Notes must be under ${MAX_NOTES} characters.`;
  }

  return errors;
}

export function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}
