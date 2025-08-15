-- Add Learning Objectives Field to Courses Table
-- This script adds a JSON field to store learning objectives for each course
-- Run this in your Supabase SQL Editor

-- Add the learning_objectives column to the courses table
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS learning_objectives JSONB DEFAULT '[]'::jsonb;

-- Add a comment to document the field
COMMENT ON COLUMN courses.learning_objectives IS 'Array of learning objectives for the course (JSON format)';

-- Update existing courses with some default learning objectives
UPDATE courses 
SET learning_objectives = '[
  "Comprehensive yoga teacher training",
  "Hands-on practical experience", 
  "Anatomy and physiology knowledge",
  "Teaching methodology and techniques"
]'::jsonb
WHERE learning_objectives IS NULL OR learning_objectives = '[]'::jsonb;

-- Verify the column was added
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'courses' 
AND column_name = 'learning_objectives';

-- Show sample data
SELECT id, name, learning_objectives 
FROM courses 
LIMIT 3;
