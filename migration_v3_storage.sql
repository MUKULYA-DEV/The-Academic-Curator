-- Create a new public storage bucket for tour media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'tour-media',
    'tour-media',
    TRUE,
    52428800, -- 50MB max (for videos, images will be much smaller)
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET 
    public = TRUE, 
    file_size_limit = 52428800, 
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'application/pdf'];

-- Set up RLS for the storage.objects table for our bucket
-- Drop existing policies if any to prevent conflicts when re-running
DROP POLICY IF EXISTS "Public can view tour-media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated admins can insert tour-media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated admins can update tour-media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated admins can delete tour-media" ON storage.objects;

-- 1. Public Read Access
CREATE POLICY "Public can view tour-media"
ON storage.objects FOR SELECT
USING ( bucket_id = 'tour-media' );

-- 2. Insert Access for Authenticated Users
CREATE POLICY "Authenticated admins can insert tour-media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'tour-media' );

-- 3. Update Access for Authenticated Users
CREATE POLICY "Authenticated admins can update tour-media"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'tour-media' );

-- 4. Delete Access for Authenticated Users
CREATE POLICY "Authenticated admins can delete tour-media"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'tour-media' );
