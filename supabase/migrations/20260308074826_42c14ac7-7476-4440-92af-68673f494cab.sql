-- Add delivery addresses table
CREATE TABLE public.delivery_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL DEFAULT 'Home',
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  village TEXT,
  district TEXT NOT NULL DEFAULT 'Anantnag',
  state TEXT NOT NULL DEFAULT 'Jammu & Kashmir',
  pincode TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.delivery_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own addresses" ON public.delivery_addresses FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own addresses" ON public.delivery_addresses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own addresses" ON public.delivery_addresses FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own addresses" ON public.delivery_addresses FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all addresses" ON public.delivery_addresses FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_delivery_addresses_updated_at BEFORE UPDATE ON public.delivery_addresses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add delivery fields to orders
ALTER TABLE public.orders
  ADD COLUMN delivery_address_id UUID REFERENCES public.delivery_addresses(id),
  ADD COLUMN delivery_address_snapshot JSONB,
  ADD COLUMN delivery_charges NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN payment_method TEXT NOT NULL DEFAULT 'cod',
  ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN estimated_delivery TEXT,
  ADD COLUMN tracking_notes TEXT[];

-- Add delivery_settings table for admin to configure charges
CREATE TABLE public.delivery_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_charge NUMERIC(10,2) NOT NULL DEFAULT 50,
  free_delivery_above NUMERIC(10,2) NOT NULL DEFAULT 1000,
  estimated_days_local INTEGER NOT NULL DEFAULT 2,
  estimated_days_district INTEGER NOT NULL DEFAULT 4,
  is_delivery_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.delivery_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view delivery settings" ON public.delivery_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage delivery settings" ON public.delivery_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Insert default delivery settings
INSERT INTO public.delivery_settings (base_charge, free_delivery_above, estimated_days_local, estimated_days_district) VALUES (50, 1000, 2, 4);

-- Make customer_phone nullable since logged-in users have it on address
ALTER TABLE public.orders ALTER COLUMN customer_phone DROP NOT NULL;
ALTER TABLE public.orders ALTER COLUMN customer_name DROP NOT NULL;