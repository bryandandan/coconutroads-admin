-- Enable realtime for bookings table
-- This allows the Supabase realtime subscription to receive updates when bookings are inserted, updated, or deleted

ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
