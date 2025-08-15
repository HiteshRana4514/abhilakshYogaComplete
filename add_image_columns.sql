-- Add image_url column to classes table
ALTER TABLE classes ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add image_url column to courses table  
ALTER TABLE courses ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update existing records to have empty image_url if they don't have one
UPDATE classes SET image_url = '' WHERE image_url IS NULL;
UPDATE courses SET image_url = '' WHERE image_url IS NULL;

-- Make image_url columns NOT NULL with default empty string
ALTER TABLE classes ALTER COLUMN image_url SET NOT NULL;
ALTER TABLE classes ALTER COLUMN image_url SET DEFAULT '';
ALTER TABLE courses ALTER COLUMN image_url SET NOT NULL;
ALTER TABLE courses ALTER COLUMN image_url SET DEFAULT '';

-- Verify the changes
SELECT table_name, column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name IN ('classes', 'courses') 
AND column_name = 'image_url'; 