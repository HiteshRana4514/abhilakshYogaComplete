-- Create FAQ table for yoga studio
-- This script creates the FAQ table with proper structure and RLS policies

CREATE TABLE IF NOT EXISTS faq (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100),
    order_index INTEGER DEFAULT 0,
    related_links TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE faq ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Anyone can view active FAQs" ON faq
    FOR SELECT USING (is_active = true);

-- Create policies for admin management
CREATE POLICY "Admins can view all FAQs" ON faq
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM users 
        WHERE users.email = auth.jwt() ->> 'email' 
        AND users.role = 'admin'
    ));

CREATE POLICY "Admins can insert FAQs" ON faq
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM users 
        WHERE users.email = auth.jwt() ->> 'email' 
        AND users.role = 'admin'
    ));

CREATE POLICY "Admins can update FAQs" ON faq
    FOR UPDATE USING (EXISTS (
        SELECT 1 FROM users 
        WHERE users.email = auth.jwt() ->> 'email' 
        AND users.role = 'admin'
    ));

CREATE POLICY "Admins can delete FAQs" ON faq
    FOR DELETE USING (EXISTS (
        SELECT 1 FROM users 
        WHERE users.email = auth.jwt() ->> 'email' 
        AND users.role = 'admin'
    ));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_faq_category ON faq(category);
CREATE INDEX IF NOT EXISTS idx_faq_order_index ON faq(order_index);
CREATE INDEX IF NOT EXISTS idx_faq_is_active ON faq(is_active);
CREATE INDEX IF NOT EXISTS idx_faq_created_at ON faq(created_at);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_faq_updated_at 
    BEFORE UPDATE ON faq 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample FAQ data
INSERT INTO faq (question, answer, category, order_index) VALUES
(
    'What should I bring to my first yoga class?',
    'For your first yoga class, bring comfortable, stretchy clothing that allows for movement, a yoga mat (we have some available if needed), a water bottle to stay hydrated, and a small towel for sweat. Wear clothes that won\'t restrict your movement.',
    'Getting Started',
    1
),
(
    'Do I need to be flexible to start yoga?',
    'No, you don\'t need to be flexible to start yoga! Yoga is for everyone, regardless of flexibility level. The practice will help you gradually improve your flexibility over time. Our instructors will guide you through modifications and variations suitable for your current level.',
    'Getting Started',
    2
),
(
    'What types of yoga classes do you offer?',
    'We offer a variety of yoga styles including Hatha, Vinyasa, Yin, Restorative, Power Yoga, and Gentle Yoga. Each style has different benefits and intensity levels, so you can choose what works best for your needs and experience level.',
    'Classes',
    3
),
(
    'How often should I practice yoga?',
    'For beginners, we recommend starting with 2-3 classes per week to build a foundation. As you become more comfortable, you can increase to daily practice if desired. Even practicing once a week provides benefits. Listen to your body and find a rhythm that works for you.',
    'Practice',
    4
),
(
    'What is the difference between Hatha and Vinyasa yoga?',
    'Hatha yoga focuses on holding poses for longer periods, building strength and flexibility through static postures. Vinyasa yoga is more dynamic, flowing from one pose to the next with breath coordination, creating a more cardiovascular workout.',
    'Classes',
    5
),
(
    'Can I practice yoga if I have injuries or health conditions?',
    'Yes, but please inform your instructor about any injuries or health conditions before class. Many yoga poses can be modified to accommodate different needs. We also offer therapeutic and gentle classes specifically designed for those with limitations.',
    'Health & Safety',
    6
),
(
    'Do you offer private sessions?',
    'Yes, we offer private one-on-one sessions with our experienced instructors. These sessions can be tailored to your specific needs, goals, and schedule. Contact us to discuss pricing and availability.',
    'Services',
    7
),
(
    'What is the cancellation policy for classes?',
    'We have a 24-hour cancellation policy for all classes. If you need to cancel, please do so at least 24 hours before the class start time. Late cancellations may result in a charge depending on your membership type.',
    'Policies',
    8
);

-- Add comment to document the table structure
COMMENT ON TABLE faq IS 'Frequently asked questions for yoga studio with categories and ordering';
COMMENT ON COLUMN faq.question IS 'The frequently asked question';
COMMENT ON COLUMN faq.answer IS 'The detailed answer to the question';
COMMENT ON COLUMN faq.category IS 'Category to group related questions';
COMMENT ON COLUMN faq.order_index IS 'Order for displaying questions within categories';
COMMENT ON COLUMN faq.related_links IS 'Optional related links (one per line)';
COMMENT ON COLUMN faq.is_active IS 'Whether this FAQ is currently visible to the public';
