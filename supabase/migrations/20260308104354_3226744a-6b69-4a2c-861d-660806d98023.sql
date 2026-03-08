CREATE TABLE public.disease_detections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  image_url TEXT,
  crop_name TEXT,
  disease_name TEXT,
  confidence NUMERIC,
  severity TEXT,
  symptoms TEXT,
  causes TEXT,
  treatment JSONB,
  safety_tips TEXT[],
  is_healthy BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.disease_detections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own detections"
  ON public.disease_detections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own detections"
  ON public.disease_detections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own detections"
  ON public.disease_detections FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);