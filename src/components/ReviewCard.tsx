
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Heart, ThumbsUp, MoreVertical, Edit, Trash2 } from "lucide-react";
import { Review } from "@/hooks/useReviews";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ReviewCardProps {
  review: Review;
  onLike: (reviewId: string) => void;
  onHelpful: (reviewId: string) => void;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: string) => void;
  showGame?: boolean;
}

export const ReviewCard = ({ 
  review, 
  onLike, 
  onHelpful, 
  onEdit, 
  onDelete, 
  showGame = false 
}: ReviewCardProps) => {
  const { user } = useAuth();
  const isOwnReview = user?.id === review.user_id;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <Card className="gaming-card">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="w-10 h-10">
            <AvatarImage 
              src={review.profiles?.avatar_url || ""} 
              alt={review.profiles?.display_name || review.profiles?.username || "User"} 
            />
            <AvatarFallback>
              {(review.profiles?.display_name || review.profiles?.username || "Anonymous User").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">
                    {review.profiles?.display_name || review.profiles?.username || "Anonymous User"}
                  </span>
                  <div className="flex items-center">
                    {renderStars(review.rating)}
                  </div>
                </div>
                
                {showGame && review.games && (
                  <div className="flex items-center gap-2 mb-2">
                    <img 
                      src={review.games.cover_image_url || ""} 
                      alt={review.games.title}
                      className="w-6 h-8 object-cover rounded"
                    />
                    <span className="text-sm text-muted-foreground">{review.games.title}</span>
                  </div>
                )}

                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                </p>
              </div>

              {isOwnReview && (onEdit || onDelete) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(review)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Review
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem 
                        onClick={() => onDelete(review.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Review
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <div>
              <h4 className="font-semibold mb-2">{review.title}</h4>
              <p className="text-sm leading-relaxed">{review.content}</p>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onLike(review.id)}
                className="text-muted-foreground hover:text-pink-400 gap-1"
              >
                <Heart className="w-4 h-4" />
                {review.likes_count}
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onHelpful(review.id)}
                className="text-muted-foreground hover:text-blue-400 gap-1"
              >
                <ThumbsUp className="w-4 h-4" />
                {review.helpful_count} Helpful
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
