
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useEffect } from 'react';

export interface DiscussionDetail {
  id: string;
  title: string;
  content: string;
  category: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  tags: string[];
  replies_count: number;
  likes_count: number;
  views_count: number;
  last_activity_at: string;
  profiles?: {
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  is_liked?: boolean;
}

export const useDiscussionDetail = (discussionId: string) => {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['discussion', discussionId],
    queryFn: async () => {
      // Increment view count
      const { error: viewError } = await supabase.rpc('increment_discussion_views', {
        discussion_uuid: discussionId
      });
      
      if (viewError) {
        console.error('Error incrementing views:', viewError);
      }

      const { data, error } = await supabase
        .from('discussions')
        .select(`
          *,
          profiles!discussions_user_id_fkey (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('id', discussionId)
        .single();
      
      if (error) {
        console.error('Error fetching discussion:', error);
        throw error;
      }

      // If user is logged in, check if they've liked this discussion
      if (user && data) {
        const { data: like } = await supabase
          .from('discussion_likes')
          .select('id')
          .eq('discussion_id', discussionId)
          .eq('user_id', user.id)
          .single();

        return {
          ...data,
          is_liked: !!like,
          profiles: data.profiles || null
        };
      }

      return {
        ...data,
        is_liked: false,
        profiles: data.profiles || null
      };
    },
    enabled: !!discussionId,
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!discussionId) return;

    const channel = supabase
      .channel('discussion-detail')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'discussions',
          filter: `id=eq.${discussionId}`
        },
        () => {
          // Refresh the discussion data when it changes
          query.refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'discussion_likes',
          filter: `discussion_id=eq.${discussionId}`
        },
        () => {
          // Refresh when likes change
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

export const useLikeDiscussion = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ discussionId, isLiked }: { discussionId: string; isLiked: boolean }) => {
      if (!user) throw new Error('User must be authenticated');

      if (isLiked) {
        // Unlike: remove the like
        const { error } = await supabase
          .from('discussion_likes')
          .delete()
          .eq('discussion_id', discussionId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Like: add the like
        const { error } = await supabase
          .from('discussion_likes')
          .insert([
            {
              discussion_id: discussionId,
              user_id: user.id,
            }
          ]);

        if (error) throw error;
      }
    },
    onSuccess: (_, { discussionId }) => {
      queryClient.invalidateQueries({ queryKey: ['discussion', discussionId] });
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
    },
    onError: (error) => {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      });
    },
  });
};
