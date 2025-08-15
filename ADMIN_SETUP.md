# Admin Panel Setup Guide

## Overview
This admin panel provides comprehensive management capabilities for your yoga studio website, including:
- **Dashboard**: Overview statistics and quick actions
- **Classes Management**: Add, edit, and delete yoga classes
- **Courses Management**: Manage yoga courses and programs
- **Gallery Management**: Upload and organize studio images
- **Inquiries Management**: View and manage contact form submissions

## Prerequisites
- Supabase project with configured database
- Admin user account with proper permissions

## Database Setup

### 1. Create Required Tables
Run these SQL commands in your Supabase SQL editor:

```sql
-- Classes table
CREATE TABLE classes (
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

-- Courses table
CREATE TABLE courses (
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

-- Gallery table
CREATE TABLE gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  url TEXT NOT NULL,
  filename VARCHAR(255),
  category VARCHAR(100) DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact queries table
CREATE TABLE contact_queries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (for tracking admin users)
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin user
INSERT INTO users (email, role) VALUES ('admin@abhilakshyoga.com', 'admin');
```

### 2. Set up Storage Bucket
Create a storage bucket for gallery images:

```sql
-- In Supabase Dashboard > Storage, create a bucket named 'gallery'
-- Set it to public and configure CORS if needed
```

### 3. Configure Row Level Security (RLS)
Enable RLS and create policies:

```sql
-- Enable RLS on all tables
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your needs)
-- For now, allow all operations for authenticated users
CREATE POLICY "Allow all for authenticated users" ON classes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON courses FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON gallery FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON contact_queries FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON users FOR ALL USING (auth.role() = 'authenticated');
```

## Environment Variables
Create a `.env.local` file in your project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Admin Access Configuration

### Option 1: Email-based Admin Check
The current implementation checks if the user's email is `admin@abhilakshyoga.com`. You can modify this in `src/pages/Admin.jsx`:

```javascript
// Check if user is admin (you can customize this logic)
const isAdmin = user?.email === 'admin@abhilakshyoga.com' || user?.user_metadata?.role === 'admin';
```

### Option 2: Role-based Admin Check
For more flexible admin management, you can check the user's role from the users table:

```javascript
const [userRole, setUserRole] = useState(null);

useEffect(() => {
  if (user) {
    checkUserRole();
  }
}, [user]);

const checkUserRole = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('email', user.email)
    .single();
  
  if (data) {
    setUserRole(data.role);
  }
};

const isAdmin = userRole === 'admin';
```

## Usage

### 1. Access Admin Panel
Navigate to `/admin` in your application. You'll be redirected to login if not authenticated.

### 2. Add New Content
- **Classes**: Click "Add New Class" button and fill in the form
- **Courses**: Click "Add New Course" button and fill in the form
- **Gallery**: Click "Upload Image" button to upload new images

### 3. Edit Existing Content
Click the edit (pencil) icon next to any item to modify it.

### 4. Delete Content
Click the delete (trash) icon to remove items (implement confirmation dialog as needed).

## Features

### Dashboard
- Overview statistics
- Quick action buttons
- Recent inquiries display

### Classes Management
- Add/edit/delete yoga classes
- Set duration, instructor, price, schedule
- Configure difficulty level and max students

### Courses Management
- Manage multi-session programs
- Set pricing and duration
- Include certificate options

### Gallery Management
- Upload images with drag & drop
- Categorize images
- Add titles and descriptions

### Inquiries Management
- View contact form submissions
- Track customer inquiries
- Export data functionality

## Security Considerations

1. **Authentication**: All admin operations require user authentication
2. **Authorization**: Only admin users can access the panel
3. **Input Validation**: Forms include client-side validation
4. **File Upload**: Images are stored securely in Supabase Storage
5. **Database**: RLS policies control data access

## Customization

### Adding New Content Types
1. Create the database table
2. Add it to the `TABLES` constant in `src/utils/supabase.js`
3. Create a form component in `src/components/AdminForms.jsx`
4. Add the new tab and content rendering in `src/pages/Admin.jsx`

### Styling
The admin panel uses Tailwind CSS. You can customize colors, spacing, and layout by modifying the CSS classes.

### Notifications
Uses `react-hot-toast` for success/error notifications. Customize the toast messages and styling as needed.

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Check Supabase credentials and RLS policies
2. **Upload Failures**: Verify storage bucket configuration and permissions
3. **Database Errors**: Check table structure and RLS policies
4. **Form Validation**: Ensure all required fields are filled

### Debug Mode
Enable console logging by checking the browser console for detailed error messages.

## Support
For issues or questions about the admin panel setup, check:
1. Supabase documentation
2. React and Tailwind CSS documentation
3. Browser console for error messages
4. Network tab for API request/response details 