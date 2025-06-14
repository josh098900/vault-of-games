
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { GameLibraryCard } from "@/components/GameLibraryCard";
import { useUserGames, GameStatus } from "@/hooks/useUserGames";
import { useAuth } from "@/contexts/AuthContext";
import { Library as LibraryIcon, Clock, Check, Heart, Plus, X } from "lucide-react";

const Library = () => {
  const { user } = useAuth();
  const { userGames, isLoading } = useUserGames();
  const [selectedStatus, setSelectedStatus] = useState<GameStatus | "all">("all");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "playing":
        return <Clock className="w-4 h-4" />;
      case "completed":
        return <Check className="w-4 h-4" />;
      case "wishlist":
        return <Heart className="w-4 h-4" />;
      case "backlog":
        return <Plus className="w-4 h-4" />;
      case "dropped":
        return <X className="w-4 h-4" />;
      default:
        return <LibraryIcon className="w-4 h-4" />;
    }
  };

  const getGamesByStatus = (status: GameStatus | "all") => {
    if (status === "all") return userGames;
    return userGames.filter(game => game.status === status);
  };

  const statusCounts = {
    all: userGames.length,
    playing: userGames.filter(g => g.status === "playing").length,
    completed: userGames.filter(g => g.status === "completed").length,
    wishlist: userGames.filter(g => g.status === "wishlist").length,
    backlog: userGames.filter(g => g.status === "backlog").length,
    dropped: userGames.filter(g => g.status === "dropped").length,
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Game Library</h1>
            <p className="text-muted-foreground">Please sign in to view your game library.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading your library...</div>
        </div>
      </div>
    );
  }

  const filteredGames = getGamesByStatus(selectedStatus);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-6 flex items-center">
            <LibraryIcon className="w-8 h-8 mr-3 text-primary" />
            My Game Library
          </h1>
          
          {/* Status Filter Tabs */}
          <Tabs value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as GameStatus | "all")}>
            <TabsList className="grid w-full grid-cols-6 mb-6">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <LibraryIcon className="w-4 h-4" />
                All ({statusCounts.all})
              </TabsTrigger>
              <TabsTrigger value="playing" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Playing ({statusCounts.playing})
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                Completed ({statusCounts.completed})
              </TabsTrigger>
              <TabsTrigger value="wishlist" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Wishlist ({statusCounts.wishlist})
              </TabsTrigger>
              <TabsTrigger value="backlog" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Backlog ({statusCounts.backlog})
              </TabsTrigger>
              <TabsTrigger value="dropped" className="flex items-center gap-2">
                <X className="w-4 h-4" />
                Dropped ({statusCounts.dropped})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Games Grid */}
        <section>
          {filteredGames.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredGames.map((userGame) => (
                <GameLibraryCard key={userGame.id} userGame={userGame} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mb-4">
                {getStatusIcon(selectedStatus)}
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {selectedStatus === "all" 
                  ? "Your library is empty" 
                  : `No ${selectedStatus} games`
                }
              </h3>
              <p className="text-muted-foreground mb-4">
                {selectedStatus === "all"
                  ? "Start building your game collection by adding games from the Discover page."
                  : `You don't have any games marked as ${selectedStatus}.`
                }
              </p>
              <Button asChild>
                <a href="/discover">Discover Games</a>
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Library;
