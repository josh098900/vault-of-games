
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, Calendar, Grid } from "lucide-react";
import { Header } from "@/components/Header";
import { GameCard } from "@/components/GameCard";
import { GameSubmissionForm } from "@/components/GameSubmissionForm";
import { BulkGameImport } from "@/components/BulkGameImport";
import { useGames } from "@/hooks/useGames";
import { useAuth } from "@/contexts/AuthContext";

const Discover = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [sortBy, setSortBy] = useState("title");
  const { games, isLoading } = useGames();
  const { user } = useAuth();

  // Get unique genres from games and filter out null/undefined values
  const genres = ["all", ...Array.from(new Set(
    games
      .map(game => game.genre)
      .filter(Boolean)
      .filter(genre => genre.trim() !== "")
  ))].sort();
  
  // Filter and sort games
  const filteredGames = games
    .filter(game => 
      (selectedGenre === "all" || game.genre === selectedGenre) &&
      (searchQuery === "" || 
        game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.genre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.developer?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "year":
          return (b.release_year || 0) - (a.release_year || 0);
        case "genre":
          return (a.genre || "").localeCompare(b.genre || "");
        default:
          return a.title.localeCompare(b.title);
      }
    });

  // Get recent releases (games from last 3 years)
  const currentYear = new Date().getFullYear();
  const recentReleases = games
    .filter(game => game.release_year && game.release_year >= currentYear - 2)
    .sort((a, b) => (b.release_year || 0) - (a.release_year || 0))
    .slice(0, 8);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <Grid className="w-12 h-12 mx-auto animate-pulse text-primary mb-4" />
            <p>Loading games...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-bold">Discover Games</h1>
            <div className="flex gap-2">
              <GameSubmissionForm />
              {user && <BulkGameImport />}
            </div>
          </div>
          
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search games, genres, or developers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-background border border-border rounded-md text-sm"
              >
                <option value="title">Sort by Title</option>
                <option value="year">Sort by Year</option>
                <option value="genre">Sort by Genre</option>
              </select>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
            </div>
          </div>

          {/* Genre Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {genres.slice(0, 10).map(genre => (
              <Badge 
                key={genre}
                variant={selectedGenre === genre ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedGenre(genre)}
              >
                {genre === "all" ? "All Genres" : genre}
              </Badge>
            ))}
            {genres.length > 10 && (
              <Badge variant="outline" className="cursor-pointer">
                +{genres.length - 10} more
              </Badge>
            )}
          </div>
        </div>

        {/* Recent Releases Section */}
        {recentReleases.length > 0 && searchQuery === "" && selectedGenre === "all" && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Calendar className="w-6 h-6 mr-2 text-primary" />
              Recent Releases ({currentYear - 2}-{currentYear})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentReleases.map((game) => (
                <Card key={`recent-${game.id}`} className="gaming-card">
                  <CardContent className="p-4">
                    <h3 className="font-bold mb-2 line-clamp-1">{game.title}</h3>
                    <p className="text-sm text-muted-foreground mb-1">
                      {game.release_year}
                    </p>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {game.genre}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {game.platform}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* All Games Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {searchQuery || selectedGenre !== "all" ? "Search Results" : "All Games"} 
              <span className="text-lg text-muted-foreground ml-2">
                ({filteredGames.length})
              </span>
            </h2>
          </div>
          
          {filteredGames.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Grid className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                No games found matching your criteria.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Try adjusting your search terms or filters, or contribute by adding a new game.
              </p>
              <GameSubmissionForm />
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Discover;
