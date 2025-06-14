
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Game } from "./useUserGames";

export const useGames = () => {
  const { data: games = [], isLoading } = useQuery({
    queryKey: ["games"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .order("title");

      if (error) throw error;
      return data as Game[];
    },
  });

  return {
    games,
    isLoading,
  };
};
