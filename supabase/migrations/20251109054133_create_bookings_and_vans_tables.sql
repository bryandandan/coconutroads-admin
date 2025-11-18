-- Create vans table
CREATE TABLE IF NOT EXISTS public.vans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  purchased_at DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.vans IS 'Stores information about available campervans';

-- Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  van_id UUID REFERENCES public.vans(id),
  surname_and_name TEXT NOT NULL,
  email TEXT NOT NULL,
  birth_date DATE NOT NULL,
  telephone TEXT NOT NULL,
  nationality TEXT NOT NULL,
  departure_date DATE NOT NULL,
  return_date DATE NOT NULL,
  requests TEXT,
  terms_accepted BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'approved', 'rejected', 'cancelled', 'completed')
  ),
  admin_notes TEXT,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.bookings IS 'Stores all booking requests from customers';

-- Create booking_status_history table
CREATE TABLE IF NOT EXISTS public.booking_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id),
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.booking_status_history IS 'Audit trail for booking status changes';

-- Enable Row Level Security
ALTER TABLE public.vans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_status_history ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust these based on your security requirements)
-- For now, allowing authenticated users full access - you should customize these

CREATE POLICY "Enable read access for authenticated users" ON public.vans
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable all access for authenticated users" ON public.vans
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable read access for authenticated users" ON public.bookings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable all access for authenticated users" ON public.bookings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable read access for authenticated users" ON public.booking_status_history
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable all access for authenticated users" ON public.booking_status_history
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_vans_updated_at
  BEFORE UPDATE ON public.vans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
