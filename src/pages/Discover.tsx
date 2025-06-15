
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, Calendar } from "lucide-react";
import { Header } from "@/components/Header";
import { GameCard } from "@/components/GameCard";
import { GameSubmissionForm } from "@/components/GameSubmissionForm";
import { BulkGameImport } from "@/components/BulkGameImport";
import { useGames } from "@/hooks/useGames";
import { useAuth } from "@/contexts/AuthContext";

const Discover = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const { games, isLoading } = useGames();
  const { user } = useAuth();

  // Get unique genres from games
  const genres = ["all", ...Array.from(new Set(games.map(game => game.genre).filter(Boolean)))];
  
  // Filter games based on search and genre
  const filteredGames = games.filter(game => 
    (selectedGenre === "all" || game.genre === selectedGenre) &&
    (searchQuery === "" || game.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Sample new releases (could be enhanced to filter by recent release_year)
  const newReleases = games
    .filter(game => game.release_year && game.release_year >= 2023)
    .slice(0, 4);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading games...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-6">Discover Games</h1>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search for games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <GameSubmissionForm />
              {user && <BulkGameImport />}
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Advanced Filters
              </Button>
            </div>
          </div>

          {/* Genre Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {genres.map(genre => (
              <Badge 
                key={genre}
                variant={selectedGenre === genre ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedGenre(genre)}
              >
                {genre}
              </Badge>
            ))}
          </div>
        </div>

        {/* New Releases Section */}
        {newReleases.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Calendar className="w-6 h-6 mr-2 text-primary" />
              New Releases
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {newReleases.map((game) => (
                <Card key={game.id} className="gaming-card">
                  <CardContent className="p-4">
                    <h3 className="font-bold mb-2">{game.title}</h3>
                    <p className="text-sm text-muted-foreground mb-1">
                      Released: {game.release_year}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {game.platform}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Discover Games Grid */}
        <section>
          <h2 className="text-2xl font-bold mb-6">All Games ({filteredGames.length})</h2>
          {filteredGames.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No games found matching your criteria.</p>
              <GameSubmissionForm />
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Discover;
