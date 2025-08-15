import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database table names
export const TABLES = {
  CLASSES: 'classes',
  COURSES: 'courses',
  GALLERY: 'gallery',
  TESTIMONIALS: 'testimonials',
  FAQ: 'faq',
  CONTACT_QUERIES: 'contact_queries',
  INTEREST_FORMS: 'interest_forms',
  USERS: 'users',
  FAVORITES: 'favorites',
  BOOKINGS: 'bookings'
}; 