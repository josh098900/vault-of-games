
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface GamingGroup {
  id: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  is_private: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  member_count: number;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: "owner" | "admin" | "member";
  joined_at: string;
  profiles: {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export const useGroups = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gaming_groups")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as GamingGroup[];
    },
  });

  const { data: myGroups = [], isLoading: isLoadingMyGroups } = useQuery({
    queryKey: ["myGroups", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("group_members")
        .select(`
          *,
          gaming_groups (*)
        `)
        .eq("user_id", user.id);

      if (error) throw error;
      return data.map(item => item.gaming_groups) as GamingGroup[];
    },
    enabled: !!user,
  });

  const createGroup = useMutation({
    mutationFn: async ({ name, description, isPrivate }: { 
      name: string; 
      description?: string; 
      isPrivate?: boolean;
    }) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("gaming_groups")
        .insert({
          name,
          description,
          is_private: isPrivate || false,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["myGroups", user?.id] });
    },
  });

  const joinGroup = useMutation({
    mutationFn: async (groupId: string) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("group_members")
        .insert({
          group_id: groupId,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myGroups", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });

  const leaveGroup = useMutation({
    mutationFn: async (groupId: string) => {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("group_members")
        .delete()
        .eq("group_id", groupId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myGroups", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });

  return {
    groups,
    myGroups,
    isLoading,
    isLoadingMyGroups,
    createGroup,
    joinGroup,
    leaveGroup,
  };
};
