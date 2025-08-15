-- Add missing columns to contact_queries table
-- This script adds the phone and subject columns that are expected by the Contact form

-- Add phone column (optional)
ALTER TABLE contact_queries 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Add subject column (required)
ALTER TABLE contact_queries 
ADD COLUMN IF NOT EXISTS subject VARCHAR(255);

-- Update existing records to have a default subject if they don't have one
UPDATE contact_queries 
SET subject = 'General Inquiry' 
WHERE subject IS NULL;

-- Make subject column NOT NULL after updating existing records
ALTER TABLE contact_queries 
ALTER COLUMN subject SET NOT NULL;

-- Add comment to document the table structure
COMMENT ON TABLE contact_queries IS 'Contact form submissions with name, email, phone, subject, and message';

-- Verify the updated structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'contact_queries' 
ORDER BY ordinal_position;
