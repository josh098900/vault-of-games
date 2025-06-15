
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type GameStatus = "playing" | "completed" | "wishlist" | "backlog" | "dropped";

export interface Game {
  id: string;
  title: string;
  description: string | null;
  genre: string | null;
  platform: string | null;
  release_year: number | null;
  cover_image_url: string | null;
  developer: string | null;
  publisher: string | null;
}

export interface UserGame {
  id: string;
  game_id: string;
  status: GameStatus;
  user_rating: number | null;
  hours_played: number | null;
  notes: string | null;
  started_at: string | null;
  completed_at: string | null;
  games: Game;
}

export const useUserGames = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: userGames = [], isLoading } = useQuery({
    queryKey: ["userGames", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("user_games")
        .select(`
          *,
          games (*)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as UserGame[];
    },
    enabled: !!user,
  });

  const addGameToLibrary = useMutation({
    mutationFn: async ({ gameId, status }: { gameId: string; status: GameStatus }) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("user_games")
        .insert({
          user_id: user.id,
          game_id: gameId,
          status,
        })
        .select(`
          *,
          games (*)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userGames", user?.id] });
    },
  });

  const updateGameStatus = useMutation({
    mutationFn: async ({ userGameId, status, rating }: { 
      userGameId: string; 
      status: GameStatus; 
      rating?: number;
    }) => {
      const updateData: any = { status };
      
      if (status === "completed") {
        updateData.completed_at = new Date().toISOString();
      }
      if (status === "playing" && !userGames.find(ug => ug.id === userGameId)?.started_at) {
        updateData.started_at = new Date().toISOString();
      }
      if (rating) {
        updateData.user_rating = rating;
      }

      const { data, error } = await supabase
        .from("user_games")
        .update(updateData)
        .eq("id", userGameId)
        .select(`
          *,
          games (*)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userGames", user?.id] });
    },
  });

  const updateGameHours = useMutation({
    mutationFn: async ({ userGameId, hoursPlayed }: { 
      userGameId: string; 
      hoursPlayed: number;
    }) => {
      const { data, error } = await supabase
        .from("user_games")
        .update({ hours_played: hoursPlayed })
        .eq("id", userGameId)
        .select(`
          *,
          games (*)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userGames", user?.id] });
    },
  });

  const removeGameFromLibrary = useMutation({
    mutationFn: async (userGameId: string) => {
      const { error } = await supabase
        .from("user_games")
        .delete()
        .eq("id", userGameId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userGames", user?.id] });
    },
  });

  return {
    userGames,
    isLoading,
    addGameToLibrary,
    updateGameStatus,
    updateGameHours,
    removeGameFromLibrary,
  };
};
