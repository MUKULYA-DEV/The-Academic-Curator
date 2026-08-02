-- 1. Helper Function: Check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
      AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Tours Table RLS
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view tours" ON tours;
CREATE POLICY "Anyone can view tours" 
ON tours FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Admins can insert tours" ON tours;
CREATE POLICY "Admins can insert tours" 
ON tours FOR INSERT 
TO authenticated 
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update tours" ON tours;
CREATE POLICY "Admins can update tours" 
ON tours FOR UPDATE 
TO authenticated 
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete tours" ON tours;
CREATE POLICY "Admins can delete tours" 
ON tours FOR DELETE 
TO authenticated 
USING (public.is_admin());

-- 3. Bookings Table RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
CREATE POLICY "Users can view their own bookings" 
ON bookings FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert their own bookings" ON bookings;
CREATE POLICY "Users can insert their own bookings" 
ON bookings FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own bookings" ON bookings;
CREATE POLICY "Users can update their own bookings" 
ON bookings FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id OR public.is_admin());

-- 4. Queries Table RLS (Update from v4)
-- We want anyone to insert, but only admins to select/update/delete.
DROP POLICY IF EXISTS "Authenticated admins can view queries" ON queries;
CREATE POLICY "Admins can view queries" 
ON queries FOR SELECT 
TO authenticated 
USING (public.is_admin());

DROP POLICY IF EXISTS "Authenticated admins can update queries" ON queries;
CREATE POLICY "Admins can update queries" 
ON queries FOR UPDATE 
TO authenticated 
USING (public.is_admin());

DROP POLICY IF EXISTS "Authenticated admins can delete queries" ON queries;
CREATE POLICY "Admins can delete queries" 
ON queries FOR DELETE 
TO authenticated 
USING (public.is_admin());

-- 5. Profiles Table RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" 
ON profiles FOR SELECT 
TO authenticated 
USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id OR public.is_admin());

-- 6. Site Settings Table RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view site settings" ON site_settings;
CREATE POLICY "Anyone can view site settings" 
ON site_settings FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Admins can insert site settings" ON site_settings;
CREATE POLICY "Admins can insert site settings" 
ON site_settings FOR INSERT 
TO authenticated 
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update site settings" ON site_settings;
CREATE POLICY "Admins can update site settings" 
ON site_settings FOR UPDATE 
TO authenticated 
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete site settings" ON site_settings;
CREATE POLICY "Admins can delete site settings" 
ON site_settings FOR DELETE 
TO authenticated 
USING (public.is_admin());

-- 7. Add Missing Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_tours_status ON tours(status);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_queries_status ON queries(status);
CREATE INDEX IF NOT EXISTS idx_queries_user_id ON queries(user_id);
CREATE INDEX IF NOT EXISTS idx_queries_tour_id ON queries(tour_id);

-- 8. Enforce UUID usages with Constraints
-- Adding NOT NULL might fail if existing records have NULLs. 
-- We'll just enforce foreign keys (already done in previous migrations).
