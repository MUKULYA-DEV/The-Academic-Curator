-- 1. Add status and slug columns to tours table
ALTER TABLE tours 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published',
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- 2. Add CHECK constraint for status
-- Drop first in case we run this multiple times
ALTER TABLE tours DROP CONSTRAINT IF EXISTS chk_tours_status;
ALTER TABLE tours
ADD CONSTRAINT chk_tours_status CHECK (status IN ('draft', 'published', 'archived'));

-- 3. Add Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_tours_status ON tours(status);
CREATE INDEX IF NOT EXISTS idx_tours_slug ON tours(slug);
CREATE INDEX IF NOT EXISTS idx_tours_city ON tours(city);
CREATE INDEX IF NOT EXISTS idx_tours_university_name ON tours(university_name);
