
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Loader2, 
  Sparkles, 
  Database, 
  TrendingUp, 
  Download,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { populateExpandedCuratedGames, populateGamesFromIGDB } from "@/utils/gamePopulation";

export const AutoGamePopulation = () => {
  const [isPopulatingCurated, setIsPopulatingCurated] = useState(false);
  const [isPopulatingIGDB, setIsPopulatingIGDB] = useState(false);
  const [populationProgress, setPopulationProgress] = useState(0);
  const [currentStatus, setCurrentStatus] = useState("");

  const handlePopulateExpandedCurated = async () => {
    setIsPopulatingCurated(true);
    setCurrentStatus("Importing expanded curated games...");
    
    try {
      const result = await populateExpandedCuratedGames();
      toast({
        title: "Expanded curated games imported!",
        description: `Added ${result.imported} new games, skipped ${result.skipped} existing games.`,
      });
      setCurrentStatus("Completed expanded curated games import");
    } catch (error) {
      console.error("Failed to populate expanded curated games:", error);
      toast({
        title: "Import failed",
        description: "Failed to import expanded curated games. Please try again.",
        variant: "destructive",
      });
      setCurrentStatus("Failed to import expanded curated games");
    } finally {
      setIsPopulatingCurated(false);
    }
  };

  const handlePopulateIGDB = async (count: number = 500) => {
    setIsPopulatingIGDB(true);
    setPopulationProgress(0);
    setCurrentStatus(`Starting automated import of ${count} games from IGDB...`);
    
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setPopulationProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 2000);

      const result = await populateGamesFromIGDB(count);
      
      clearInterval(progressInterval);
      setPopulationProgress(100);
      
      toast({
        title: "IGDB games imported successfully!",
        description: `Imported ${result.imported} games from IGDB API.`,
      });
      setCurrentStatus(`Successfully imported ${result.imported} games from IGDB`);
      
      // Refresh the page to show new games
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error("Failed to populate games from IGDB:", error);
      toast({
        title: "IGDB import failed",
        description: "Failed to import games from IGDB. Check if API credentials are configured.",
        variant: "destructive",
      });
      setCurrentStatus("Failed to import games from IGDB");
    } finally {
      setIsPopulatingIGDB(false);
      setPopulationProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Automated Game Population
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Expanded Curated Games */}
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Expanded Curated Collection
                </h3>
                <p className="text-sm text-muted-foreground">
                  Import 30+ hand-picked quality games across all genres
                </p>
              </div>
              <Button
                onClick={handlePopulateExpandedCurated}
                disabled={isPopulatingCurated || isPopulatingIGDB}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {isPopulatingCurated ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Import Curated Games
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
                <div className="font-bold text-purple-600">30+</div>
                <div className="text-xs">Quality Games</div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                <div className="font-bold text-blue-600">10+</div>
                <div className="text-xs">Genres</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                <div className="font-bold text-green-600">AAA</div>
                <div className="text-xs">& Indie</div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
                <div className="font-bold text-orange-600">Multi</div>
                <div className="text-xs">Platform</div>
              </div>
            </div>
          </div>

          {/* IGDB Automated Population */}
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  IGDB Automated Import
                </h3>
                <p className="text-sm text-muted-foreground">
                  Automatically fetch 500+ popular games from IGDB database
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handlePopulateIGDB(100)}
                  disabled={isPopulatingCurated || isPopulatingIGDB}
                  variant="outline"
                >
                  {isPopulatingIGDB ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Import 100
                </Button>
                <Button
                  onClick={() => handlePopulateIGDB(500)}
                  disabled={isPopulatingCurated || isPopulatingIGDB}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                >
                  {isPopulatingIGDB ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Database className="w-4 h-4 mr-2" />
                  )}
                  Import 500+
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                <div className="font-bold text-blue-600">500+</div>
                <div className="text-xs">Games</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                <div className="font-bold text-green-600">Auto</div>
                <div className="text-xs">Metadata</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
                <div className="font-bold text-purple-600">All</div>
                <div className="text-xs">Genres</div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
                <div className="font-bold text-orange-600">High</div>
                <div className="text-xs">Quality</div>
              </div>
            </div>
          </div>

          {/* Progress and Status */}
          {(isPopulatingCurated || isPopulatingIGDB) && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {isPopulatingIGDB ? (
                  <TrendingUp className="w-4 h-4 text-blue-500 animate-pulse" />
                ) : (
                  <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />
                )}
                <span className="text-sm font-medium">{currentStatus}</span>
              </div>
              
              {isPopulatingIGDB && (
                <Progress value={populationProgress} className="w-full" />
              )}
            </div>
          )}

          {/* Status Messages */}
          {currentStatus && !isPopulatingCurated && !isPopulatingIGDB && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700 dark:text-green-300">{currentStatus}</span>
            </div>
          )}

          {/* Warning about API credentials */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-700 dark:text-amber-300">
              <p className="font-medium">IGDB API Setup Required</p>
              <p>To use automated IGDB import, configure IGDB_CLIENT_ID and IGDB_ACCESS_TOKEN in your Supabase edge function secrets.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
