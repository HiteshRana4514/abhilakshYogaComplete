# Quick Admin Access Fix

## The Problem
You're getting "Access Denied" even after logging in with correct credentials.

## Why This Happens
The admin panel checks for admin privileges in multiple ways:
1. **Email check**: `admin@abhilakshyoga.com`
2. **User metadata**: Role set during signup
3. **Database check**: Role stored in the `users` table

## Quick Solutions

### Solution 1: Use the Default Admin Email
1. Sign up/login with email: `admin@abhilakshyoga.com`
2. This email is hardcoded as admin in the system

### Solution 2: Set Your Email as Admin in Database
1. Go to Supabase Dashboard > SQL Editor
2. Run this command (replace with your email):
```sql
INSERT INTO users (email, role) 
VALUES ('your-email@example.com', 'admin')
ON CONFLICT (email) 
DO UPDATE SET role = 'admin';
```

### Solution 3: Check Current User Status
1. Open browser console (F12) when on admin page
2. Look for logs showing user object and admin check
3. The logs will show exactly what's happening

### Solution 4: Temporary Bypass (Development Only)
If you want to test quickly, you can temporarily modify the admin check in `src/pages/Admin.jsx`:

```javascript
// Change this line temporarily for testing
const isAdmin = true; // WARNING: Only for development!
```

## Step-by-Step Fix

1. **First, run the database setup**:
   - Copy `database_setup.sql` content
   - Run it in Supabase SQL Editor

2. **Set up admin user**:
   - Copy `setup_admin_user.sql` content
   - Replace `your-email@example.com` with your actual email
   - Run it in Supabase SQL Editor

3. **Create storage bucket**:
   - Go to Supabase Dashboard > Storage
   - Create bucket named `gallery`
   - Set to public

4. **Test admin access**:
   - Sign in with your email
   - Navigate to `/admin`
   - Check browser console for debug logs

## Debug Information
The admin panel now logs detailed information to help diagnose issues:
- User object structure
- Email and metadata
- Admin check results
- Database query results

## Common Issues

### Issue: "Access Denied" after login
**Cause**: User not found in `users` table or role not set to 'admin'
**Fix**: Run the setup_admin_user.sql script

### Issue: Database connection errors
**Cause**: Tables not created or RLS policies not set
**Fix**: Run the database_setup.sql script first

### Issue: Storage upload fails
**Cause**: Gallery bucket not created
**Fix**: Create storage bucket named 'gallery' in Supabase

## Testing Admin Access

1. **Check browser console** for debug logs
2. **Verify database** has your user with admin role
3. **Test with default admin email**: `admin@abhilakshyoga.com`

## Still Having Issues?

1. Check browser console logs
2. Verify Supabase connection in `.env.local`
3. Ensure all SQL scripts ran successfully
4. Check if RLS policies are working correctly

The debug logs will show exactly what's happening with your user authentication and admin check! 