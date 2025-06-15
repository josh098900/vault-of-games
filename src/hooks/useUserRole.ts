
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type UserRole = "admin" | "moderator" | "user";

export const useUserRole = () => {
  const { user } = useAuth();

  const { data: userRole, isLoading } = useQuery({
    queryKey: ["user-role", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase.rpc("get_current_user_role");
      
      if (error) {
        console.error("Error fetching user role:", error);
        return "user" as UserRole;
      }
      
      return (data as UserRole) || "user";
    },
    enabled: !!user,
  });

  const isAdmin = userRole === "admin";
  const isModerator = userRole === "moderator";
  const canReviewSubmissions = isAdmin || isModerator;

  return {
    userRole,
    isLoading,
    isAdmin,
    isModerator,
    canReviewSubmissions,
  };
};
