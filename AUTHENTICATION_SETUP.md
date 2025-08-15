# Supabase Authentication Setup Guide

## 🎯 **What's Been Set Up**

### 1. **Login System** (`/login`)
- ✅ Supabase authentication integration
- ✅ Form validation with react-hook-form
- ✅ Beautiful UI with Tailwind CSS
- ✅ Error handling and success messages

### 2. **Signup System** (`/signup`)
- ✅ Create new admin accounts
- ✅ Automatic role assignment
- ✅ Database integration

### 3. **Admin Panel** (`/admin`)
- ✅ Enhanced authentication checks
- ✅ Multiple admin verification methods
- ✅ Debug logging for troubleshooting

### 4. **Auth Test Page** (`/auth-test`)
- ✅ Debug authentication state
- ✅ Test admin access logic
- ✅ View user metadata and database data

## 🚀 **Quick Start Steps**

### **Step 1: Database Setup**
1. Go to Supabase Dashboard > SQL Editor
2. Run the `database_setup.sql` script
3. This creates all necessary tables and RLS policies

### **Step 2: Create Admin User**
1. Go to Supabase Dashboard > Authentication > Users
2. Click "Add User" or use the signup page
3. Set email and password
4. **Important**: Set user metadata role to 'admin'

### **Step 3: Set User Role in Database**
Run this SQL command (replace with your email):
```sql
INSERT INTO users (email, role) 
VALUES ('your-email@example.com', 'admin')
ON CONFLICT (email) 
DO UPDATE SET role = 'admin';
```

### **Step 4: Test Authentication**
1. Navigate to `/login`
2. Sign in with your credentials
3. Check `/auth-test` to verify authentication state
4. Try accessing `/admin`

## 🔧 **Admin Access Methods**

The system checks admin access in **4 ways** (any one grants access):

### **Method 1: Hardcoded Email**
```javascript
user.email === 'admin@abhilakshyoga.com'
```

### **Method 2: User Metadata Role**
```javascript
user.user_metadata.role === 'admin'
```

### **Method 3: App Metadata Role**
```javascript
user.app_metadata.role === 'admin'
```

### **Method 4: Database Role**
```javascript
// Checks users table for role = 'admin'
```

## 🛠️ **Setting Up Admin User**

### **Option A: Through Supabase Dashboard**
1. Go to Supabase Dashboard > Authentication > Users
2. Click "Add User"
3. Enter email and password
4. In "User Metadata", add: `{"role": "admin"}`
5. Save the user

### **Option B: Through Signup Page**
1. Navigate to `/signup`
2. Fill out the form
3. The system automatically sets role to 'admin'
4. Check your email for verification

### **Option C: Update Existing User**
1. Go to Supabase Dashboard > Authentication > Users
2. Find your user
3. Click "Edit"
4. Add to User Metadata: `{"role": "admin"}`

## 🔍 **Debugging Authentication Issues**

### **Use the Auth Test Page**
Navigate to `/auth-test` to see:
- Authentication state
- User metadata
- Database user data
- Admin access test results

### **Check Browser Console**
The admin panel logs detailed information:
- User object structure
- Email and metadata
- Admin check results
- Database query results

### **Common Issues & Solutions**

#### **Issue: "Access Denied" after login**
**Solution**: Set user role to 'admin' in one of these ways:
1. Update user metadata in Supabase Dashboard
2. Run the SQL command to update database
3. Use the hardcoded admin email: `admin@abhilakshyoga.com`

#### **Issue: User not found in database**
**Solution**: Run the database setup script first:
```sql
-- Run database_setup.sql in Supabase SQL Editor
```

#### **Issue: RLS policies blocking access**
**Solution**: Ensure RLS policies are set correctly:
```sql
-- Check if policies exist
SELECT * FROM pg_policies WHERE tablename = 'users';
```

## 📱 **Testing the System**

### **Test Flow**
1. **Signup**: `/signup` - Create new admin account
2. **Login**: `/login` - Sign in with credentials
3. **Auth Test**: `/auth-test` - Verify authentication state
4. **Admin Access**: `/admin` - Access admin panel

### **Test Credentials**
- **Default Admin**: `admin@abhilakshyoga.com` (if you set this up)
- **Your Email**: Use the email you configured as admin

## 🔐 **Security Considerations**

### **Production Security**
1. **Remove hardcoded admin email** for production
2. **Use only database role checks** for admin access
3. **Implement proper password policies**
4. **Enable email verification**

### **Development Security**
1. **Use strong passwords** even in development
2. **Don't commit real credentials** to version control
3. **Test with limited permissions** first

## 🚨 **Troubleshooting Checklist**

- [ ] Database tables created (`database_setup.sql`)
- [ ] User exists in Supabase Authentication
- [ ] User has admin role in metadata or database
- [ ] RLS policies are configured correctly
- [ ] Supabase credentials in `.env.local` are correct
- [ ] Browser console shows no errors
- [ ] Auth test page shows correct authentication state

## 📞 **Still Having Issues?**

1. **Check the auth test page** (`/auth-test`) for detailed state
2. **Review browser console** for error messages
3. **Verify Supabase connection** in network tab
4. **Check database tables** exist and have data
5. **Ensure user has admin role** in multiple places

## 🎉 **Success Indicators**

When everything is working correctly:
- ✅ Login page accepts credentials
- ✅ User is redirected to admin panel
- ✅ Admin panel shows dashboard
- ✅ No "Access Denied" messages
- ✅ Console logs show successful admin check

The authentication system is now fully integrated with Supabase and should work seamlessly once you complete the setup steps! 