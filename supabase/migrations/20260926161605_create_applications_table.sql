/*
# Create applications table (single-tenant, no auth)

1. New Tables
- `applications`
  - `id` (uuid, primary key)
  - `company` (text, not null) — company name
  - `role` (text, not null) — role/title applied for
  - `status` (text, not null, default 'Saved') — current stage; constrained to the allowed status set
  - `applied_date` (date, nullable) — when the application was submitted
  - `interview_date` (date, nullable) — scheduled interview date
  - `location` (text, nullable) — job location / remote
  - `job_url` (text, nullable) — link to the job posting
  - `notes` (text, nullable) — free-form notes
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now()) — updated on every change

2. Constraints
- `applications_status_check` — status must be one of:
  Saved, Applied, Screening, Interview, Offer, Rejected, Withdrawn

3. Indexes
- `idx_applications_status` — fast grouping/filtering by status
- `idx_applications_updated_at` — recently-updated ordering
- `idx_applications_interview_date` — upcoming-interview queries

4. Security
- Enable RLS on `applications`.
- Allow anon + authenticated full CRUD because this is a single-tenant app with no
  sign-in; the data is intentionally shared/public.

5. Notes
- `updated_at` is maintained by the frontend on every update; the column has a
  default of now() so inserts that omit it still succeed.
*/

CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company text NOT NULL,
  role text NOT NULL,
  status text NOT NULL DEFAULT 'Saved' CHECK (status IN ('Saved','Applied','Screening','Interview','Offer','Rejected','Withdrawn')),
  applied_date date,
  interview_date date,
  location text,
  job_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_applications" ON applications;
CREATE POLICY "anon_select_applications" ON applications FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_applications" ON applications;
CREATE POLICY "anon_insert_applications" ON applications FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_applications" ON applications;
CREATE POLICY "anon_update_applications" ON applications FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_applications" ON applications;
CREATE POLICY "anon_delete_applications" ON applications FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_applications_status ON applications (status);
CREATE INDEX IF NOT EXISTS idx_applications_updated_at ON applications (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_interview_date ON applications (interview_date);