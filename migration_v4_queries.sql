-- 1. Extend the existing queries table
-- Ensure basic columns exist just in case they don't
ALTER TABLE queries
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS message TEXT,
ADD COLUMN IF NOT EXISTS college_name TEXT,
ADD COLUMN IF NOT EXISTS tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS course_interested TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'open',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now(),
ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Enforce the scalable status workflow
-- Drop the constraint if it already exists to avoid errors on rerun
ALTER TABLE queries DROP CONSTRAINT IF EXISTS queries_status_check;

ALTER TABLE queries 
ADD CONSTRAINT queries_status_check 
CHECK (status IN ('open', 'in_progress', 'resolved', 'closed'));

-- 3. Set up Row Level Security (RLS)
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to ensure clean slate
DROP POLICY IF EXISTS "Anyone can insert queries" ON queries;
DROP POLICY IF EXISTS "Authenticated admins can view queries" ON queries;
DROP POLICY IF EXISTS "Authenticated admins can update queries" ON queries;
DROP POLICY IF EXISTS "Authenticated admins can delete queries" ON queries;

-- Policy: Public can insert queries (so website visitors can submit)
CREATE POLICY "Anyone can insert queries"
ON queries FOR INSERT
TO public
WITH CHECK (true);

-- Policy: Authenticated admins can view all queries
CREATE POLICY "Authenticated admins can view queries"
ON queries FOR SELECT
TO authenticated
USING (true);

-- Policy: Authenticated admins can update queries (status, admin_notes, etc)
CREATE POLICY "Authenticated admins can update queries"
ON queries FOR UPDATE
TO authenticated
USING (true);

-- Policy: Authenticated admins can delete queries (optional cleanup)
CREATE POLICY "Authenticated admins can delete queries"
ON queries FOR DELETE
TO authenticated
USING (true);
