-- NOTE: Currently, we assume one `tours` record represents one scheduled event (single date/time). 
-- In a future iteration, a `tour_sessions` table should be introduced to support recurring tours 
-- where one tour definition can have multiple schedule dates and independent slot pools.

-- 1. Schema Updates
ALTER TABLE tours ADD COLUMN IF NOT EXISTS total_slots INTEGER DEFAULT 15;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS available_slots INTEGER DEFAULT 15;

-- Drop constraint if exists just in case we are re-running
ALTER TABLE tours DROP CONSTRAINT IF EXISTS check_slots_positive;
-- We add a check constraint to guarantee available_slots never goes negative. 
-- This natively prevents admins from updating total_slots to a value lower than the booked slots.
ALTER TABLE tours ADD CONSTRAINT check_slots_positive CHECK (available_slots >= 0);

-- 2. Unified Slot Recalculation
CREATE OR REPLACE FUNCTION public.recalculate_tour_slots(tour_uuid UUID)
RETURNS VOID AS $$
DECLARE
  v_booked_slots INTEGER;
  v_total_slots INTEGER;
BEGIN
  -- Calculate all booked slots for the tour where status indicates they consume a slot
  SELECT COALESCE(SUM(group_size), 0) INTO v_booked_slots 
  FROM bookings 
  WHERE tour_id = tour_uuid 
    AND status IN ('upcoming', 'confirmed', 'completed');

  -- Fetch current total_slots
  SELECT total_slots INTO v_total_slots FROM tours WHERE id = tour_uuid;
  
  -- Update the cached available_slots
  -- Note: If (v_total_slots - v_booked_slots) < 0, the check_slots_positive constraint will abort the transaction!
  UPDATE tours 
  SET available_slots = (v_total_slots - v_booked_slots)
  WHERE id = tour_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Triggers for Recalculation

-- 3.1 Trigger Function for Bookings
CREATE OR REPLACE FUNCTION public.trigger_recalculate_slots_on_booking()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.recalculate_tour_slots(NEW.tour_id);
  ELSIF TG_OP = 'UPDATE' THEN
    -- If they changed the tour_id (rare) or group_size or status
    PERFORM public.recalculate_tour_slots(NEW.tour_id);
    IF OLD.tour_id != NEW.tour_id THEN
       PERFORM public.recalculate_tour_slots(OLD.tour_id);
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.recalculate_tour_slots(OLD.tour_id);
  END IF;
  
  RETURN NULL; -- AFTER triggers can return NULL
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_recalculate_slots_on_booking ON bookings;
CREATE TRIGGER trg_recalculate_slots_on_booking
AFTER INSERT OR UPDATE OR DELETE ON bookings
FOR EACH ROW
EXECUTE FUNCTION public.trigger_recalculate_slots_on_booking();

-- 3.2 Trigger Function for Tours (when an admin changes total_slots)
CREATE OR REPLACE FUNCTION public.trigger_recalculate_slots_on_tour()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.total_slots IS DISTINCT FROM OLD.total_slots THEN
    PERFORM public.recalculate_tour_slots(NEW.id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_recalculate_slots_on_tour ON tours;
CREATE TRIGGER trg_recalculate_slots_on_tour
AFTER UPDATE OF total_slots ON tours
FOR EACH ROW
EXECUTE FUNCTION public.trigger_recalculate_slots_on_tour();

-- 4. Transactional Booking RPC
-- This safely locks the row and guarantees atomic booking creation.
CREATE OR REPLACE FUNCTION public.create_booking(payload JSONB)
RETURNS JSONB AS $$
DECLARE
  v_tour_id UUID;
  v_group_size INTEGER;
  v_available_slots INTEGER;
  v_inserted_booking JSONB;
BEGIN
  v_tour_id := (payload->>'tour_id')::UUID;
  v_group_size := (payload->>'group_size')::INTEGER;
  
  -- Lock the specific tour row to serialize concurrent booking requests
  SELECT available_slots INTO v_available_slots 
  FROM tours 
  WHERE id = v_tour_id 
  FOR UPDATE;
  
  -- Fail if not enough slots
  IF v_available_slots < v_group_size THEN
    RAISE EXCEPTION 'Insufficient slots available. Requested: %, Available: %', v_group_size, v_available_slots;
  END IF;

  -- Insert the booking (The trigger we created above will automatically decrement available_slots!)
  INSERT INTO bookings (
    user_id,
    user_email,
    tour_id,
    course,
    branch,
    tour_date,
    time_slot,
    unit_price,
    discount_price,
    total_price,
    phone_number,
    group_size,
    status
  ) VALUES (
    (payload->>'user_id')::UUID,
    payload->>'user_email',
    v_tour_id,
    payload->>'course',
    payload->>'branch',
    payload->>'tour_date',
    payload->>'time_slot',
    (payload->>'unit_price')::NUMERIC,
    (payload->>'discount_price')::NUMERIC,
    (payload->>'total_price')::NUMERIC,
    payload->>'phone_number',
    v_group_size,
    COALESCE(payload->>'status', 'upcoming')
  );

  -- Return the newly inserted row's data
  -- We fetch it back as JSONB
  SELECT row_to_json(b)::JSONB INTO v_inserted_booking
  FROM bookings b
  WHERE b.user_id = (payload->>'user_id')::UUID 
    AND b.tour_id = v_tour_id 
  ORDER BY b.created_at DESC 
  LIMIT 1;

  RETURN v_inserted_booking;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
