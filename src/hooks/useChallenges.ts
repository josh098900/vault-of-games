
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface GamingChallenge {
  id: string;
  title: string;
  description: string | null;
  challenge_type: "game_completion" | "hours_played" | "achievement" | "custom";
  target_value: number | null;
  game_id: string | null;
  created_by: string;
  start_date: string;
  end_date: string | null;
  is_group_challenge: boolean;
  group_id: string | null;
  created_at: string;
  games?: {
    id: string;
    title: string;
    cover_image_url: string | null;
  };
}

export interface ChallengeParticipant {
  id: string;
  challenge_id: string;
  user_id: string;
  status: "active" | "completed" | "failed" | "withdrawn";
  progress: number;
  completed_at: string | null;
  joined_at: string;
  profiles: {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export const useChallenges = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ["challenges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gaming_challenges")
        .select(`
          *,
          games (
            id,
            title,
            cover_image_url
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as GamingChallenge[];
    },
  });

  const { data: myChallenges = [], isLoading: isLoadingMyChallenges } = useQuery({
    queryKey: ["myChallenges", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("challenge_participants")
        .select(`
          *,
          gaming_challenges (
            *,
            games (
              id,
              title,
              cover_image_url
            )
          )
        `)
        .eq("user_id", user.id);

      if (error) throw error;
      return data.map(item => item.gaming_challenges) as GamingChallenge[];
    },
    enabled: !!user,
  });

  const createChallenge = useMutation({
    mutationFn: async (challengeData: {
      title: string;
      description?: string;
      challenge_type: "game_completion" | "hours_played" | "achievement" | "custom";
      target_value?: number;
      game_id?: string;
      end_date?: string;
      is_group_challenge?: boolean;
      group_id?: string;
    }) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("gaming_challenges")
        .insert({
          ...challengeData,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
    },
  });

  const joinChallenge = useMutation({
    mutationFn: async (challengeId: string) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("challenge_participants")
        .insert({
          challenge_id: challengeId,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myChallenges", user?.id] });
    },
  });

  const updateProgress = useMutation({
    mutationFn: async ({ challengeId, progress }: { challengeId: string; progress: number }) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("challenge_participants")
        .update({ progress })
        .eq("challenge_id", challengeId)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myChallenges", user?.id] });
    },
  });

  return {
    challenges,
    myChallenges,
    isLoading,
    isLoadingMyChallenges,
    createChallenge,
    joinChallenge,
    updateProgress,
  };
};
