
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload, Download, Loader2, FileText, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useBulkGameImport } from "@/hooks/useBulkGameImport";
import { Progress } from "@/components/ui/progress";
import { populateCuratedGames } from "@/utils/populateGames";

export const BulkGameImport = () => {
  const [open, setOpen] = useState(false);
  const [csvData, setCsvData] = useState("");
  const [isPopulating, setIsPopulating] = useState(false);
  const { importGames, isImporting, importProgress } = useBulkGameImport();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/csv") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCsvData(content);
      };
      reader.readAsText(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file.",
        variant: "destructive",
      });
    }
  };

  const handleImport = async () => {
    if (!csvData.trim()) {
      toast({
        title: "No data to import",
        description: "Please upload a CSV file or paste CSV data.",
        variant: "destructive",
      });
      return;
    }

    try {
      await importGames.mutateAsync(csvData);
      toast({
        title: "Import successful!",
        description: "Games have been imported successfully.",
      });
      setCsvData("");
      setOpen(false);
    } catch (error) {
      console.error("Import failed:", error);
    }
  };

  const handlePopulateCurated = async () => {
    setIsPopulating(true);
    try {
      const result = await populateCuratedGames();
      toast({
        title: "Curated games imported!",
        description: `Added ${result.imported} new games, skipped ${result.skipped} existing games.`,
      });
      window.location.reload(); // Refresh to show new games
    } catch (error) {
      console.error("Failed to populate curated games:", error);
      toast({
        title: "Import failed",
        description: "Failed to import curated games. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPopulating(false);
    }
  };

  const downloadTemplate = () => {
    const csvTemplate = `title,description,genre,platform,release_year,developer,publisher,cover_image_url,metacritic_score,steam_id,tags
"The Witcher 3: Wild Hunt","Open-world RPG","RPG","PC",2015,"CD Projekt RED","CD Projekt","https://example.com/witcher3.jpg",93,"292030","RPG,Open World,Fantasy"
"Cyberpunk 2077","Futuristic RPG","RPG","PC",2020,"CD Projekt RED","CD Projekt","https://example.com/cyberpunk.jpg",57,"1091500","RPG,Sci-Fi,Open World"`;

    const blob = new Blob([csvTemplate], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "game_import_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Bulk Import Games
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Import Games</DialogTitle>
          <DialogDescription>
            Import multiple games at once using a CSV file, or quickly populate with curated popular games.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download CSV Template
            </Button>
            <Button
              onClick={handlePopulateCurated}
              disabled={isPopulating}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {isPopulating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Import Curated Games
            </Button>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg border">
            <h4 className="font-medium flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4" />
              Quick Start: Curated Games
            </h4>
            <p className="text-sm text-muted-foreground">
              Import 16+ carefully selected popular games including The Witcher 3, Cyberpunk 2077, Hades, 
              Zelda: Breath of the Wild, and more. Perfect for getting started quickly!
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="csv-file">Upload CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="csv-data">Or Paste CSV Data</Label>
            <Textarea
              id="csv-data"
              placeholder="Paste your CSV data here..."
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
            />
          </div>

          {isImporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Importing games...</span>
                <span>{importProgress}%</span>
              </div>
              <Progress value={importProgress} className="w-full" />
            </div>
          )}

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4" />
              CSV Format Requirements
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Headers: title, description, genre, platform, release_year, developer, publisher, cover_image_url, metacritic_score, steam_id, tags</li>
              <li>• Required fields: title, genre, platform</li>
              <li>• Tags should be comma-separated within quotes</li>
              <li>• release_year should be a number</li>
              <li>• metacritic_score should be between 0-100</li>
            </ul>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isImporting || isPopulating}
            >
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={isImporting || !csvData.trim() || isPopulating}>
              {isImporting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Import Games
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
