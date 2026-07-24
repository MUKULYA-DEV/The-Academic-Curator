-- 1. Create the user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id)
);

-- 2. Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Users can read their own role
DROP POLICY IF EXISTS "Users can read their own role" ON user_roles;
CREATE POLICY "Users can read their own role"
ON user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 4. Automatically set your current user as an admin (Replace with your actual email if needed)
-- NOTE: If you already know your auth.users UUID, you can just do a direct INSERT.
-- This script safely attempts to insert an admin role for the most recently created user
-- as a quick setup helper.
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users ORDER BY created_at DESC LIMIT 1
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
