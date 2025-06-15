
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface SearchUser {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
}

export const useUserSearch = (searchTerm: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["userSearch", searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];
      
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .or(`username.ilike.%${searchTerm}%,display_name.ilike.%${searchTerm}%`)
        .neq("id", user?.id || "")
        .limit(10);

      if (error) throw error;
      return data as SearchUser[];
    },
    enabled: !!searchTerm && searchTerm.length >= 2,
  });
};
