import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Star, TrendingUp, Clock, Edit } from "lucide-react";
import { Header } from "@/components/Header";
import { ReviewCard } from "@/components/ReviewCard";
import { ReviewForm } from "@/components/ReviewForm";
import { useReviews } from "@/hooks/useReviews";
import { useGames } from "@/hooks/useGames";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { GameCard } from "@/components/GameCard";
import { Game } from "@/hooks/useUserGames";

const Reviews = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [editingReview, setEditingReview] = useState<any>(null);

  const { user } = useAuth();
  const { reviews, isLoading, createReview, updateReview, deleteReview, toggleLike, toggleHelpful } = useReviews();
  const { data: games = [] } = useGames();

  // Filter reviews based on search and filter
  const filteredReviews = reviews.filter(review => {
    const matchesSearch = !searchQuery || 
      review.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.games?.title.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedFilter === "all") return matchesSearch;
    if (selectedFilter === "my-reviews") return matchesSearch && review.user_id === user?.id;
    if (selectedFilter === "5-star") return matchesSearch && review.rating === 5;
    if (selectedFilter === "recent") return matchesSearch;
    
    return matchesSearch;
  });

  const handleWriteReview = (game: Game) => {
    setSelectedGame(game);
    setEditingReview(null);
    setShowReviewForm(true);
  };

  const handleEditReview = (review: any) => {
    const game = games.find(g => g.id === review.game_id);
    if (game) {
      setSelectedGame(game);
      setEditingReview(review);
      setShowReviewForm(true);
    }
  };

  const handleSubmitReview = async (reviewData: any) => {
    try {
      if (editingReview) {
        await updateReview.mutateAsync({
          reviewId: editingReview.id,
          ...reviewData,
        });
        toast({
          title: "Review updated!",
          description: "Your review has been successfully updated.",
        });
      } else {
        await createReview.mutateAsync(reviewData);
        toast({
          title: "Review published!",
          description: "Your review has been successfully published.",
        });
      }
      setShowReviewForm(false);
      setSelectedGame(null);
      setEditingReview(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save review. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await deleteReview.mutateAsync(reviewId);
      toast({
        title: "Review deleted",
        description: "Your review has been deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete review. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLike = async (reviewId: string) => {
    try {
      await toggleLike.mutateAsync(reviewId);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to like review. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleHelpful = async (reviewId: string) => {
    try {
      await toggleHelpful.mutateAsync(reviewId);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark as helpful. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (showReviewForm && selectedGame) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <ReviewForm
            game={selectedGame}
            existingReview={editingReview}
            onSubmit={handleSubmitReview}
            onCancel={() => {
              setShowReviewForm(false);
              setSelectedGame(null);
              setEditingReview(null);
            }}
            isLoading={createReview.isPending || updateReview.isPending}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-green-600/20">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4 text-gradient">Game Reviews</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover what the community thinks about your favorite games and share your own experiences.
          </p>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 px-4 border-b border-white/10">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search reviews..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50 border-white/20"
                />
              </div>
              <Button variant="outline" className="border-white/20">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Badge 
                variant={selectedFilter === "all" ? "default" : "outline"}
                className={`cursor-pointer ${selectedFilter === "all" ? "bg-primary" : "border-white/20"}`}
                onClick={() => setSelectedFilter("all")}
              >
                All Reviews
              </Badge>
              {user && (
                <Badge 
                  variant={selectedFilter === "my-reviews" ? "default" : "outline"}
                  className={`cursor-pointer ${selectedFilter === "my-reviews" ? "bg-primary" : "border-white/20"}`}
                  onClick={() => setSelectedFilter("my-reviews")}
                >
                  My Reviews
                </Badge>
              )}
              <Badge 
                variant={selectedFilter === "5-star" ? "default" : "outline"}
                className={`cursor-pointer ${selectedFilter === "5-star" ? "bg-primary" : "border-white/20"}`}
                onClick={() => setSelectedFilter("5-star")}
              >
                <Star className="w-3 h-3 mr-1" />
                5 Star
              </Badge>
              <Badge 
                variant={selectedFilter === "recent" ? "default" : "outline"}
                className={`cursor-pointer ${selectedFilter === "recent" ? "bg-primary" : "border-white/20"}`}
                onClick={() => setSelectedFilter("recent")}
              >
                <Clock className="w-3 h-3 mr-1" />
                Recent
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Games to Review Section */}
      {user && (
        <section className="py-8 px-4">
          <div className="container mx-auto">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Edit className="w-6 h-6 mr-2 text-primary" />
              Write a Review
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {games.slice(0, 4).map((game) => (
                <GameCard 
                  key={game.id} 
                  game={game} 
                  onWriteReview={handleWriteReview}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Reviews Section */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-green-400" />
              Latest Reviews
            </h2>
            <p className="text-muted-foreground">
              {filteredReviews.length} review{filteredReviews.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading reviews...</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No reviews found.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onLike={handleLike}
                  onHelpful={handleHelpful}
                  onEdit={handleEditReview}
                  onDelete={handleDeleteReview}
                  showGame={true}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Reviews;
