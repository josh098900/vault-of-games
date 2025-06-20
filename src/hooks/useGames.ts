
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Game } from "./useUserGames";

export const useGames = () => {
  return useQuery({
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
};
