-- Split surname_and_name into first_name and last_name for better data structure

-- Add new columns
ALTER TABLE bookings
  ADD COLUMN first_name TEXT,
  ADD COLUMN last_name TEXT;

-- Migrate existing data: try to split surname_and_name
-- Assumes format is "Surname Firstname" or "Surname Multiple Firstnames"
-- If only one word, put it in last_name
UPDATE bookings
SET
  last_name = TRIM(SPLIT_PART(surname_and_name, ' ', 1)),
  first_name = CASE
    WHEN surname_and_name ~ '\s' THEN TRIM(SUBSTRING(surname_and_name FROM POSITION(' ' IN surname_and_name) + 1))
    ELSE ''
  END
WHERE surname_and_name IS NOT NULL;

-- Make new columns NOT NULL (after migration)
ALTER TABLE bookings
  ALTER COLUMN first_name SET NOT NULL,
  ALTER COLUMN last_name SET NOT NULL;

-- Drop old column
ALTER TABLE bookings
  DROP COLUMN surname_and_name;

-- Add comment
COMMENT ON COLUMN bookings.first_name IS 'Customer first name';
COMMENT ON COLUMN bookings.last_name IS 'Customer last name';
