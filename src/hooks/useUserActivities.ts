
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: string;
  title: string;
  description: string | null;
  data: any;
  created_at: string;
  profiles: {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

export const useUserActivities = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["userActivities", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("user_activities")
        .select(`
          *,
          profiles!user_activities_user_id_fkey (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as UserActivity[];
    },
    enabled: !!user,
  });
};
