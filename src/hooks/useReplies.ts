
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useEffect } from 'react';

export interface Reply {
  id: string;
  content: string;
  discussion_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

export const useReplies = (discussionId: string) => {
  const query = useQuery({
    queryKey: ['replies', discussionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('discussion_replies')
        .select(`
          *,
          profiles!discussion_replies_user_id_fkey (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('discussion_id', discussionId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching replies:', error);
        throw error;
      }

      return data?.map(reply => ({
        ...reply,
        profiles: reply.profiles || null
      })) || [];
    },
    enabled: !!discussionId,
  });

  // Set up real-time subscription for replies
  useEffect(() => {
    if (!discussionId) return;

    const channel = supabase
      .channel('discussion-replies')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'discussion_replies',
          filter: `discussion_id=eq.${discussionId}`
        },
        () => {
          // Refresh replies when they change
          query.refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [discussionId, query]);

  return query;
};

export const useCreateReply = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newReply: {
      discussionId: string;
      content: string;
    }) => {
      if (!user) throw new Error('User must be authenticated');

      const { data, error } = await supabase
        .from('discussion_replies')
        .insert([
          {
            discussion_id: newReply.discussionId,
            content: newReply.content,
            user_id: user.id,
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['replies', variables.discussionId] });
      queryClient.invalidateQueries({ queryKey: ['discussion', variables.discussionId] });
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
      toast({
        title: "Reply posted!",
        description: "Your reply has been added to the discussion.",
      });
    },
    onError: (error) => {
      console.error('Error creating reply:', error);
      toast({
        title: "Error",
        description: "Failed to post reply. Please try again.",
        variant: "destructive",
      });
    },
  });
};
