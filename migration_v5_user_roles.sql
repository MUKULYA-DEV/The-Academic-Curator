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

-- 4. Grant admin to one named account.
-- This used to promote the most recently created user, which hands admin to a
-- stranger if the script is ever re-run after launch. Replace the email below
-- and run this statement by hand, once.
--
-- INSERT INTO user_roles (user_id, role)
-- SELECT id, 'admin' FROM auth.users WHERE email = 'you@example.com'
-- ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
