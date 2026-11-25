-- migration_v9_booking_integrity.sql
--
-- Closes the holes left by v7/v8:
--   * create_booking trusted user_id, prices and status sent by the browser.
--   * Users could UPDATE any column of their own booking (price, status, group size).
--   * Users could INSERT bookings directly, skipping the slot check.
--   * Any signed-in user could upload, replace or delete files in tour-media.
--
-- After this migration the only way a student can touch a booking is through
-- create_booking / update_booking / cancel_booking, and every price is
-- calculated here from the tours table.
--
-- Safe to re-run.

-- ---------------------------------------------------------------------------
-- 1. create_booking: identity from the session, price from the tours table
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_booking(payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_tour tours%ROWTYPE;
  v_group_size INTEGER;
  v_tour_date DATE;
  v_time_slot TEXT;
  v_course TEXT;
  v_branch TEXT;
  v_phone TEXT;
  v_unit_price NUMERIC;
  v_discount_price NUMERIC;
  v_effective_price NUMERIC;
  v_college_name TEXT;
  v_booking bookings%ROWTYPE;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'You must be signed in to book a tour.';
  END IF;

  v_group_size := (payload->>'group_size')::INTEGER;
  v_tour_date := (payload->>'tour_date')::DATE;
  v_time_slot := lower(coalesce(payload->>'time_slot', ''));
  v_course := nullif(btrim(left(payload->>'course', 200)), '');
  v_branch := nullif(btrim(left(payload->>'branch', 200)), '');
  v_phone := nullif(btrim(left(payload->>'phone_number', 20)), '');

  IF v_group_size IS NULL OR v_group_size < 1 OR v_group_size > 15 THEN
    RAISE EXCEPTION 'Group size must be between 1 and 15.';
  END IF;
  IF v_tour_date IS NULL OR v_tour_date < (now() AT TIME ZONE 'Asia/Kolkata')::DATE THEN
    RAISE EXCEPTION 'Please choose a tour date that is today or later.';
  END IF;
  IF v_time_slot NOT IN ('morning', 'afternoon') THEN
    RAISE EXCEPTION 'Please choose a morning or afternoon slot.';
  END IF;
  IF v_phone IS NULL THEN
    RAISE EXCEPTION 'A phone number is required.';
  END IF;

  -- Lock the tour row so concurrent bookings for the same tour run one at a time.
  SELECT * INTO v_tour
  FROM tours
  WHERE id = (payload->>'tour_id')::UUID
  FOR UPDATE;

  IF NOT FOUND OR v_tour.status IS DISTINCT FROM 'published' THEN
    RAISE EXCEPTION 'This tour is not available for booking.';
  END IF;
  IF v_tour.price IS NULL THEN
    RAISE EXCEPTION 'Pricing is not configured for this tour.';
  END IF;
  IF v_tour.available_slots < v_group_size THEN
    RAISE EXCEPTION 'Insufficient slots available. Requested: %, Available: %',
      v_group_size, v_tour.available_slots;
  END IF;

  IF EXISTS (
    SELECT 1 FROM bookings
    WHERE user_id = v_user_id
      AND tour_id = v_tour.id
      AND tour_date = v_tour_date::TEXT
      AND time_slot = v_time_slot
      AND status IS DISTINCT FROM 'cancelled'
  ) THEN
    RAISE EXCEPTION 'You already have a booking for this tour at that time.';
  END IF;

  -- Prices come from the tour, never from the browser.
  v_unit_price := v_tour.price;
  v_discount_price := CASE
    WHEN v_tour.discount_price IS NOT NULL AND v_tour.discount_price < v_tour.price
    THEN v_tour.discount_price
  END;
  v_effective_price := coalesce(v_discount_price, v_unit_price);

  v_college_name := concat_ws(' — ',
    coalesce(nullif(btrim(v_tour.title), ''), nullif(btrim(v_tour.university_name), ''), 'Campus Tour'),
    v_course,
    v_branch);

  INSERT INTO bookings (
    user_id, user_email, tour_id, college_name, course, branch,
    tour_date, time_slot, unit_price, discount_price, total_price,
    phone_number, group_size, status
  ) VALUES (
    v_user_id, auth.jwt() ->> 'email', v_tour.id, v_college_name, v_course, v_branch,
    v_tour_date::TEXT, v_time_slot, v_unit_price, v_discount_price,
    v_effective_price * v_group_size,
    v_phone, v_group_size, 'upcoming'
  )
  RETURNING * INTO v_booking;

  RETURN to_jsonb(v_booking);
END;
$$;

-- ---------------------------------------------------------------------------
-- 2. update_booking: a student may reschedule or resize an upcoming booking
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_booking(payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_booking bookings%ROWTYPE;
  v_tour tours%ROWTYPE;
  v_group_size INTEGER;
  v_tour_date DATE;
  v_time_slot TEXT;
  v_course TEXT;
  v_branch TEXT;
  v_phone TEXT;
  v_effective_price NUMERIC;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'You must be signed in to edit a booking.';
  END IF;

  SELECT * INTO v_booking
  FROM bookings
  WHERE id = (payload->>'id')::BIGINT AND user_id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found.';
  END IF;
  IF v_booking.status IS DISTINCT FROM 'upcoming' THEN
    RAISE EXCEPTION 'Only upcoming bookings can be changed.';
  END IF;

  v_group_size := (payload->>'group_size')::INTEGER;
  v_tour_date := (payload->>'tour_date')::DATE;
  v_time_slot := lower(coalesce(payload->>'time_slot', ''));
  v_course := nullif(btrim(left(payload->>'course', 200)), '');
  v_branch := nullif(btrim(left(payload->>'branch', 200)), '');
  v_phone := nullif(btrim(left(payload->>'phone_number', 20)), '');

  IF v_group_size IS NULL OR v_group_size < 1 OR v_group_size > 15 THEN
    RAISE EXCEPTION 'Group size must be between 1 and 15.';
  END IF;
  IF v_tour_date IS NULL OR v_tour_date < (now() AT TIME ZONE 'Asia/Kolkata')::DATE THEN
    RAISE EXCEPTION 'Please choose a tour date that is today or later.';
  END IF;
  IF v_time_slot NOT IN ('morning', 'afternoon') THEN
    RAISE EXCEPTION 'Please choose a morning or afternoon slot.';
  END IF;
  IF v_phone IS NULL THEN
    RAISE EXCEPTION 'A phone number is required.';
  END IF;

  IF v_booking.tour_id IS NOT NULL THEN
    SELECT * INTO v_tour FROM tours WHERE id = v_booking.tour_id FOR UPDATE;

    -- The booking's current seats are already counted, so they are free to reuse.
    IF FOUND AND v_tour.available_slots + coalesce(v_booking.group_size, 0) < v_group_size THEN
      RAISE EXCEPTION 'Insufficient slots available. Requested: %, Available: %',
        v_group_size, v_tour.available_slots + coalesce(v_booking.group_size, 0);
    END IF;

    IF EXISTS (
      SELECT 1 FROM bookings
      WHERE user_id = v_user_id
        AND tour_id = v_booking.tour_id
        AND tour_date = v_tour_date::TEXT
        AND time_slot = v_time_slot
        AND status IS DISTINCT FROM 'cancelled'
        AND id <> v_booking.id
    ) THEN
      RAISE EXCEPTION 'You already have a booking for this tour at that time.';
    END IF;
  END IF;

  -- Keep the price the student originally booked at; only the head count changes.
  v_effective_price := coalesce(v_booking.discount_price, v_booking.unit_price);

  UPDATE bookings SET
    course = v_course,
    branch = v_branch,
    phone_number = v_phone,
    tour_date = v_tour_date::TEXT,
    time_slot = v_time_slot,
    group_size = v_group_size,
    total_price = CASE
      WHEN v_effective_price IS NULL THEN total_price
      ELSE v_effective_price * v_group_size
    END,
    college_name = concat_ws(' — ',
      coalesce(nullif(btrim(v_tour.title), ''), nullif(btrim(v_tour.university_name), ''),
               nullif(split_part(coalesce(v_booking.college_name, ''), ' — ', 1), ''), 'Campus Tour'),
      v_course,
      v_branch)
  WHERE id = v_booking.id
  RETURNING * INTO v_booking;

  RETURN to_jsonb(v_booking);
END;
$$;

-- ---------------------------------------------------------------------------
-- 3. cancel_booking: the only status change a student can make
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.cancel_booking(p_booking_id BIGINT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_booking bookings%ROWTYPE;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'You must be signed in to cancel a booking.';
  END IF;

  UPDATE bookings
  SET status = 'cancelled'
  WHERE id = p_booking_id
    AND user_id = v_user_id
    AND status IN ('upcoming', 'confirmed')
  RETURNING * INTO v_booking;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'This booking cannot be cancelled.';
  END IF;

  RETURN to_jsonb(v_booking);
END;
$$;

-- ---------------------------------------------------------------------------
-- 4. Lock down direct table access: students go through the functions above
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can insert their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON bookings;

DROP POLICY IF EXISTS "Admins can update bookings" ON bookings;
CREATE POLICY "Admins can update bookings"
ON bookings FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- 5. Function privileges
-- ---------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.create_booking(JSONB) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.update_booking(JSONB) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.cancel_booking(BIGINT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_booking(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_booking(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_booking(BIGINT) TO authenticated;

-- Internal helper: only triggers should call it.
REVOKE ALL ON FUNCTION public.recalculate_tour_slots(UUID) FROM PUBLIC, anon, authenticated;

ALTER FUNCTION public.is_admin() SET search_path = public;
ALTER FUNCTION public.recalculate_tour_slots(UUID) SET search_path = public;
ALTER FUNCTION public.trigger_recalculate_slots_on_booking() SET search_path = public;
ALTER FUNCTION public.trigger_recalculate_slots_on_tour() SET search_path = public;

-- ---------------------------------------------------------------------------
-- 6. tour-media: the v3 policies were named "admins" but allowed every signed-in user
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated admins can insert tour-media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated admins can update tour-media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated admins can delete tour-media" ON storage.objects;

CREATE POLICY "Authenticated admins can insert tour-media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tour-media' AND public.is_admin());

CREATE POLICY "Authenticated admins can update tour-media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'tour-media' AND public.is_admin())
WITH CHECK (bucket_id = 'tour-media' AND public.is_admin());

CREATE POLICY "Authenticated admins can delete tour-media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'tour-media' AND public.is_admin());
