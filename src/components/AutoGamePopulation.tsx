
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { populateExpandedCuratedGames } from "@/utils/gamePopulation";

export const AutoGamePopulation = () => {
  const [isPopulatingCurated, setIsPopulatingCurated] = useState(false);

  const handlePopulateCurated = async () => {
    setIsPopulatingCurated(true);
    
    try {
      const result = await populateExpandedCuratedGames();
      
      if (result.success) {
        toast({
          title: "Games imported successfully!",
          description: `${result.imported} new games added, ${result.skipped} already existed.`,
        });
      }
    } catch (error) {
      console.error("Failed to populate curated games:", error);
      toast({
        title: "Import failed",
        description: "Failed to import curated games. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPopulatingCurated(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Automated Game Population
        </CardTitle>
        <CardDescription>
          Quickly populate your game database with curated collections.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Curated Games Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Curated Game Collection</h3>
              <p className="text-sm text-muted-foreground">
                Import 30+ hand-picked popular games across various genres
              </p>
            </div>
            <Badge variant="outline" className="text-green-600 border-green-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              Ready
            </Badge>
          </div>
          
          <Button
            onClick={handlePopulateCurated}
            disabled={isPopulatingCurated}
            className="w-full"
          >
            {isPopulatingCurated && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isPopulatingCurated ? "Importing Curated Games..." : "Import Curated Games"}
          </Button>
        </div>

        {/* Info Section */}
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4" />
            Quick Setup Guide
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Start with curated games for instant content</li>
            <li>• Games are automatically checked for duplicates</li>
            <li>• Each import is safe to run multiple times</li>
            <li>• Use manual CSV import for custom game lists</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
