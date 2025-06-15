
import { supabase } from "@/integrations/supabase/client";
import { expandedCuratedGames } from "@/data/expandedCuratedGames";

export interface GameData {
  title: string;
  description?: string;
  genre: string;
  platform: string;
  release_year?: number;
  developer?: string;
  publisher?: string;
  cover_image_url?: string;
  metacritic_score?: number;
  steam_id?: string;
  tags?: string[];
}

export const populateExpandedCuratedGames = async () => {
  try {
    console.log("Starting to populate expanded curated games...");
    
    // Check if games already exist to avoid duplicates
    const { data: existingGames } = await supabase
      .from("games")
      .select("title")
      .in("title", expandedCuratedGames.map(g => g.title));
    
    const existingTitles = new Set(existingGames?.map(g => g.title) || []);
    const newGames = expandedCuratedGames.filter(game => !existingTitles.has(game.title));
    
    if (newGames.length === 0) {
      console.log("All expanded curated games already exist in database");
      return { success: true, imported: 0, skipped: expandedCuratedGames.length };
    }
    
    console.log(`Importing ${newGames.length} new games...`);
    
    // Insert games in batches to avoid overwhelming the database
    const batchSize = 10;
    let imported = 0;
    
    for (let i = 0; i < newGames.length; i += batchSize) {
      const batch = newGames.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from("games")
        .insert(batch.map(game => ({
          ...game,
          submission_status: 'approved',
        })));
      
      if (error) {
        console.error("Error importing batch:", error);
        throw error;
      }
      
      imported += batch.length;
      console.log(`Imported ${imported}/${newGames.length} games`);
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log(`Successfully imported ${imported} expanded curated games`);
    return { 
      success: true, 
      imported, 
      skipped: expandedCuratedGames.length - imported 
    };
    
  } catch (error) {
    console.error("Failed to populate expanded curated games:", error);
    throw error;
  }
};

// IGDB API integration for automated game population
export const populateGamesFromIGDB = async (count: number = 500) => {
  try {
    console.log(`Starting automated population of ${count} games from IGDB...`);
    
    // Call our edge function to fetch games from IGDB
    const { data, error } = await supabase.functions.invoke('populate-games-igdb', {
      body: { count }
    });
    
    if (error) {
      console.error("Error calling IGDB population function:", error);
      throw error;
    }
    
    console.log(`Successfully populated ${data?.imported || 0} games from IGDB`);
    return data;
    
  } catch (error) {
    console.error("Failed to populate games from IGDB:", error);
    throw error;
  }
};

export const getPopularGamesByGenre = async (genre: string, limit: number = 50) => {
  try {
    const { data, error } = await supabase.functions.invoke('fetch-games-by-genre', {
      body: { genre, limit }
    });
    
    if (error) throw error;
    return data;
    
  } catch (error) {
    console.error(`Failed to fetch ${genre} games:`, error);
    throw error;
  }
};
