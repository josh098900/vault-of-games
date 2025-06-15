
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Star, Calendar, Monitor, User, Building } from "lucide-react";
import { Header } from "@/components/Header";
import { Game } from "@/hooks/useUserGames";
import { useGames } from "@/hooks/useGames";
import { useReviews } from "@/hooks/useReviews";
import { ReviewCard } from "@/components/ReviewCard";

const GameDetail = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { games } = useGames();
  const { reviews, isLoading: reviewsLoading } = useReviews(id);

  // Get game from location state or fetch from games list
  const game: Game | undefined = location.state?.game || games.find(g => g.id === id);

  if (!game) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-muted-foreground">Game not found</p>
            <Button onClick={() => navigate(-1)} className="mt-4">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const gameReviews = reviews.filter(review => review.game_id === game.id);
  const averageRating = gameReviews.length > 0 
    ? gameReviews.reduce((acc, review) => acc + review.rating, 0) / gameReviews.length 
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        {/* Game Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-1">
            <img
              src={game.cover_image_url || "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=600&fit=crop"}
              alt={game.title}
              className="w-full max-w-sm mx-auto lg:mx-0 rounded-lg shadow-lg"
            />
          </div>
          
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">{game.title}</h1>
              {game.description && (
                <p className="text-lg text-muted-foreground mb-4">{game.description}</p>
              )}
              
              {averageRating > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center bg-yellow-500/20 px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="font-bold">{averageRating.toFixed(1)}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({gameReviews.length} {gameReviews.length === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Release Year</p>
                  <p className="font-semibold">{game.release_year}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Platform</p>
                  <p className="font-semibold">{game.platform}</p>
                </div>
              </div>
              
              {game.developer && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Developer</p>
                    <p className="font-semibold">{game.developer}</p>
                  </div>
                </div>
              )}
              
              {game.publisher && (
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Publisher</p>
                    <p className="font-semibold">{game.publisher}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-primary/30 text-primary">
                {game.genre}
              </Badge>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Reviews ({gameReviews.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reviewsLoading ? (
              <p>Loading reviews...</p>
            ) : gameReviews.length > 0 ? (
              <div className="space-y-4">
                {gameReviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No reviews yet. Be the first to review this game!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GameDetail;
