
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
  };
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
      let query = supabase
        .from("reviews")
        .select(`
          *,
          games (title, cover_image_url)
        `)
        .order("created_at", { ascending: false });

      if (gameId) {
        query = query.eq("game_id", gameId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Transform the data to match our Review interface
      return (data || []).map(review => ({
        ...review,
        profiles: null // We'll implement profiles later
      })) as Review[];
    },
  });

  // Create a new review
  const createReview = useMutation({
    mutationFn: async (reviewData: CreateReviewData) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("reviews")
        .insert({
          user_id: user.id,
          game_id: reviewData.gameId,
          rating: reviewData.rating,
          title: reviewData.title,
          content: reviewData.content,
        })
        .select(`
          *,
          games (title, cover_image_url)
        `)
        .single();

      if (error) throw error;
      return { ...data, profiles: null };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });

  // Update a review
  const updateReview = useMutation({
    mutationFn: async ({ reviewId, ...updateData }: { reviewId: string } & Partial<CreateReviewData>) => {
      const { data, error } = await supabase
        .from("reviews")
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", reviewId)
        .select(`
          *,
          games (title, cover_image_url)
        `)
        .single();

      if (error) throw error;
      return { ...data, profiles: null };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });

  // Delete a review
  const deleteReview = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", reviewId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });

  // Like/unlike a review
  const toggleLike = useMutation({
    mutationFn: async (reviewId: string) => {
      if (!user) throw new Error("User not authenticated");

      // Check if user already liked this review
      const { data: existingLike } = await supabase
        .from("review_likes")
        .select("id")
        .eq("user_id", user.id)
        .eq("review_id", reviewId)
        .single();

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
      if (!user) throw new Error("User not authenticated");

      // Check if user already marked this as helpful
      const { data: existingHelpful } = await supabase
        .from("review_helpful")
        .select("id")
        .eq("user_id", user.id)
        .eq("review_id", reviewId)
        .single();

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
