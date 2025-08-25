-- Create functions and triggers to automatically link client_uploads to clients table
-- This script creates functions to sync image URLs from client_uploads to clients table

-- Function to update client images from the latest uploads
CREATE OR REPLACE FUNCTION update_client_images_from_uploads()
RETURNS TRIGGER AS $$
BEGIN
  -- Update clients table with the latest uploaded images
  UPDATE clients
  SET
    id_front_image_url = NEW.id_front_url,
    id_back_image_url = NEW.id_back_url,
    license_front_image_url = NEW.license_front_url,
    license_back_image_url = NEW.license_back_url,
    updated_at = NOW()
  WHERE id = NEW.client_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update client images when client_uploads is updated
CREATE TRIGGER trigger_update_client_images
  AFTER UPDATE ON client_uploads
  FOR EACH ROW
  EXECUTE FUNCTION update_client_images_from_uploads();

-- Function to sync existing client uploads to clients table
CREATE OR REPLACE FUNCTION sync_existing_client_uploads()
RETURNS void AS $$
BEGIN
  -- Update all clients with their latest uploaded images
  UPDATE clients
  SET
    id_front_image_url = latest_uploads.id_front_url,
    id_back_image_url = latest_uploads.id_back_url,
    license_front_image_url = latest_uploads.license_front_url,
    license_back_image_url = latest_uploads.license_back_url,
    updated_at = NOW()
  FROM (
    SELECT DISTINCT ON (client_id)
      client_id,
      id_front_url,
      id_back_url,
      license_front_url,
      license_back_url
    FROM client_uploads
    WHERE upload_status = 'completed'
    ORDER BY client_id, created_at DESC
  ) latest_uploads
  WHERE clients.id = latest_uploads.client_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get the latest uploaded images for a specific client
CREATE OR REPLACE FUNCTION get_client_images(client_uuid UUID)
RETURNS TABLE(
  id_front_url TEXT,
  id_back_url TEXT,
  license_front_url TEXT,
  license_back_url TEXT,
  upload_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cu.id_front_url,
    cu.id_back_url,
    cu.license_front_url,
    cu.license_back_url,
    cu.upload_status,
    cu.created_at
  FROM client_uploads cu
  WHERE cu.client_id = client_uuid
    AND cu.upload_status = 'completed'
  ORDER BY cu.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Create a view to easily see clients with their latest uploaded images
CREATE OR REPLACE VIEW clients_with_images AS
SELECT 
  c.*,
  cu.id_front_url,
  cu.id_back_url,
  cu.license_front_url,
  cu.license_back_url,
  cu.upload_status,
  cu.created_at as last_upload_at
FROM clients c
LEFT JOIN LATERAL (
  SELECT 
    id_front_url,
    id_back_url,
    license_front_url,
    license_back_url,
    upload_status,
    created_at
  FROM client_uploads
  WHERE client_id = c.id
    AND upload_status = 'completed'
  ORDER BY created_at DESC
  LIMIT 1
) cu ON true;

-- Function to manually sync images for a specific client
CREATE OR REPLACE FUNCTION sync_client_images(client_uuid UUID)
RETURNS void AS $$
DECLARE
  latest_upload RECORD;
BEGIN
  -- Get the latest completed upload for this client
  SELECT 
    id_front_url,
    id_back_url,
    license_front_url,
    license_back_url
  INTO latest_upload
  FROM client_uploads
  WHERE client_id = client_uuid
    AND upload_status = 'completed'
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Update the client with the latest images if found
  IF latest_upload IS NOT NULL THEN
    UPDATE clients
    SET
      id_front_image_url = latest_upload.id_front_url,
      id_back_image_url = latest_upload.id_back_url,
      license_front_image_url = latest_upload.license_front_url,
      license_back_image_url = latest_upload.license_back_url,
      updated_at = NOW()
    WHERE id = client_uuid;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON FUNCTION update_client_images_from_uploads() IS 'Trigger function to automatically update client images when uploads are completed';
COMMENT ON FUNCTION sync_existing_client_uploads() IS 'Function to sync all existing client uploads to clients table';
COMMENT ON FUNCTION get_client_images(UUID) IS 'Function to get the latest uploaded images for a specific client';
COMMENT ON FUNCTION sync_client_images(UUID) IS 'Function to manually sync images for a specific client';
COMMENT ON VIEW clients_with_images IS 'View showing clients with their latest uploaded images and status'; 