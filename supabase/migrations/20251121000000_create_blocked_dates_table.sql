-- Create blocked_dates table for managing calendar availability
CREATE TABLE IF NOT EXISTS blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Add RLS policies
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view blocked dates (public calendar)
CREATE POLICY "Anyone can view blocked dates"
  ON blocked_dates FOR SELECT
  USING (true);

-- Allow authenticated users to manage blocked dates (admin only)
CREATE POLICY "Authenticated users can manage blocked dates"
  ON blocked_dates FOR ALL
  USING (auth.role() = 'authenticated');

-- Add index on date range for better query performance
CREATE INDEX idx_blocked_dates_range ON blocked_dates USING GIST (
  daterange(start_date, end_date, '[]')
);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_blocked_dates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blocked_dates_updated_at
  BEFORE UPDATE ON blocked_dates
  FOR EACH ROW
  EXECUTE FUNCTION update_blocked_dates_updated_at();

COMMENT ON TABLE blocked_dates IS 'Stores date ranges when vans are unavailable for booking';
