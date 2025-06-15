
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export interface GameSubmissionData {
  title: string;
  description?: string;
  genre: string;
  platform: string;
  release_year?: number;
  developer?: string;
  publisher?: string;
  cover_image_url?: string;
}

export interface GameSubmission {
  id: string;
  title: string;
  description: string | null;
  genre: string | null;
  platform: string | null;
  release_year: number | null;
  developer: string | null;
  publisher: string | null;
  cover_image_url: string | null;
  status: "pending" | "approved" | "rejected";
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
}

export const useGameSubmission = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const submitGame = useMutation({
    mutationFn: async (data: GameSubmissionData) => {
      if (!user) throw new Error("User must be authenticated");

      const { error } = await supabase
        .from("game_submissions")
        .insert({
          ...data,
          submitted_by: user.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["game-submissions"] });
    },
    onError: (error) => {
      console.error("Error submitting game:", error);
      toast({
        title: "Submission failed",
        description: "Failed to submit game. Please try again.",
        variant: "destructive",
      });
    },
  });

  const { data: userSubmissions = [], isLoading: isLoadingSubmissions } = useQuery({
    queryKey: ["game-submissions", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("game_submissions")
        .select("*")
        .eq("submitted_by", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as GameSubmission[];
    },
    enabled: !!user,
  });

  return {
    submitGame,
    isSubmitting: submitGame.isPending,
    userSubmissions,
    isLoadingSubmissions,
  };
};
