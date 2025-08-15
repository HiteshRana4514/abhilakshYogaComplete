-- Update favorites table to support both classes and courses
-- This script modifies the existing favorites table to handle both content types

-- First, add new columns to the favorites table
ALTER TABLE favorites 
ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS content_type VARCHAR(20) DEFAULT 'class' CHECK (content_type IN ('class', 'course'));

-- Update existing records to have content_type = 'class'
UPDATE favorites 
SET content_type = 'class' 
WHERE content_type IS NULL;

-- Make content_type NOT NULL after updating existing records
ALTER TABLE favorites 
ALTER COLUMN content_type SET NOT NULL;

-- Add constraint to ensure either class_id or course_id is set, but not both
ALTER TABLE favorites 
ADD CONSTRAINT check_content_reference 
CHECK (
    (class_id IS NOT NULL AND course_id IS NULL AND content_type = 'class') OR
    (course_id IS NOT NULL AND class_id IS NULL AND content_type = 'course')
);

-- Update the unique constraint to handle both types
DROP INDEX IF EXISTS idx_favorites_class_id;
ALTER TABLE favorites DROP CONSTRAINT IF EXISTS favorites_user_id_class_id_key;

-- Create new unique constraints
CREATE UNIQUE INDEX idx_favorites_user_class ON favorites(user_id, class_id) WHERE class_id IS NOT NULL;
CREATE UNIQUE INDEX idx_favorites_user_course ON favorites(user_id, course_id) WHERE course_id IS NOT NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_favorites_course_id ON favorites(course_id);
CREATE INDEX IF NOT EXISTS idx_favorites_content_type ON favorites(content_type);

-- Update the table comment
COMMENT ON TABLE favorites IS 'User favorites for both classes and courses';

-- Update RLS policies to work with new structure
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can insert their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON favorites;

-- Create updated policies
CREATE POLICY "Users can view their own favorites" ON favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" ON favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON favorites
    FOR DELETE USING (auth.uid() = user_id);

-- Add a function to help with favorites management
CREATE OR REPLACE FUNCTION add_favorite(
    p_user_id UUID,
    p_content_type VARCHAR(20),
    p_content_id UUID
)
RETURNS VOID AS $$
BEGIN
    -- Remove any existing favorite of the same type
    IF p_content_type = 'class' THEN
        DELETE FROM favorites WHERE user_id = p_user_id AND class_id = p_content_id;
        INSERT INTO favorites (user_id, class_id, content_type) VALUES (p_user_id, p_content_id, 'class');
    ELSIF p_content_type = 'course' THEN
        DELETE FROM favorites WHERE user_id = p_user_id AND course_id = p_content_id;
        INSERT INTO favorites (user_id, course_id, content_type) VALUES (p_user_id, p_content_id, 'course');
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION add_favorite(UUID, VARCHAR(20), UUID) TO authenticated;
