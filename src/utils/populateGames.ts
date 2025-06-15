
import { supabase } from "@/integrations/supabase/client";
import { curatedGames } from "@/data/curatedGames";

export const populateCuratedGames = async () => {
  try {
    console.log("Starting to populate curated games...");
    
    // Check if games already exist to avoid duplicates
    const { data: existingGames } = await supabase
      .from("games")
      .select("title")
      .in("title", curatedGames.map(g => g.title));
    
    const existingTitles = new Set(existingGames?.map(g => g.title) || []);
    const newGames = curatedGames.filter(game => !existingTitles.has(game.title));
    
    if (newGames.length === 0) {
      console.log("All curated games already exist in database");
      return { success: true, imported: 0, skipped: curatedGames.length };
    }
    
    console.log(`Importing ${newGames.length} new games...`);
    
    // Insert games in batches to avoid overwhelming the database
    const batchSize = 5;
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
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`Successfully imported ${imported} curated games`);
    return { 
      success: true, 
      imported, 
      skipped: curatedGames.length - imported 
    };
    
  } catch (error) {
    console.error("Failed to populate curated games:", error);
    throw error;
  }
};
