-- Admin Panel Database Setup Script
-- Run this in your Supabase SQL Editor

-- 1. Create Classes table
CREATE TABLE IF NOT EXISTS classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration VARCHAR(100),
  instructor VARCHAR(255),
  price DECIMAL(10,2),
  schedule TEXT,
  max_students INTEGER,
  level VARCHAR(50) DEFAULT 'beginner',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration VARCHAR(100),
  price DECIMAL(10,2),
  instructor VARCHAR(255),
  level VARCHAR(50) DEFAULT 'beginner',
  modules TEXT,
  certificate BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Gallery table
CREATE TABLE IF NOT EXISTS gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  url TEXT NOT NULL,
  filename VARCHAR(255),
  category VARCHAR(100) DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Contact queries table
CREATE TABLE IF NOT EXISTS contact_queries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Insert default admin user
INSERT INTO users (email, role) 
VALUES ('admin@abhilakshyoga.com', 'admin')
ON CONFLICT (email) DO NOTHING;

-- 7. Enable Row Level Security
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies for authenticated users
-- Classes policies
DROP POLICY IF EXISTS "Allow all for authenticated users" ON classes;
CREATE POLICY "Allow all for authenticated users" ON classes 
FOR ALL USING (auth.role() = 'authenticated');

-- Courses policies
DROP POLICY IF EXISTS "Allow all for authenticated users" ON courses;
CREATE POLICY "Allow all for authenticated users" ON courses 
FOR ALL USING (auth.role() = 'authenticated');

-- Gallery policies
DROP POLICY IF EXISTS "Allow all for authenticated users" ON gallery;
CREATE POLICY "Allow all for authenticated users" ON gallery 
FOR ALL USING (auth.role() = 'authenticated');

-- Contact queries policies
DROP POLICY IF EXISTS "Allow all for authenticated users" ON contact_queries;
CREATE POLICY "Allow all for authenticated users" ON contact_queries 
FOR ALL USING (auth.role() = 'authenticated');

-- Users policies
DROP POLICY IF EXISTS "Allow all for authenticated users" ON users;
CREATE POLICY "Allow all for authenticated users" ON users 
FOR ALL USING (auth.role() = 'authenticated');

-- 9. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_classes_created_at ON classes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_created_at ON gallery(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_queries_created_at ON contact_queries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 10. Insert sample data (optional)
INSERT INTO classes (name, description, duration, instructor, price, schedule, max_students, level) VALUES
('Hatha Yoga Basics', 'Perfect for beginners, this class focuses on basic yoga postures and breathing techniques.', '60 minutes', 'Sarah Johnson', 25.00, 'Monday, Wednesday, Friday 6:00 PM', 15, 'beginner'),
('Vinyasa Flow', 'Dynamic flow class that synchronizes breath with movement for a challenging workout.', '75 minutes', 'Michael Chen', 30.00, 'Tuesday, Thursday 7:00 PM', 20, 'intermediate'),
('Restorative Yoga', 'Gentle, relaxing class using props to support the body in restful poses.', '90 minutes', 'Emma Davis', 35.00, 'Sunday 5:00 PM', 12, 'all-levels');

INSERT INTO courses (name, description, duration, price, instructor, level, modules, certificate) VALUES
('Yoga Teacher Training', 'Comprehensive 200-hour yoga teacher training program covering all aspects of yoga instruction.', '8 weeks', 2500.00, 'Dr. Lisa Patel', 'advanced', 'Anatomy & Physiology\nTeaching Methodology\nYoga Philosophy\nPracticum', true),
('Mindfulness & Meditation', 'Learn various meditation techniques and mindfulness practices for daily life.', '4 weeks', 299.00, 'James Wilson', 'beginner', 'Breathing Techniques\nMindfulness Practices\nMeditation Methods\nDaily Integration', false);

-- 11. Create storage bucket for gallery images
-- Note: You need to create this manually in Supabase Dashboard > Storage
-- Bucket name: 'gallery'
-- Set to public
-- Configure CORS if needed

-- 12. Verify setup
SELECT 'Setup completed successfully!' as status;
SELECT 'Classes count:' as info, COUNT(*) as count FROM classes;
SELECT 'Courses count:' as info, COUNT(*) as count FROM courses;
SELECT 'Users count:' as info, COUNT(*) as count FROM users; 