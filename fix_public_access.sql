-- Fix Public Access for Client-Side Pages
-- This script adds RLS policies to allow public (anonymous) users to read data
-- Run this in your Supabase SQL Editor

-- 1. Add public read access for Classes table
DROP POLICY IF EXISTS "Allow public read access" ON classes;
CREATE POLICY "Allow public read access" ON classes
    FOR SELECT USING (true); -- Allow anyone to read classes

-- 2. Add public read access for Courses table  
DROP POLICY IF EXISTS "Allow public read access" ON courses;
CREATE POLICY "Allow public read access" ON courses
    FOR SELECT USING (true); -- Allow anyone to read courses

-- 3. Add public read access for Gallery table
DROP POLICY IF EXISTS "Allow public read access" ON gallery;
CREATE POLICY "Allow public read access" ON gallery
    FOR SELECT USING (true); -- Allow anyone to read gallery

-- 4. Add public read access for Testimonials table
DROP POLICY IF EXISTS "Allow public read access" ON testimonials;
CREATE POLICY "Allow public read access" ON testimonials
    FOR SELECT USING (true); -- Allow anyone to read testimonials

-- 5. Add public read access for FAQ table
DROP POLICY IF EXISTS "Allow public read access" ON faq;
CREATE POLICY "Allow public read access" ON faq
    FOR SELECT USING (true); -- Allow anyone to read FAQs

-- 6. Keep existing admin policies for write operations
-- (These should already exist from your previous setup)

-- 7. Verify the policies are created
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    cmd, 
    qual
FROM pg_policies 
WHERE tablename IN ('classes', 'courses', 'gallery', 'testimonials', 'faq')
ORDER BY tablename, policyname;

-- Note: After running this script, public pages should be able to fetch data
-- The admin panel will still work as it uses authenticated access
