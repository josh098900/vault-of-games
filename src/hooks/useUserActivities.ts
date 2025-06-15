
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
      
      // First get the activities
      const { data: activities, error: activitiesError } = await supabase
        .from("user_activities")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (activitiesError) throw activitiesError;
      if (!activities || activities.length === 0) return [];

      // Get unique user IDs from activities
      const userIds = [...new Set(activities.map(activity => activity.user_id))];
      
      // Get profiles for these users
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      // Combine activities with profiles
      const activitiesWithProfiles = activities.map(activity => ({
        ...activity,
        profiles: profiles?.find(profile => profile.id === activity.user_id) || null
      }));

      return activitiesWithProfiles as UserActivity[];
    },
    enabled: !!user,
  });
};
