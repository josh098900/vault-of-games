
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface GameRecommendation {
  id: string;
  recommender_id: string;
  recipient_id: string;
  game_id: string;
  message: string | null;
  is_read: boolean;
  created_at: string;
  games: {
    id: string;
    title: string;
    cover_image_url: string | null;
    genre: string | null;
  };
  profiles: {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export const useRecommendations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: receivedRecommendations = [], isLoading } = useQuery({
    queryKey: ["receivedRecommendations", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Get recommendations with games
      const { data: recommendationsData, error: recError } = await supabase
        .from("game_recommendations")
        .select(`
          *,
          games (
            id,
            title,
            cover_image_url,
            genre
          )
        `)
        .eq("recipient_id", user.id)
        .order("created_at", { ascending: false });

      if (recError) throw recError;
      if (!recommendationsData || recommendationsData.length === 0) return [];

      // Get recommender IDs
      const recommenderIds = recommendationsData.map(r => r.recommender_id);

      // Get profiles for recommenders
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .in("id", recommenderIds);

      if (profilesError) throw profilesError;

      // Combine the data
      return recommendationsData.map(rec => ({
        ...rec,
        profiles: profilesData?.find(p => p.id === rec.recommender_id) || {
          id: rec.recommender_id,
          username: null,
          display_name: null,
          avatar_url: null,
        }
      })) as GameRecommendation[];
    },
    enabled: !!user,
  });

  const { data: sentRecommendations = [], isLoading: isLoadingSent } = useQuery({
    queryKey: ["sentRecommendations", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Get recommendations with games
      const { data: recommendationsData, error: recError } = await supabase
        .from("game_recommendations")
        .select(`
          *,
          games (
            id,
            title,
            cover_image_url,
            genre
          )
        `)
        .eq("recommender_id", user.id)
        .order("created_at", { ascending: false });

      if (recError) throw recError;
      if (!recommendationsData || recommendationsData.length === 0) return [];

      // Get recipient IDs
      const recipientIds = recommendationsData.map(r => r.recipient_id);

      // Get profiles for recipients
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .in("id", recipientIds);

      if (profilesError) throw profilesError;

      // Combine the data
      return recommendationsData.map(rec => ({
        ...rec,
        profiles: profilesData?.find(p => p.id === rec.recipient_id) || {
          id: rec.recipient_id,
          username: null,
          display_name: null,
          avatar_url: null,
        }
      })) as GameRecommendation[];
    },
    enabled: !!user,
  });

  const sendRecommendation = useMutation({
    mutationFn: async ({ 
      recipientId, 
      gameId, 
      message 
    }: { 
      recipientId: string; 
      gameId: string; 
      message?: string;
    }) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("game_recommendations")
        .insert({
          recommender_id: user.id,
          recipient_id: recipientId,
          game_id: gameId,
          message,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sentRecommendations", user?.id] });
    },
  });

  const markAsRead = useMutation({
    mutationFn: async (recommendationId: string) => {
      const { data, error } = await supabase
        .from("game_recommendations")
        .update({ is_read: true })
        .eq("id", recommendationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receivedRecommendations", user?.id] });
    },
  });

  return {
    receivedRecommendations,
    sentRecommendations,
    isLoading,
    isLoadingSent,
    sendRecommendation,
    markAsRead,
  };
};
