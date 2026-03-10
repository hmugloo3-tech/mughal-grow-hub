
-- Create a security definer function for public order tracking by ID + phone
CREATE OR REPLACE FUNCTION public.track_order(_order_id uuid, _phone text)
RETURNS TABLE (
  id uuid,
  status text,
  total_price numeric,
  delivery_charges numeric,
  payment_method text,
  payment_status text,
  estimated_delivery text,
  tracking_notes text[],
  created_at timestamptz,
  product_list jsonb,
  customer_name text,
  delivery_address_snapshot jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    o.id, o.status::text, o.total_price, o.delivery_charges, 
    o.payment_method, o.payment_status, o.estimated_delivery,
    o.tracking_notes, o.created_at, o.product_list,
    o.customer_name, o.delivery_address_snapshot
  FROM public.orders o
  WHERE o.id = _order_id AND o.customer_phone = _phone
  LIMIT 1;
$$;
