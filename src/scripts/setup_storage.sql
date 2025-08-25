-- Setup Storage Bucket for Client Documents
-- This script creates the storage bucket and sets up proper policies

-- Create storage bucket for client documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'client-documents',
  'client-documents',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/jpg']
) ON CONFLICT (id) DO NOTHING;

-- Create storage policies for client documents
-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload client documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'client-documents' AND
    auth.role() = 'authenticated'
  );

-- Allow authenticated users to view files
CREATE POLICY "Allow authenticated users to view client documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'client-documents' AND
    auth.role() = 'authenticated'
  );

-- Allow authenticated users to update files
CREATE POLICY "Allow authenticated users to update client documents" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'client-documents' AND
    auth.role() = 'authenticated'
  );

-- Allow authenticated users to delete files
CREATE POLICY "Allow authenticated users to delete client documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'client-documents' AND
    auth.role() = 'authenticated'
  ); 