-- Simplified QR Code System Database Setup
-- This script handles existing policies and creates essential components

-- 1. Create QR Tokens table (if not exists)
CREATE TABLE IF NOT EXISTS qr_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Client Uploads table (if not exists)
CREATE TABLE IF NOT EXISTS client_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  qr_token_id UUID REFERENCES qr_tokens(id),
  upload_status TEXT DEFAULT 'pending' CHECK (upload_status IN ('pending', 'uploading', 'processing', 'completed', 'failed')),
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  
  -- Document images
  id_front_url TEXT,
  id_back_url TEXT,
  license_front_url TEXT,
  license_back_url TEXT,
  
  -- Parsed data
  parsed_data JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 3. Create indexes (if not exist)
CREATE INDEX IF NOT EXISTS idx_qr_tokens_token ON qr_tokens(token);
CREATE INDEX IF NOT EXISTS idx_qr_tokens_expires_at ON qr_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_qr_tokens_client_id ON qr_tokens(client_id);
CREATE INDEX IF NOT EXISTS idx_client_uploads_client_id ON client_uploads(client_id);
CREATE INDEX IF NOT EXISTS idx_client_uploads_qr_token_id ON client_uploads(qr_token_id);

-- 4. Enable RLS
ALTER TABLE qr_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_uploads ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies (with IF NOT EXISTS handling)
DO $$
BEGIN
  -- QR Tokens policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'qr_tokens' AND policyname = 'QR tokens are viewable by authenticated users') THEN
    CREATE POLICY "QR tokens are viewable by authenticated users" ON qr_tokens
      FOR SELECT USING (auth.role() = 'authenticated');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'qr_tokens' AND policyname = 'QR tokens can be created by authenticated users') THEN
    CREATE POLICY "QR tokens can be created by authenticated users" ON qr_tokens
      FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'qr_tokens' AND policyname = 'QR tokens can be updated by authenticated users') THEN
    CREATE POLICY "QR tokens can be updated by authenticated users" ON qr_tokens
      FOR UPDATE USING (auth.role() = 'authenticated');
  END IF;
  
  -- Client Uploads policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'client_uploads' AND policyname = 'Client uploads are viewable by authenticated users') THEN
    CREATE POLICY "Client uploads are viewable by authenticated users" ON client_uploads
      FOR SELECT USING (auth.role() = 'authenticated');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'client_uploads' AND policyname = 'Client uploads can be created by authenticated users') THEN
    CREATE POLICY "Client uploads can be created by authenticated users" ON client_uploads
      FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'client_uploads' AND policyname = 'Client uploads can be updated by authenticated users') THEN
    CREATE POLICY "Client uploads can be updated by authenticated users" ON client_uploads
      FOR UPDATE USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- 6. Create storage bucket for client documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'client-documents',
  'client-documents',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/jpg']
) ON CONFLICT (id) DO NOTHING;

-- 7. Create storage policies (with IF NOT EXISTS handling)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to upload client documents') THEN
    CREATE POLICY "Allow authenticated users to upload client documents" ON storage.objects
      FOR INSERT WITH CHECK (
        bucket_id = 'client-documents' AND
        auth.role() = 'authenticated'
      );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to view client documents') THEN
    CREATE POLICY "Allow authenticated users to view client documents" ON storage.objects
      FOR SELECT USING (
        bucket_id = 'client-documents' AND
        auth.role() = 'authenticated'
      );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to update client documents') THEN
    CREATE POLICY "Allow authenticated users to update client documents" ON storage.objects
      FOR UPDATE USING (
        bucket_id = 'client-documents' AND
        auth.role() = 'authenticated'
      );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow authenticated users to delete client documents') THEN
    CREATE POLICY "Allow authenticated users to delete client documents" ON storage.objects
      FOR DELETE USING (
        bucket_id = 'client-documents' AND
        auth.role() = 'authenticated'
      );
  END IF;
END $$;

-- 8. Create functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Create triggers
DROP TRIGGER IF EXISTS update_qr_tokens_updated_at ON qr_tokens;
CREATE TRIGGER update_qr_tokens_updated_at 
  BEFORE UPDATE ON qr_tokens 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_client_uploads_updated_at ON client_uploads;
CREATE TRIGGER update_client_uploads_updated_at 
  BEFORE UPDATE ON client_uploads 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Create cleanup function
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM qr_tokens WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- 11. Create function to mark QR token as used
CREATE OR REPLACE FUNCTION mark_qr_token_used(token_text TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  token_record qr_tokens%ROWTYPE;
BEGIN
  -- Find the token
  SELECT * INTO token_record 
  FROM qr_tokens 
  WHERE token = token_text 
    AND expires_at > NOW() 
    AND used_at IS NULL;
  
  -- If token found and valid, mark as used
  IF FOUND THEN
    UPDATE qr_tokens 
    SET used_at = NOW() 
    WHERE id = token_record.id;
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql; 