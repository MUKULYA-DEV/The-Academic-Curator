-- 1. Update Tours Table with dedicated pricing columns
ALTER TABLE tours 
ADD COLUMN IF NOT EXISTS price NUMERIC,
ADD COLUMN IF NOT EXISTS discount_price NUMERIC,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR',
ADD COLUMN IF NOT EXISTS currency_symbol TEXT DEFAULT '₹',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 2. Update Bookings Table with normalized fields and pricing snapshots
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS tour_id UUID REFERENCES tours(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS course TEXT,
ADD COLUMN IF NOT EXISTS branch TEXT,
ADD COLUMN IF NOT EXISTS unit_price NUMERIC,
ADD COLUMN IF NOT EXISTS discount_price NUMERIC,
ADD COLUMN IF NOT EXISTS total_price NUMERIC;

-- 3. Update Queries Table to reference tour_id
ALTER TABLE queries 
ADD COLUMN IF NOT EXISTS tour_id UUID REFERENCES tours(id) ON DELETE SET NULL;

-- 4. Data Migration: Copy pricing data from JSON details to dedicated columns for existing tours
UPDATE tours
SET 
  price = COALESCE((details->'pricing'->>'originalPrice')::NUMERIC, 149.00),
  discount_price = CASE 
    WHEN (details->'pricing'->>'discountedPrice') IS NOT NULL 
    THEN (details->'pricing'->>'discountedPrice')::NUMERIC
    ELSE NULL
  END,
  currency = COALESCE(details->'pricing'->>'currency', 'INR'),
  currency_symbol = COALESCE(details->'pricing'->>'currencySymbol', '₹')
WHERE details IS NOT NULL AND details != '{}'::jsonb;
