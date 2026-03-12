-- Create Site Content table for CMS
CREATE TABLE IF NOT EXISTS site_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page VARCHAR(100) NOT NULL,
  section VARCHAR(100) NOT NULL,
  key VARCHAR(100) NOT NULL,
  value JSONB NOT NULL,
  type VARCHAR(50) DEFAULT 'text', -- 'text', 'html', 'image_url', 'json', 'number'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(page, section, key)
);

-- Enable Row Level Security
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read access for site content" ON site_content
  FOR SELECT USING (true);

-- Admin only write access
CREATE POLICY "Admin write access for site content" ON site_content
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.email = auth.jwt() ->> 'email' 
      AND users.role = 'admin'
    )
  );

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_site_content_page_section ON site_content(page, section);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_site_content_updated_at ON site_content;
CREATE TRIGGER update_site_content_updated_at 
    BEFORE UPDATE ON site_content 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Seed Initial Data

-- Home Page
INSERT INTO site_content (page, section, key, value, type) VALUES
('home', 'hero', 'title', '"Discover Your Inner Peace"', 'text'),
('home', 'hero', 'subtitle', '"Join Abhilaksh Yoga and embark on a transformative journey to physical, mental, and spiritual well-being. Our expert instructors guide you through authentic yoga practices in a serene environment."', 'text'),
('home', 'cta', 'title', '"Ready to Start Your Yoga Journey?"', 'text'),
('home', 'cta', 'subtitle', '"Join our community and experience the transformative power of yoga. Whether you''re a beginner or advanced practitioner, we have something for everyone."', 'text'),
('home', 'hero', 'stats', '[
  {"label": "Classes", "value": "20+", "key": "totalClasses"},
  {"label": "Courses", "value": "10+", "key": "totalCourses"},
  {"label": "Students", "value": "500+", "key": "totalStudents"}
]', 'json')
ON CONFLICT (page, section, key) DO UPDATE SET value = EXCLUDED.value;

-- About Page
INSERT INTO site_content (page, section, key, value, type) VALUES
('about', 'hero', 'title', '"About Abhilaksh Yoga"', 'text'),
('about', 'hero', 'subtitle', '"Discover our journey, philosophy, and the dedicated team behind your transformative yoga experience."', 'text'),
('about', 'story', 'title', '"Our Story"', 'text'),
('about', 'story', 'paragraphs', '[
  "Abhilaksh Yoga was born from a deep passion for authentic yoga practice and a desire to share its transformative benefits with the community. Founded in 2010, we started as a small studio with a big vision.",
  "Over the years, we''ve grown into a thriving community of yoga practitioners, teachers, and wellness enthusiasts. Our commitment to traditional yoga principles combined with modern teaching methods has made us a trusted name in the wellness industry.",
  "Today, we continue to inspire and guide thousands of students on their journey to physical, mental, and spiritual well-being, maintaining the same dedication to excellence that inspired our founding."
]', 'json'),
('about', 'team', 'members', '[
  {
    "name": "Priya Sharma",
    "role": "Lead Instructor & Founder",
    "bio": "Certified yoga instructor with 15+ years of experience in Hatha and Vinyasa yoga.",
    "image": "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face",
    "certifications": ["RYT-500", "Hatha Yoga", "Meditation"]
  },
  {
    "name": "Rajesh Kumar",
    "role": "Senior Instructor",
    "bio": "Specializes in advanced asanas and therapeutic yoga practices.",
    "image": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
    "certifications": ["RYT-200", "Therapeutic Yoga", "Pranayama"]
  },
  {
    "name": "Anita Patel",
    "role": "Meditation Specialist",
    "bio": "Expert in mindfulness meditation and stress management techniques.",
    "image": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face",
    "certifications": ["Meditation Teacher", "Mindfulness", "Stress Management"]
  }
]', 'json'),
('about', 'timeline', 'items', '[
  {
    "year": "2010",
    "title": "Foundation",
    "description": "Abhilaksh Yoga was founded with a vision to make authentic yoga accessible to everyone."
  },
  {
    "year": "2015",
    "title": "First Teacher Training",
    "description": "Launched our first 200-hour teacher training program, graduating 15 certified instructors."
  },
  {
    "year": "2018",
    "title": "Community Growth",
    "description": "Reached 1000+ students and expanded our studio space to accommodate growing demand."
  },
  {
    "year": "2020",
    "title": "Digital Transformation",
    "description": "Introduced online classes and virtual teacher training programs during the pandemic."
  },
  {
    "year": "2023",
    "title": "Excellence Award",
    "description": "Received the \"Best Yoga Studio\" award from the National Wellness Council."
  }
]', 'json')
ON CONFLICT (page, section, key) DO UPDATE SET value = EXCLUDED.value;

-- Global / Footer
INSERT INTO site_content (page, section, key, value, type) VALUES
('global', 'contact', 'phone', '["+91 98765 43210", "+91 98765 43211"]', 'json'),
('global', 'contact', 'email', '["info@abhilakshyoga.com", "support@abhilakshyoga.com"]', 'json'),
('global', 'contact', 'address', '["123 Yoga Street, Wellness City", "State - 123456, India"]', 'json'),
('global', 'social', 'links', '[
  {"name": "Facebook", "href": "#", "icon": "Facebook"},
  {"name": "Instagram", "href": "#", "icon": "Instagram"},
  {"name": "YouTube", "href": "#", "icon": "Youtube"},
  {"name": "WhatsApp", "href": "#", "icon": "MessageSquare"}
]', 'json'),
('global', 'branding', 'site_name', '"Abhilaksh Yoga"', 'text'),
('global', 'branding', 'tagline', '"Path to Vitality"', 'text')
ON CONFLICT (page, section, key) DO UPDATE SET value = EXCLUDED.value;
