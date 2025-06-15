
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Review {
  id: string;
  user_id: string;
  game_id: string;
  rating: number;
  title: string;
  content: string;
  likes_count: number;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  games?: {
    title: string;
    cover_image_url: string;
  } | null;
  profiles?: {
    username: string;
    display_name: string;
    avatar_url: string;
  } | null;
}

export interface CreateReviewData {
  gameId: string;
  rating: number;
  title: string;
  content: string;
}

export const useReviews = (gameId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch reviews for a specific game or all reviews
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["reviews", gameId],
    queryFn: async () => {
      console.log("Fetching reviews for gameId:", gameId);
      
      let query = supabase
        .from("reviews")
        .select(`
          *,
          games (title, cover_image_url),
          profiles (username, display_name, avatar_url)
        `)
        .order("created_at", { ascending: false });

      if (gameId) {
        query = query.eq("game_id", gameId);
      }

      const { data, error } = await query;
      if (error) {
        console.error("Error fetching reviews:", error);
        throw error;
      }
      
      console.log("Fetched reviews:", data);
      return (data || []) as Review[];
    },
  });

  // Create a new review
  const createReview = useMutation({
    mutationFn: async (reviewData: CreateReviewData) => {
      if (!user) {
        console.error("User not authenticated");
        throw new Error("User not authenticated");
      }

      console.log("Creating review with data:", reviewData);

      // Map the form data to database schema
      const dbData = {
        user_id: user.id,
        game_id: reviewData.gameId, // Map gameId to game_id
        rating: reviewData.rating,
        title: reviewData.title,
        content: reviewData.content,
      };

      console.log("Mapped database data:", dbData);

      const { data, error } = await supabase
        .from("reviews")
        .insert(dbData)
        .select(`
          *,
          games (title, cover_image_url),
          profiles (username, display_name, avatar_url)
        `)
        .single();

      if (error) {
        console.error("Error creating review:", error);
        throw error;
      }
      
      if (!data) {
        throw new Error("No data returned from review creation");
      }
      
      console.log("Created review:", data);
      return data as Review;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
    onError: (error) => {
      console.error("Mutation error:", error);
    },
  });

  // Update a review
  const updateReview = useMutation({
    mutationFn: async ({ reviewId, ...updateData }: { reviewId: string } & Partial<CreateReviewData>) => {
      if (!user) {
        console.error("User not authenticated");
        throw new Error("User not authenticated");
      }

      // Map the update data properly
      const dbUpdateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (updateData.gameId) dbUpdateData.game_id = updateData.gameId;
      if (updateData.rating !== undefined) dbUpdateData.rating = updateData.rating;
      if (updateData.title) dbUpdateData.title = updateData.title;
      if (updateData.content) dbUpdateData.content = updateData.content;

      console.log("Updating review with data:", dbUpdateData);

      const { data, error } = await supabase
        .from("reviews")
        .update(dbUpdateData)
        .eq("id", reviewId)
        .eq("user_id", user.id) // Ensure user can only update their own reviews
        .select(`
          *,
          games (title, cover_image_url),
          profiles (username, display_name, avatar_url)
        `)
        .single();

      if (error) {
        console.error("Error updating review:", error);
        throw error;
      }
      
      if (!data) {
        throw new Error("No data returned from review update");
      }
      
      return data as Review;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });

  // Delete a review
  const deleteReview = useMutation({
    mutationFn: async (reviewId: string) => {
      if (!user) {
        console.error("User not authenticated");
        throw new Error("User not authenticated");
      }

      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", reviewId)
        .eq("user_id", user.id); // Ensure user can only delete their own reviews

      if (error) {
        console.error("Error deleting review:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });

  // Like/unlike a review
  const toggleLike = useMutation({
    mutationFn: async (reviewId: string) => {
      if (!user) {
        console.error("User not authenticated");
        throw new Error("User not authenticated");
      }

      // Check if user already liked this review
      const { data: existingLike } = await supabase
        .from("review_likes")
        .select("id")
        .eq("user_id", user.id)
        .eq("review_id", reviewId)
        .maybeSingle();

      if (existingLike) {
        // Unlike
        const { error } = await supabase
          .from("review_likes")
          .delete()
          .eq("user_id", user.id)
          .eq("review_id", reviewId);
        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from("review_likes")
          .insert({
            user_id: user.id,
            review_id: reviewId,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });

  // Mark review as helpful
  const toggleHelpful = useMutation({
    mutationFn: async (reviewId: string) => {
      if (!user) {
        console.error("User not authenticated");
        throw new Error("User not authenticated");
      }

      // Check if user already marked this as helpful
      const { data: existingHelpful } = await supabase
        .from("review_helpful")
        .select("id")
        .eq("user_id", user.id)
        .eq("review_id", reviewId)
        .maybeSingle();

      if (existingHelpful) {
        // Remove helpful
        const { error } = await supabase
          .from("review_helpful")
          .delete()
          .eq("user_id", user.id)
          .eq("review_id", reviewId);
        if (error) throw error;
      } else {
        // Mark as helpful
        const { error } = await supabase
          .from("review_helpful")
          .insert({
            user_id: user.id,
            review_id: reviewId,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });

  return {
    reviews,
    isLoading,
    createReview,
    updateReview,
    deleteReview,
    toggleLike,
    toggleHelpful,
  };
};
