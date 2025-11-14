-- Migración 003: Crear bucket de storage para capturas de feedback
-- Ejecutar en Supabase Dashboard > Storage

-- Crear bucket para capturas de pantalla de feedback
INSERT INTO storage.buckets (id, name, public)
VALUES ('feedback-screenshots', 'feedback-screenshots', false)
ON CONFLICT (id) DO NOTHING;

-- Política para que usuarios puedan subir sus propias capturas
CREATE POLICY "Users can upload their own feedback screenshots"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'feedback-screenshots' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para que usuarios puedan leer sus propias capturas
CREATE POLICY "Users can read their own feedback screenshots"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'feedback-screenshots' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para que admins puedan leer todas las capturas
CREATE POLICY "Admins can read all feedback screenshots"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'feedback-screenshots' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

