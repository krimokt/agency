-- Create clients table with all fields from Add New Client form
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    nationality VARCHAR(100) DEFAULT 'Moroccan',
    date_of_birth DATE,
    phone VARCHAR(20),
    address TEXT,
    
    -- ID Document Information
    id_number VARCHAR(50),
    id_issue_date DATE,
    id_expiry_date DATE,
    id_front_image_url TEXT,
    id_back_image_url TEXT,
    
    -- Driving License Information
    license_number VARCHAR(50),
    license_issue_date DATE,
    license_expiry_date DATE,
    license_categories TEXT[], -- Array of license categories
    license_front_image_url TEXT,
    license_back_image_url TEXT,
    
    -- Emergency Contact Information
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(100),
    
    -- Additional Information
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_id_number ON clients(id_number);
CREATE INDEX IF NOT EXISTS idx_clients_license_number ON clients(license_number);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clients_updated_at 
    BEFORE UPDATE ON clients 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view all clients
CREATE POLICY "Authenticated users can view clients" ON clients
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Authenticated users can insert clients
CREATE POLICY "Authenticated users can insert clients" ON clients
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Authenticated users can update clients
CREATE POLICY "Authenticated users can update clients" ON clients
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy: Authenticated users can delete clients
CREATE POLICY "Authenticated users can delete clients" ON clients
    FOR DELETE USING (auth.role() = 'authenticated');

-- Add comments for documentation
COMMENT ON TABLE clients IS 'Stores all client information including personal details, ID documents, and driving licenses';
COMMENT ON COLUMN clients.id IS 'Unique identifier for the client';
COMMENT ON COLUMN clients.first_name IS 'Client first name';
COMMENT ON COLUMN clients.last_name IS 'Client last name';
COMMENT ON COLUMN clients.email IS 'Client email address (unique)';
COMMENT ON COLUMN clients.gender IS 'Client gender (male, female, other)';
COMMENT ON COLUMN clients.nationality IS 'Client nationality (default: Moroccan)';
COMMENT ON COLUMN clients.date_of_birth IS 'Client date of birth';
COMMENT ON COLUMN clients.phone IS 'Client phone number';
COMMENT ON COLUMN clients.address IS 'Client address';
COMMENT ON COLUMN clients.id_number IS 'ID document number';
COMMENT ON COLUMN clients.id_issue_date IS 'ID document issue date';
COMMENT ON COLUMN clients.id_expiry_date IS 'ID document expiry date';
COMMENT ON COLUMN clients.id_front_image_url IS 'URL to ID front image';
COMMENT ON COLUMN clients.id_back_image_url IS 'URL to ID back image';
COMMENT ON COLUMN clients.license_number IS 'Driving license number';
COMMENT ON COLUMN clients.license_issue_date IS 'Driving license issue date';
COMMENT ON COLUMN clients.license_expiry_date IS 'Driving license expiry date';
COMMENT ON COLUMN clients.license_categories IS 'Array of driving license categories';
COMMENT ON COLUMN clients.license_front_image_url IS 'URL to license front image';
COMMENT ON COLUMN clients.license_back_image_url IS 'URL to license back image';
COMMENT ON COLUMN clients.emergency_contact_name IS 'Emergency contact name';
COMMENT ON COLUMN clients.emergency_contact_phone IS 'Emergency contact phone';
COMMENT ON COLUMN clients.emergency_contact_relationship IS 'Relationship to emergency contact';
COMMENT ON COLUMN clients.notes IS 'Additional notes about the client';
COMMENT ON COLUMN clients.status IS 'Client status (active, inactive, archived)';
COMMENT ON COLUMN clients.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN clients.updated_at IS 'Record last update timestamp'; 