export const STATUSES = [
  'Saved',
  'Applied',
  'Screening',
  'Interview',
  'Offer',
  'Rejected',
  'Withdrawn',
] as const;

export type Status = (typeof STATUSES)[number];

export type Application = {
  id: string;
  company: string;
  role: string;
  status: Status;
  applied_date: string | null;
  interview_date: string | null;
  location: string | null;
  job_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ApplicationInput = {
  company: string;
  role: string;
  status: Status;
  applied_date: string | null;
  interview_date: string | null;
  location: string | null;
  job_url: string | null;
  notes: string | null;
};

export type SortKey = 'newest' | 'oldest' | 'interview' | 'company';

export type StatusFilter = Status | 'all';
