-- Fix FAQ table RLS policies
-- This script updates the RLS policies to properly allow admin access

-- First, drop the existing restrictive policies
DROP POLICY IF EXISTS "Admins can view all FAQs" ON faq;
DROP POLICY IF EXISTS "Admins can insert FAQs" ON faq;
DROP POLICY IF EXISTS "Admins can update FAQs" ON faq;
DROP POLICY IF EXISTS "Admins can delete FAQs" ON faq;

-- Create new, more flexible admin policies
-- Allow access to users with admin email or admin role in metadata
CREATE POLICY "Admins can view all FAQs" ON faq
    FOR SELECT USING (
        auth.jwt() ->> 'email' = 'admin@abhilakshyoga.com' OR
        auth.jwt() -> 'user_metadata' ->> 'role' = 'admin' OR
        auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    );

CREATE POLICY "Admins can insert FAQs" ON faq
    FOR INSERT WITH CHECK (
        auth.jwt() ->> 'email' = 'admin@abhilakshyoga.com' OR
        auth.jwt() -> 'user_metadata' ->> 'role' = 'admin' OR
        auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    );

CREATE POLICY "Admins can update FAQs" ON faq
    FOR UPDATE USING (
        auth.jwt() ->> 'email' = 'admin@abhilakshyoga.com' OR
        auth.jwt() -> 'user_metadata' ->> 'role' = 'admin' OR
        auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    );

CREATE POLICY "Admins can delete FAQs" ON faq
    FOR DELETE USING (
        auth.jwt() ->> 'email' = 'admin@abhilakshyoga.com' OR
        auth.jwt() -> 'user_metadata' ->> 'role' = 'admin' OR
        auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    );

-- Alternative: If you want to use the users table approach, uncomment this section:
/*
-- Drop the above policies first if you choose this approach
DROP POLICY IF EXISTS "Admins can view all FAQs" ON faq;
DROP POLICY IF EXISTS "Admins can insert FAQs" ON faq;
DROP POLICY IF EXISTS "Admins can update FAQs" ON faq;
DROP POLICY IF EXISTS "Admins can delete FAQs" ON faq;

-- Create policies that check the users table
CREATE POLICY "Admins can view all FAQs" ON faq
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.email = auth.jwt() ->> 'email' 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Admins can insert FAQs" ON faq
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.email = auth.jwt() ->> 'email' 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Admins can update FAQs" ON faq
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.email = auth.jwt() ->> 'email' 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Admins can delete FAQs" ON faq
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.email = auth.jwt() ->> 'email' 
            AND users.role = 'admin'
        )
    );
*/

-- Verify the policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'faq';
