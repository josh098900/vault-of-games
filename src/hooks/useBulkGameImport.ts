
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface GameImportData {
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

export const useBulkGameImport = () => {
  const [importProgress, setImportProgress] = useState(0);
  const queryClient = useQueryClient();

  const parseCsvData = (csvData: string): GameImportData[] => {
    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    
    const games: GameImportData[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length === 0) continue;
      
      const game: any = {};
      headers.forEach((header, index) => {
        const value = values[index]?.replace(/"/g, '').trim();
        if (value) {
          switch (header) {
            case 'release_year':
            case 'metacritic_score':
              game[header] = parseInt(value) || undefined;
              break;
            case 'tags':
              game[header] = value.split(',').map(t => t.trim()).filter(Boolean);
              break;
            default:
              game[header] = value;
          }
        }
      });
      
      // Validate required fields
      if (game.title && game.genre && game.platform) {
        games.push(game);
      }
    }
    
    return games;
  };

  const parseCSVLine = (line: string): string[] => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current);
    return result;
  };

  const importGames = useMutation({
    mutationFn: async (csvData: string) => {
      const games = parseCsvData(csvData);
      
      if (games.length === 0) {
        throw new Error("No valid games found in CSV data");
      }

      console.log(`Importing ${games.length} games...`);
      setImportProgress(0);

      const batchSize = 10;
      const batches = [];
      for (let i = 0; i < games.length; i += batchSize) {
        batches.push(games.slice(i, i + batchSize));
      }

      let processedCount = 0;
      const results = [];

      for (const batch of batches) {
        const { data, error } = await supabase
          .from("games")
          .insert(batch.map(game => ({
            ...game,
            submission_status: 'approved',
          })))
          .select();

        if (error) {
          console.error("Batch import error:", error);
          throw error;
        }

        if (data) {
          results.push(...data);
        }

        processedCount += batch.length;
        setImportProgress(Math.round((processedCount / games.length) * 100));
        
        // Small delay to prevent overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      return results;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
      setImportProgress(0);
      toast({
        title: "Import completed!",
        description: `Successfully imported ${data.length} games.`,
      });
    },
    onError: (error) => {
      console.error("Import failed:", error);
      setImportProgress(0);
      toast({
        title: "Import failed",
        description: "Failed to import games. Please check your CSV format.",
        variant: "destructive",
      });
    },
  });

  return {
    importGames,
    isImporting: importGames.isPending,
    importProgress,
  };
};
