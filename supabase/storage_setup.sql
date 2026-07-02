-- ============================================================
-- Supabase Storage Policies — MD Muntasir Shihab Portfolio
-- copy and run this SQL script in your Supabase Project SQL Editor
-- ============================================================

-- 1. Create the buckets if they do not exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('images', 'images', true),
  ('pdfs', 'pdfs', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- 2. Enable Row Level Security on storage.objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Drop any conflicting existing policies
DROP POLICY IF EXISTS "Public Upload Images" ON storage.objects;
DROP POLICY IF EXISTS "Public Read Images" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Images" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Images" ON storage.objects;

DROP POLICY IF EXISTS "Public Upload Pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Public Read Pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Pdfs" ON storage.objects;

-- 4. Create policies for the 'images' bucket (used for avatars, logos, testimonials)
CREATE POLICY "Public Upload Images" ON storage.objects 
  FOR INSERT TO public WITH CHECK (bucket_id = 'images');
  
CREATE POLICY "Public Read Images" ON storage.objects 
  FOR SELECT TO public USING (bucket_id = 'images');
  
CREATE POLICY "Public Update Images" ON storage.objects 
  FOR UPDATE TO public USING (bucket_id = 'images');

CREATE POLICY "Public Delete Images" ON storage.objects 
  FOR DELETE TO public USING (bucket_id = 'images');

-- 5. Create policies for the 'pdfs' bucket (used for CV and Resumes)
CREATE POLICY "Public Upload Pdfs" ON storage.objects 
  FOR INSERT TO public WITH CHECK (bucket_id = 'pdfs');
  
CREATE POLICY "Public Read Pdfs" ON storage.objects 
  FOR SELECT TO public USING (bucket_id = 'pdfs');
  
CREATE POLICY "Public Update Pdfs" ON storage.objects 
  FOR UPDATE TO public USING (bucket_id = 'pdfs');

CREATE POLICY "Public Delete Pdfs" ON storage.objects 
  FOR DELETE TO public USING (bucket_id = 'pdfs');
