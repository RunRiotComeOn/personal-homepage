# Visitor Map Setup Guide

This guide will help you set up the Visitor Map feature, which tracks and displays visitors to your website in real-time.

## Features

- Real-time visitor tracking with geolocation
- Interactive map showing visitor locations (city-level for privacy)
- Statistics: total visits, unique locations, countries
- Automatic IP hashing for privacy protection
- City-level aggregation to avoid overlapping markers

## Prerequisites

- A Supabase account (free tier is sufficient)
- Node.js and npm installed

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/log in
2. Click "New Project"
3. Fill in:
   - **Project name**: e.g., "personal-homepage"
   - **Database password**: Create a strong password (save it!)
   - **Region**: Choose the closest region to your visitors
4. Click "Create new project" and wait for setup to complete (~2 minutes)

## Step 2: Create the Database Table

1. In your Supabase project dashboard, go to **SQL Editor** (left sidebar)
2. Click "New Query"
3. Copy and paste this SQL code:

```sql
-- Create the visitor_locations table
CREATE TABLE visitor_locations (
  id BIGSERIAL PRIMARY KEY,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  country_code TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  region TEXT,
  timezone TEXT,
  ip_hash TEXT,
  user_agent TEXT,
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  visit_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on ip_hash for faster lookups
CREATE INDEX idx_visitor_locations_ip_hash ON visitor_locations(ip_hash);

-- Create an index on visited_at for sorting
CREATE INDEX idx_visitor_locations_visited_at ON visitor_locations(visited_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE visitor_locations ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow anyone to read visitor locations
CREATE POLICY "Allow public read access" ON visitor_locations
  FOR SELECT
  USING (true);

-- Create a policy to allow anyone to insert visitor locations
CREATE POLICY "Allow public insert access" ON visitor_locations
  FOR INSERT
  WITH CHECK (true);

-- Create a policy to allow anyone to update their own visitor location
CREATE POLICY "Allow public update access" ON visitor_locations
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
```

4. Click "Run" to execute the query
5. You should see "Success. No rows returned" message

## Step 3: Get Your Supabase Credentials

1. In your Supabase dashboard, go to **Settings** → **API** (left sidebar)
2. You'll see two important values:
   - **Project URL**: Something like `https://xxxxx.supabase.co`
   - **anon/public key**: A long string starting with `eyJ...`
3. Keep this page open for the next step

## Step 4: Configure Environment Variables

1. In your project root, create a `.env` file (if it doesn't exist)
2. Add your Supabase credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Replace the values with your actual credentials from Step 3
4. **Important**: Never commit your `.env` file to Git. It's already in `.gitignore`

## Step 5: Test the Feature

1. Start your development server:
```bash
npm run dev
```

2. Open your website in a browser
3. Scroll to the Visitor Map section
4. You should see:
   - A loading spinner initially
   - Then a map with your current location marked
   - Statistics showing at least 1 visit

## Step 6: Verify Data in Supabase

1. Go to your Supabase dashboard
2. Click **Table Editor** → **visitor_locations**
3. You should see at least one row with your visit data
4. Check that sensitive data like IP is hashed (not showing your real IP)

## Troubleshooting

### Map shows "Failed to load visitor data"

**Possible causes:**
- Supabase credentials not set correctly in `.env`
- Database table not created
- Network/firewall blocking requests to Supabase

**Solutions:**
1. Check browser console (F12) for error messages
2. Verify `.env` file exists and has correct values
3. Make sure you ran the SQL query in Step 2
4. Try restarting your dev server after changing `.env`

### Geolocation not working

**Possible causes:**
- IP geolocation API rate limit reached
- Localhost/private IP address (won't have location data)

**Solutions:**
1. The app uses ipapi.co which has a rate limit (1000/day for free)
2. If developing locally, the map will show generic "Unknown" locations
3. Test on a deployed site for accurate geolocation

### Map tiles not loading

**Possible causes:**
- Network issue
- OpenStreetMap servers down (rare)

**Solutions:**
1. Check your internet connection
2. Wait a few minutes and refresh
3. Check browser console for errors

### TypeScript errors about Leaflet

**Solution:**
- Make sure `@types/leaflet` is installed: `npm install --save-dev @types/leaflet`

## Privacy & Compliance

This implementation is privacy-focused:
- **IP addresses are hashed**: Only a SHA-256 hash is stored, not the real IP
- **City-level only**: Only city, country, and approximate coordinates are shown
- **No personal data**: No names, emails, or tracking cookies
- **Aggregated markers**: Multiple visits from the same city are grouped together

However, you should:
- Add a privacy policy mentioning visitor tracking
- Consider adding a cookie/tracking consent banner if required in your jurisdiction
- Comply with GDPR, CCPA, or other applicable privacy laws

## API Rate Limits

The free tier limits:
- **ipapi.co**: 1,000 requests/day
- **Supabase**: 500 MB database, 2 GB bandwidth, 50 MB file storage
- **OpenStreetMap tiles**: No hard limit but be respectful

For a personal homepage, these limits are more than sufficient.

## Optional: Monitoring

To monitor your visitor data:
1. Go to Supabase dashboard → **Table Editor** → **visitor_locations**
2. You can:
   - View all visitors
   - Sort by country, city, date
   - Export data as CSV
   - Run custom SQL queries

## Support

If you encounter issues:
1. Check browser console (F12) for errors
2. Check Supabase logs: Dashboard → **Logs**
3. Review the implementation in:
   - `src/lib/supabase.ts` - Configuration
   - `src/services/geolocation.ts` - Location fetching
   - `src/services/visitorService.ts` - Database operations
   - `src/hooks/useVisitorTracking.ts` - React Hook
   - `src/sections/VisitorMap.tsx` - UI Component

## Next Steps

- Customize the map appearance in `VisitorMap.tsx`
- Adjust marker sizes and colors
- Add more statistics or charts
- Set up alerts for visitor milestones (100, 1000, etc.)
- Consider adding a public "visitor count" badge to your homepage

Enjoy tracking your global reach!
