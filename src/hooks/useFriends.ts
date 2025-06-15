
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UserFollow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
  profiles: {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export const useFriends = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: following = [], isLoading: isLoadingFollowing } = useQuery({
    queryKey: ["following", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("user_follows")
        .select(`
          *,
          profiles!user_follows_following_id_fkey (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq("follower_id", user.id);

      if (error) throw error;
      return data as UserFollow[];
    },
    enabled: !!user,
  });

  const { data: followers = [], isLoading: isLoadingFollowers } = useQuery({
    queryKey: ["followers", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("user_follows")
        .select(`
          *,
          profiles!user_follows_follower_id_fkey (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq("following_id", user.id);

      if (error) throw error;
      return data as UserFollow[];
    },
    enabled: !!user,
  });

  const followUser = useMutation({
    mutationFn: async (followingId: string) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("user_follows")
        .insert({
          follower_id: user.id,
          following_id: followingId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["following", user?.id] });
    },
  });

  const unfollowUser = useMutation({
    mutationFn: async (followingId: string) => {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("user_follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", followingId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["following", user?.id] });
    },
  });

  const isFollowing = (userId: string) => {
    return following.some(follow => follow.following_id === userId);
  };

  return {
    following,
    followers,
    isLoadingFollowing,
    isLoadingFollowers,
    followUser,
    unfollowUser,
    isFollowing,
  };
};
