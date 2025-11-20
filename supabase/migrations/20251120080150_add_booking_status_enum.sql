-- Create enum type for booking status
CREATE TYPE booking_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled', 'completed');

-- Alter bookings table to use the enum type
-- First, drop the check constraint
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;

-- Drop the default value temporarily
ALTER TABLE bookings ALTER COLUMN status DROP DEFAULT;

-- Then, alter the column to use the enum type
ALTER TABLE bookings
  ALTER COLUMN status TYPE booking_status
  USING status::booking_status;

-- Re-add the default value using the enum type
ALTER TABLE bookings ALTER COLUMN status SET DEFAULT 'pending'::booking_status;

-- Update booking_status_history table to use the enum type for both columns
ALTER TABLE booking_status_history
  ALTER COLUMN old_status TYPE booking_status
  USING CASE
    WHEN old_status IS NULL THEN NULL
    ELSE old_status::booking_status
  END;

ALTER TABLE booking_status_history
  ALTER COLUMN new_status TYPE booking_status
  USING new_status::booking_status;
