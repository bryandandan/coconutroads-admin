-- Remove trailing commas from last names
-- This fixes the issue where last names have commas because the original format was "LastName, FirstName"

UPDATE bookings
SET last_name = RTRIM(last_name, ',')
WHERE last_name LIKE '%,';

COMMENT ON COLUMN bookings.last_name IS 'Customer last name (commas removed)';
