
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { GameSubmission } from "./useGameSubmission";

export const useAdminSubmissions = () => {
  const queryClient = useQueryClient();

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ["admin-submissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("game_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as GameSubmission[];
    },
  });

  const approveSubmission = useMutation({
    mutationFn: async (submissionId: string) => {
      const { data, error } = await supabase.rpc("approve_game_submission", {
        submission_id: submissionId,
        admin_user_id: (await supabase.auth.getUser()).data.user?.id!,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-submissions"] });
      toast({
        title: "Submission approved!",
        description: "The game has been added to the database.",
      });
    },
    onError: (error) => {
      console.error("Error approving submission:", error);
      toast({
        title: "Approval failed",
        description: "Failed to approve submission. Please try again.",
        variant: "destructive",
      });
    },
  });

  const rejectSubmission = useMutation({
    mutationFn: async ({ submissionId, reason }: { submissionId: string; reason?: string }) => {
      const { error } = await supabase.rpc("reject_game_submission", {
        submission_id: submissionId,
        admin_user_id: (await supabase.auth.getUser()).data.user?.id!,
        rejection_reason: reason || "",
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-submissions"] });
      toast({
        title: "Submission rejected",
        description: "The submitter has been notified.",
      });
    },
    onError: (error) => {
      console.error("Error rejecting submission:", error);
      toast({
        title: "Rejection failed",
        description: "Failed to reject submission. Please try again.",
        variant: "destructive",
      });
    },
  });

  const pendingSubmissions = submissions.filter(sub => sub.status === "pending");
  const reviewedSubmissions = submissions.filter(sub => sub.status !== "pending");

  return {
    submissions,
    pendingSubmissions,
    reviewedSubmissions,
    isLoading,
    approveSubmission,
    rejectSubmission,
    isApproving: approveSubmission.isPending,
    isRejecting: rejectSubmission.isPending,
  };
};
