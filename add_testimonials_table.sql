-- Add Testimonials Table
-- Run this in your Supabase SQL Editor

-- Create testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) DEFAULT 'Student',
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) DEFAULT 5,
  image_url TEXT,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for authenticated users
DROP POLICY IF EXISTS "Allow all for authenticated users" ON testimonials;
CREATE POLICY "Allow all for authenticated users" ON testimonials 
FOR ALL USING (auth.role() = 'authenticated');

-- Insert some sample testimonials
INSERT INTO testimonials (name, role, content, rating, image_url, featured) VALUES
('Sarah Johnson', 'Student', 'Abhilaksh Yoga has transformed my life. The instructors are amazing and the atmosphere is so peaceful.', 5, 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face', true),
('Michael Chen', 'Student', 'I''ve been practicing here for 2 years and the progress I''ve made is incredible. Highly recommended!', 5, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face', true),
('Priya Sharma', 'Student', 'The best yoga studio I''ve ever been to. The teachers are knowledgeable and caring.', 5, 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face', true),
('David Wilson', 'Student', 'Amazing experience! The classes are well-structured and the instructors are very supportive.', 5, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', false),
('Emma Davis', 'Student', 'I love the variety of classes offered. There''s something for every level and interest.', 5, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face', false),
('Rajesh Kumar', 'Student', 'The meditation sessions have helped me find inner peace. Thank you Abhilaksh Yoga!', 5, 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face', false);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials(featured);
CREATE INDEX IF NOT EXISTS idx_testimonials_created_at ON testimonials(created_at);

-- Verify the table was created
SELECT table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'testimonials' 
ORDER BY ordinal_position; 