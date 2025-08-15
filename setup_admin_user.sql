-- Setup Admin User Access
-- Run this in your Supabase SQL Editor after running the main database_setup.sql

-- Option 1: Insert your email as admin user
-- Replace 'your-email@example.com' with your actual email
INSERT INTO users (email, role) 
VALUES ('your-email@example.com', 'admin')
ON CONFLICT (email) 
DO UPDATE SET role = 'admin';

-- Option 2: Update existing user to admin role
-- Replace 'your-email@example.com' with your actual email
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- Option 3: Check current users and their roles
SELECT email, role, created_at FROM users ORDER BY created_at DESC;

-- Option 4: If you want to make all users admin (for testing only)
-- WARNING: This is not recommended for production
-- UPDATE users SET role = 'admin';

-- Verify admin user exists
SELECT 'Admin users:' as info;
SELECT email, role FROM users WHERE role = 'admin'; 