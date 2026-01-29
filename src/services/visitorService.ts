import { supabase } from '../lib/supabase';
import type { VisitorLocation } from '../lib/supabase';

const TABLE_NAME = 'visitor_locations';

export class VisitorService {
  // Save or update visitor location
  static async saveVisitorLocation(location: VisitorLocation): Promise<boolean> {
    try {
      if (!location.ip_hash) {
        console.warn('No IP hash provided, skipping save');
        return false;
      }

      // Check if this IP has visited before (in the last 24 hours)
      const { data: existingVisit, error: fetchError } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('ip_hash', location.ip_hash)
        .gte('visited_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 means no rows returned, which is fine
        console.error('Error checking existing visit:', fetchError);
      }

      if (existingVisit) {
        // Update visit count and last visited time
        const { error: updateError } = await supabase
          .from(TABLE_NAME)
          .update({
            visited_at: location.visited_at,
            visit_count: (existingVisit.visit_count || 1) + 1,
          })
          .eq('id', existingVisit.id);

        if (updateError) {
          console.error('Error updating visitor:', updateError);
          return false;
        }
      } else {
        // Insert new visitor
        const { error: insertError } = await supabase
          .from(TABLE_NAME)
          .insert([{ ...location, visit_count: 1 }]);

        if (insertError) {
          console.error('Error inserting visitor:', insertError);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error saving visitor location:', error);
      return false;
    }
  }

  // Get all unique visitor locations
  static async getAllVisitorLocations(): Promise<VisitorLocation[]> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .order('visited_at', { ascending: false });

      if (error) {
        console.error('Error fetching visitor locations:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching visitor locations:', error);
      return [];
    }
  }

  // Get visitor statistics
  static async getVisitorStats(): Promise<{
    totalVisits: number;
    uniqueLocations: number;
    countries: string[];
    recentVisitors: VisitorLocation[];
  }> {
    try {
      const locations = await this.getAllVisitorLocations();

      const uniqueCountries = [...new Set(locations.map(l => l.country))];
      const totalVisits = locations.reduce((sum, l) => sum + (l.visit_count || 1), 0);

      return {
        totalVisits,
        uniqueLocations: locations.length,
        countries: uniqueCountries,
        recentVisitors: locations.slice(0, 10),
      };
    } catch (error) {
      console.error('Error fetching visitor stats:', error);
      return {
        totalVisits: 0,
        uniqueLocations: 0,
        countries: [],
        recentVisitors: [],
      };
    }
  }

  // Group visitors by city to avoid overlapping markers
  static groupVisitorsByCity(visitors: VisitorLocation[]): Map<string, VisitorLocation & { count: number }> {
    const grouped = new Map<string, VisitorLocation & { count: number }>();

    visitors.forEach(visitor => {
      const key = `${visitor.city}-${visitor.country}`;
      const existing = grouped.get(key);

      if (existing) {
        existing.count += (visitor.visit_count || 1);
      } else {
        grouped.set(key, { ...visitor, count: visitor.visit_count || 1 });
      }
    });

    return grouped;
  }
}
