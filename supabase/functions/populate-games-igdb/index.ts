
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface IGDBGame {
  id: number;
  name: string;
  summary?: string;
  genres?: Array<{ name: string }>;
  platforms?: Array<{ name: string }>;
  first_release_date?: number;
  involved_companies?: Array<{
    company: { name: string };
    developer: boolean;
    publisher: boolean;
  }>;
  cover?: { url: string };
  rating?: number;
  screenshots?: Array<{ url: string }>;
  videos?: Array<{ video_id: string }>;
  tags?: number[];
}

const IGDB_CLIENT_ID = Deno.env.get('IGDB_CLIENT_ID');
const IGDB_ACCESS_TOKEN = Deno.env.get('IGDB_ACCESS_TOKEN');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const popularGameQueries = [
  // Popular AAA games
  `fields name,summary,genres.name,platforms.name,first_release_date,involved_companies.company.name,involved_companies.developer,involved_companies.publisher,cover.url,rating,screenshots.url,videos.video_id; 
   where rating >= 80 & rating_count >= 100 & category = 0; 
   sort rating desc; 
   limit 100;`,
  
  // Popular indie games
  `fields name,summary,genres.name,platforms.name,first_release_date,involved_companies.company.name,involved_companies.developer,involved_companies.publisher,cover.url,rating,screenshots.url,videos.video_id; 
   where rating >= 75 & themes = (42) & category = 0; 
   sort rating desc; 
   limit 50;`,
   
  // Recent popular games (2020-2024)
  `fields name,summary,genres.name,platforms.name,first_release_date,involved_companies.company.name,involved_companies.developer,involved_companies.publisher,cover.url,rating,screenshots.url,videos.video_id; 
   where first_release_date >= 1577836800 & rating >= 70 & category = 0; 
   sort first_release_date desc; 
   limit 100;`,
   
  // Classic games
  `fields name,summary,genres.name,platforms.name,first_release_date,involved_companies.company.name,involved_companies.developer,involved_companies.publisher,cover.url,rating,screenshots.url,videos.video_id; 
   where first_release_date >= 946684800 & first_release_date <= 1577836800 & rating >= 85 & category = 0; 
   sort rating desc; 
   limit 100;`,
   
  // Action games
  `fields name,summary,genres.name,platforms.name,first_release_date,involved_companies.company.name,involved_companies.developer,involved_companies.publisher,cover.url,rating,screenshots.url,videos.video_id; 
   where genres = (4) & rating >= 75 & category = 0; 
   sort rating desc; 
   limit 50;`,
   
  // RPG games
  `fields name,summary,genres.name,platforms.name,first_release_date,involved_companies.company.name,involved_companies.developer,involved_companies.publisher,cover.url,rating,screenshots.url,videos.video_id; 
   where genres = (12) & rating >= 75 & category = 0; 
   sort rating desc; 
   limit 50;`,
];

async function fetchGamesFromIGDB(query: string): Promise<IGDBGame[]> {
  if (!IGDB_CLIENT_ID || !IGDB_ACCESS_TOKEN) {
    throw new Error('IGDB credentials not configured');
  }

  const response = await fetch('https://api.igdb.com/v4/games', {
    method: 'POST',
    headers: {
      'Client-ID': IGDB_CLIENT_ID,
      'Authorization': `Bearer ${IGDB_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: query,
  });

  if (!response.ok) {
    throw new Error(`IGDB API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

function transformIGDBGame(igdbGame: IGDBGame): any {
  const genres = igdbGame.genres?.[0]?.name || 'Action';
  const platforms = igdbGame.platforms?.map(p => p.name).join(', ') || 'PC';
  const releaseYear = igdbGame.first_release_date 
    ? new Date(igdbGame.first_release_date * 1000).getFullYear() 
    : new Date().getFullYear();
  
  const developer = igdbGame.involved_companies?.find(c => c.developer)?.company.name || 'Unknown Developer';
  const publisher = igdbGame.involved_companies?.find(c => c.publisher)?.company.name || developer;
  
  const coverUrl = igdbGame.cover?.url 
    ? igdbGame.cover.url.replace('//images.igdb.com', 'https://images.igdb.com').replace('t_thumb', 't_cover_big')
    : `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000000000)}?w=400&h=600&fit=crop`;
  
  const screenshots = igdbGame.screenshots?.slice(0, 5).map(s => 
    s.url.replace('//images.igdb.com', 'https://images.igdb.com').replace('t_thumb', 't_screenshot_med')
  ) || [];
  
  const videos = igdbGame.videos?.slice(0, 3).map(v => `https://www.youtube.com/watch?v=${v.video_id}`) || [];
  
  const metacriticScore = igdbGame.rating ? Math.round(igdbGame.rating) : undefined;
  
  return {
    title: igdbGame.name,
    description: igdbGame.summary || `Experience ${igdbGame.name}, an engaging ${genres.toLowerCase()} game.`,
    genre: genres,
    platform: platforms,
    release_year: releaseYear,
    developer,
    publisher,
    cover_image_url: coverUrl,
    metacritic_score: metacriticScore,
    igdb_id: igdbGame.id.toString(),
    screenshots,
    videos,
    tags: [genres, platforms.split(',')[0].trim()],
    submission_status: 'approved'
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { count = 500 } = await req.json();
    console.log(`Starting to fetch ${count} games from IGDB...`);

    // Check existing games to avoid duplicates
    const { data: existingGames } = await supabase
      .from("games")
      .select("title, igdb_id")
      .not('igdb_id', 'is', null);

    const existingTitles = new Set(existingGames?.map(g => g.title.toLowerCase()) || []);
    const existingIgdbIds = new Set(existingGames?.map(g => g.igdb_id) || []);

    let allGames: any[] = [];
    let totalFetched = 0;

    // Fetch games using different queries to get variety
    for (const query of popularGameQueries) {
      if (totalFetched >= count) break;
      
      try {
        console.log(`Fetching games with query: ${query.substring(0, 50)}...`);
        const igdbGames = await fetchGamesFromIGDB(query);
        
        const transformedGames = igdbGames
          .filter(game => 
            !existingTitles.has(game.name.toLowerCase()) && 
            !existingIgdbIds.has(game.id.toString()) &&
            game.name && 
            game.name.length > 0
          )
          .map(transformIGDBGame)
          .slice(0, Math.min(50, count - totalFetched));

        allGames.push(...transformedGames);
        totalFetched += transformedGames.length;
        
        console.log(`Fetched ${transformedGames.length} games from this query. Total: ${totalFetched}`);
        
        // Rate limiting - wait between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Error with query: ${error.message}`);
        continue;
      }
    }

    // Remove duplicates by title
    const uniqueGames = allGames.filter((game, index, self) => 
      index === self.findIndex(g => g.title.toLowerCase() === game.title.toLowerCase())
    );

    console.log(`Prepared ${uniqueGames.length} unique games for insertion`);

    if (uniqueGames.length === 0) {
      return new Response(
        JSON.stringify({ success: true, imported: 0, message: "No new games to import" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert games in batches
    const batchSize = 25;
    let imported = 0;
    
    for (let i = 0; i < uniqueGames.length; i += batchSize) {
      const batch = uniqueGames.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from("games")
        .insert(batch);
      
      if (error) {
        console.error("Error importing batch:", error);
        throw error;
      }
      
      imported += batch.length;
      console.log(`Imported ${imported}/${uniqueGames.length} games`);
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`Successfully imported ${imported} games from IGDB`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        imported, 
        total_fetched: totalFetched,
        message: `Successfully imported ${imported} games from IGDB API` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in populate-games-igdb function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
