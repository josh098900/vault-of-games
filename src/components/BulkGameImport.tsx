
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
import { Upload, Download, Loader2, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useBulkGameImport } from "@/hooks/useBulkGameImport";
import { Progress } from "@/components/ui/progress";
import { AutoGamePopulation } from "./AutoGamePopulation";

export const BulkGameImport = () => {
  const [open, setOpen] = useState(false);
  const [csvData, setCsvData] = useState("");
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
    <div className="space-y-6">
      {/* Automated Population Component */}
      <AutoGamePopulation />

      {/* Manual CSV Import */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Manual CSV Import
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manual CSV Import</DialogTitle>
            <DialogDescription>
              Import games manually using a CSV file format.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download CSV Template
            </Button>

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
                disabled={isImporting}
              >
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={isImporting || !csvData.trim()}>
                {isImporting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Import Games
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
