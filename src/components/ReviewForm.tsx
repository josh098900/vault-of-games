
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CreateReviewData, Review } from "@/hooks/useReviews";
import { Game } from "@/hooks/useUserGames";

const reviewSchema = z.object({
  gameId: z.string().min(1, "Game ID is required"),
  rating: z.number().min(1, "Rating is required").max(5),
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  content: z.string().min(10, "Review must be at least 10 characters").max(1000, "Review too long"),
});

interface ReviewFormProps {
  game: Game;
  existingReview?: Review;
  onSubmit: (data: CreateReviewData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ReviewForm = ({ 
  game, 
  existingReview, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: ReviewFormProps) => {
  const [selectedRating, setSelectedRating] = useState(existingReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);

  const form = useForm<CreateReviewData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      gameId: game.id,
      rating: existingReview?.rating || 0,
      title: existingReview?.title || "",
      content: existingReview?.content || "",
    },
  });

  const handleSubmit = async (data: CreateReviewData) => {
    console.log("Form submitting with data:", data);
    console.log("Selected rating:", selectedRating);
    
    if (selectedRating === 0) {
      console.error("No rating selected");
      return;
    }

    try {
      const reviewData: CreateReviewData = {
        ...data,
        gameId: game.id, // Ensure we always use the correct game ID
        rating: selectedRating,
      };
      
      console.log("Final review data:", reviewData);
      await onSubmit(reviewData);
      
      // Reset form on successful submission
      form.reset();
      setSelectedRating(0);
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  const renderStarRating = () => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => {
          const starNumber = i + 1;
          const isActive = starNumber <= (hoverRating || selectedRating);
          
          return (
            <button
              key={i}
              type="button"
              className="focus:outline-none"
              onMouseEnter={() => setHoverRating(starNumber)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => {
                setSelectedRating(starNumber);
                form.setValue("rating", starNumber);
              }}
            >
              <Star
                className={`w-6 h-6 transition-colors ${
                  isActive 
                    ? "fill-yellow-400 text-yellow-400" 
                    : "text-gray-300 hover:text-yellow-300"
                }`}
              />
            </button>
          );
        })}
        <span className="ml-2 text-sm text-muted-foreground">
          {selectedRating > 0 ? `${selectedRating}/5` : "Select rating"}
        </span>
      </div>
    );
  };

  return (
    <Card className="gaming-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <img 
            src={game.cover_image_url || ""} 
            alt={game.title}
            className="w-12 h-16 object-cover rounded"
          />
          <div>
            <h3 className="text-lg font-bold">{existingReview ? "Edit Review" : "Write Review"}</h3>
            <p className="text-sm text-muted-foreground">{game.title}</p>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="space-y-2">
              <FormLabel>Rating</FormLabel>
              {renderStarRating()}
              {selectedRating === 0 && (
                <p className="text-sm text-destructive">Please select a rating</p>
              )}
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Review Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Sum up your review in a few words..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Review Content</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Share your thoughts about this game..." 
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3">
              <Button 
                type="submit" 
                disabled={isLoading || selectedRating === 0}
                className="flex-1"
              >
                {isLoading ? "Submitting..." : existingReview ? "Update Review" : "Publish Review"}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
