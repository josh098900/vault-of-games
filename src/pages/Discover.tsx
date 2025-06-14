
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, Star, Calendar, Users } from "lucide-react";
import { Header } from "@/components/Header";
import { GameCard } from "@/components/GameCard";

const Discover = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");

  const genres = ["all", "Action", "RPG", "Strategy", "Sports", "Racing", "Puzzle"];
  
  const discoverGames = [
    {
      id: 5,
      title: "Elden Ring",
      cover: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=300&h=400&fit=crop",
      rating: 4.8,
      genre: "RPG",
      platform: "PC",
      status: "wishlist",
      year: 2022
    },
    {
      id: 6,
      title: "God of War",
      cover: "https://images.unsplash.com/photo-1585504198199-20277593b94f?w=300&h=400&fit=crop",
      rating: 4.9,
      genre: "Action",
      platform: "PlayStation",
      status: "backlog",
      year: 2018
    },
    {
      id: 7,
      title: "Civilization VI",
      cover: "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=300&h=400&fit=crop",
      rating: 4.5,
      genre: "Strategy",
      platform: "PC",
      status: "playing",
      year: 2016
    },
    {
      id: 8,
      title: "FIFA 24",
      cover: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=400&fit=crop",
      rating: 4.2,
      genre: "Sports",
      platform: "PC",
      status: "completed",
      year: 2023
    }
  ];

  const newReleases = [
    { title: "Spider-Man 2", releaseDate: "2023-10-20", platform: "PlayStation" },
    { title: "Alan Wake 2", releaseDate: "2023-10-27", platform: "PC" },
    { title: "Super Mario Wonder", releaseDate: "2023-10-20", platform: "Switch" },
    { title: "Forza Motorsport", releaseDate: "2023-10-10", platform: "Xbox" }
  ];

  const filteredGames = discoverGames.filter(game => 
    (selectedGenre === "all" || game.genre === selectedGenre) &&
    (searchQuery === "" || game.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Advanced Filters
            </Button>
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
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Calendar className="w-6 h-6 mr-2 text-primary" />
            New Releases
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {newReleases.map((game, index) => (
              <Card key={index} className="gaming-card">
                <CardContent className="p-4">
                  <h3 className="font-bold mb-2">{game.title}</h3>
                  <p className="text-sm text-muted-foreground mb-1">
                    Released: {new Date(game.releaseDate).toLocaleDateString()}
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    {game.platform}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Discover Games Grid */}
        <section>
          <h2 className="text-2xl font-bold mb-6">All Games</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Discover;
