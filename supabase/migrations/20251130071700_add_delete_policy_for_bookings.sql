-- Add DELETE policy for authenticated users on bookings table
-- This allows admin users to delete bookings from the admin dashboard

CREATE POLICY "Allow authenticated users to delete bookings"
ON public.bookings
FOR DELETE
TO public
USING (auth.role() = 'authenticated');
