# Dynamic Classes Setup Guide

This guide will help you set up the new dynamic classes functionality for your yoga website.

## Database Setup

### 1. Create Favorites Table

Run the SQL from `add_favorites_table.sql` in your Supabase SQL editor:

```sql
-- Add favorites table for users to save their favorite classes
CREATE TABLE IF NOT EXISTS favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, class_id)
);

-- Enable Row Level Security
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Create policies for favorites table
CREATE POLICY "Users can view their own favorites" ON favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" ON favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON favorites
    FOR DELETE USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_class_id ON favorites(class_id);
```

### 2. Create Bookings Table

Run the SQL from `add_bookings_table.sql` in your Supabase SQL editor:

```sql
-- Add bookings table for users to book yoga classes
CREATE TABLE IF NOT EXISTS bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    special_requests TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for bookings table
CREATE POLICY "Users can view their own bookings" ON bookings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookings" ON bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" ON bookings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookings" ON bookings
    FOR DELETE USING (auth.uid() = user_id);

-- Admin can view all bookings
CREATE POLICY "Admins can view all bookings" ON bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.email = auth.jwt() ->> 'email' 
            AND users.role = 'admin'
        )
    );

-- Admin can update all bookings
CREATE POLICY "Admins can update all bookings" ON bookings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.email = auth.jwt() ->> 'email' 
            AND users.role = 'admin'
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_class_id ON bookings(class_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_bookings_updated_at 
    BEFORE UPDATE ON bookings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

## Features Added

### 1. Dynamic Classes Page (`/classes`)
- **Real-time data fetching** from Supabase
- **Advanced search and filtering**:
  - Text search across class names, descriptions, and instructors
  - Filter by level (Beginner, Intermediate, Advanced)
  - Filter by instructor
  - Filter by duration
  - Filter by price range
- **Sorting options**:
  - Sort by name, price, duration, level, or date added
  - Ascending/descending order
- **Pagination** with configurable items per page
- **Responsive grid layout** with hover effects
- **Loading states** and error handling

### 2. Class Detail Page (`/class/:id`)
- **Detailed class information** display
- **Image handling** with fallback placeholders
- **Favorite functionality** (requires user authentication)
- **Share functionality** (native sharing or clipboard fallback)
- **Booking form** with:
  - Personal details (name, email, phone)
  - Preferred date and time
  - Special requests
  - Form validation
- **Responsive design** with sidebar layout
- **Loading states** and error handling

### 3. Enhanced User Experience
- **Smooth animations** using Framer Motion
- **Interactive elements** with hover effects
- **Toast notifications** for user feedback
- **Responsive design** for all screen sizes
- **Accessibility features** with proper ARIA labels

## File Structure

```
src/
├── pages/
│   ├── Classes.jsx          # Main classes listing page
│   └── ClassDetail.jsx      # Individual class detail page
├── utils/
│   └── supabase.js          # Updated with new table constants
└── App.jsx                  # Routes already configured
```

## Routes

The following routes are already configured in your App.jsx:
- `/classes` - Classes listing page
- `/class/:id` - Individual class detail page

## Dependencies

All required dependencies are already installed:
- `react-hot-toast` - For toast notifications
- `framer-motion` - For animations
- `@heroicons/react` - For icons
- `@supabase/supabase-js` - For database operations

## Testing

1. **Navigate to `/classes`** to see the dynamic classes listing
2. **Click on any class card** to view detailed information
3. **Test search and filtering** functionality
4. **Try the booking form** (requires user authentication)
5. **Test favorite functionality** (requires user authentication)

## Troubleshooting

### Common Issues:

1. **404 Error for bookings table**: Make sure you've run the SQL to create the `bookings` table
2. **Authentication errors**: Ensure users are signed in for favorites and booking features
3. **Image loading issues**: Check that class images have valid URLs in the database
4. **Filter not working**: Verify that the class data has the expected field values

### Database Requirements:

Make sure your `classes` table has these fields:
- `id` (UUID, Primary Key)
- `name` (Text)
- `description` (Text)
- `instructor` (Text)
- `duration` (Integer - minutes)
- `schedule` (Text)
- `max_students` (Integer)
- `level` (Text - Beginner, Intermediate, Advanced)
- `price` (Numeric)
- `image_url` (Text, optional)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

## Next Steps

1. **Add sample classes** through the admin panel
2. **Test the booking flow** end-to-end
3. **Customize the styling** to match your brand
4. **Add email notifications** for bookings
5. **Implement payment processing** for class bookings
6. **Add class reviews and ratings** system

## Support

If you encounter any issues, check:
1. Browser console for JavaScript errors
2. Network tab for API request failures
3. Supabase logs for database errors
4. Authentication status in the app
