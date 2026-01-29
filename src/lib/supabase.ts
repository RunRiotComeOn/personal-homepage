import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// You need to replace these with your actual Supabase project credentials
// Get them from: https://app.supabase.com/project/_/settings/api
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface VisitorLocation {
  id?: number;
  city: string;
  country: string;
  country_code: string;
  latitude: number;
  longitude: number;
  region?: string;
  timezone?: string;
  ip_hash?: string; // Hashed IP for privacy
  user_agent?: string;
  visited_at?: string;
  visit_count?: number;
}
