
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
      console.log("Fetching all groups...");
      const { data, error } = await supabase
        .from("gaming_groups")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching groups:", error);
        throw error;
      }
      console.log("Groups fetched:", data);
      return data as GamingGroup[];
    },
  });

  const { data: myGroups = [], isLoading: isLoadingMyGroups } = useQuery({
    queryKey: ["myGroups", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      console.log("Fetching my groups for user:", user.id);
      const { data, error } = await supabase
        .from("group_members")
        .select(`
          *,
          gaming_groups (*)
        `)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching my groups:", error);
        throw error;
      }
      console.log("My groups fetched:", data);
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

      console.log("Creating group with data:", { name, description, isPrivate, created_by: user.id });

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

      if (error) {
        console.error("Error creating group:", error);
        throw error;
      }
      console.log("Group created successfully:", data);
      return data;
    },
    onSuccess: () => {
      console.log("Invalidating queries after group creation");
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["myGroups", user?.id] });
    },
    onError: (error) => {
      console.error("Create group mutation failed:", error);
    }
  });

  const joinGroup = useMutation({
    mutationFn: async (groupId: string) => {
      if (!user) throw new Error("User not authenticated");

      console.log("Joining group:", groupId, "for user:", user.id);

      const { data, error } = await supabase
        .from("group_members")
        .insert({
          group_id: groupId,
          user_id: user.id,
          role: "member"
        })
        .select()
        .single();

      if (error) {
        console.error("Error joining group:", error);
        throw error;
      }
      console.log("Successfully joined group:", data);
      return data;
    },
    onSuccess: () => {
      console.log("Invalidating queries after joining group");
      queryClient.invalidateQueries({ queryKey: ["myGroups", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
    onError: (error) => {
      console.error("Join group mutation failed:", error);
    }
  });

  const leaveGroup = useMutation({
    mutationFn: async (groupId: string) => {
      if (!user) throw new Error("User not authenticated");

      console.log("Leaving group:", groupId, "for user:", user.id);

      const { error } = await supabase
        .from("group_members")
        .delete()
        .eq("group_id", groupId)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error leaving group:", error);
        throw error;
      }
      console.log("Successfully left group:", groupId);
    },
    onSuccess: () => {
      console.log("Invalidating queries after leaving group");
      queryClient.invalidateQueries({ queryKey: ["myGroups", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
    onError: (error) => {
      console.error("Leave group mutation failed:", error);
    }
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
