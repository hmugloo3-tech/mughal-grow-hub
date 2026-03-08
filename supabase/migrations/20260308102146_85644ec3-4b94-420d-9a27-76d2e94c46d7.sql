
-- Contact form submissions table
CREATE TABLE public.contact_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact form"
  ON public.contact_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all submissions"
  ON public.contact_submissions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update submissions"
  ON public.contact_submissions FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete submissions"
  ON public.contact_submissions FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Product reviews table
CREATE TABLE public.product_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, user_id)
);

ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved reviews"
  ON public.product_reviews FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Authenticated users can insert own reviews"
  ON public.product_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON public.product_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all reviews"
  ON public.product_reviews FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at on reviews
CREATE TRIGGER update_product_reviews_updated_at
  BEFORE UPDATE ON public.product_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Inventory auto-update: reduce stock when order is confirmed
CREATE OR REPLACE FUNCTION public.reduce_stock_on_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item RECORD;
BEGIN
  -- Only reduce stock when status changes to 'confirmed'
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status = 'pending') THEN
    FOR item IN SELECT * FROM jsonb_array_elements(NEW.product_list) LOOP
      UPDATE public.products
      SET stock = GREATEST(0, stock - COALESCE((item.value->>'quantity')::int, 1))
      WHERE id = (item.value->>'id')::uuid;
    END LOOP;
  END IF;
  
  -- Restore stock when order is cancelled
  IF NEW.status = 'cancelled' AND OLD.status IN ('pending', 'confirmed') THEN
    FOR item IN SELECT * FROM jsonb_array_elements(NEW.product_list) LOOP
      UPDATE public.products
      SET stock = stock + COALESCE((item.value->>'quantity')::int, 1)
      WHERE id = (item.value->>'id')::uuid;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_reduce_stock_on_order
  AFTER UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.reduce_stock_on_order();

-- Also handle new orders inserted as confirmed
CREATE TRIGGER trigger_reduce_stock_on_new_order
  AFTER INSERT ON public.orders
  FOR EACH ROW
  WHEN (NEW.status = 'confirmed')
  EXECUTE FUNCTION public.reduce_stock_on_order();
