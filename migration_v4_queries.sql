-- 1. First, create the table if it completely doesn't exist
CREATE TABLE IF NOT EXISTS queries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add columns one by one safely
ALTER TABLE queries ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE queries ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE queries ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE queries ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE queries ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE queries ADD COLUMN IF NOT EXISTS college_name TEXT;
ALTER TABLE queries ADD COLUMN IF NOT EXISTS tour_id UUID REFERENCES tours(id) ON DELETE CASCADE;
ALTER TABLE queries ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE queries ADD COLUMN IF NOT EXISTS course_interested TEXT;
ALTER TABLE queries ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'open';
ALTER TABLE queries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE queries ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;
ALTER TABLE queries ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE queries ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 3. Enforce the scalable status workflow
ALTER TABLE queries DROP CONSTRAINT IF EXISTS queries_status_check;

ALTER TABLE queries 
ADD CONSTRAINT queries_status_check 
CHECK (status IN ('open', 'in_progress', 'resolved', 'closed'));

-- 4. Set up Row Level Security (RLS)
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert queries" ON queries;
DROP POLICY IF EXISTS "Authenticated admins can view queries" ON queries;
DROP POLICY IF EXISTS "Authenticated admins can update queries" ON queries;
DROP POLICY IF EXISTS "Authenticated admins can delete queries" ON queries;

CREATE POLICY "Anyone can insert queries"
ON queries FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Authenticated admins can view queries"
ON queries FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated admins can update queries"
ON queries FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated admins can delete queries"
ON queries FOR DELETE
TO authenticated
USING (true);
