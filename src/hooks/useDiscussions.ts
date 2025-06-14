
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Discussion {
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
  };
  is_liked?: boolean;
}

export const useDiscussions = (searchQuery?: string, category?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['discussions', searchQuery, category],
    queryFn: async () => {
      let query = supabase
        .from('discussions')
        .select(`
          *,
          profiles!discussions_user_id_fkey (
            username,
            display_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (category && category !== 'All Categories') {
        query = query.eq('category', category);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching discussions:', error);
        throw error;
      }

      // If user is logged in, check which discussions they've liked
      if (user && data) {
        const { data: likes } = await supabase
          .from('discussion_likes')
          .select('discussion_id')
          .eq('user_id', user.id);

        const likedDiscussionIds = new Set(likes?.map(like => like.discussion_id) || []);
        
        return data.map(discussion => ({
          ...discussion,
          is_liked: likedDiscussionIds.has(discussion.id)
        }));
      }

      return data || [];
    },
  });
};

export const useCreateDiscussion = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newDiscussion: {
      title: string;
      content: string;
      category: string;
      tags: string[];
    }) => {
      if (!user) throw new Error('User must be authenticated');

      const { data, error } = await supabase
        .from('discussions')
        .insert([
          {
            ...newDiscussion,
            user_id: user.id,
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
      toast({
        title: "Discussion created!",
        description: "Your discussion has been posted to the community.",
      });
    },
    onError: (error) => {
      console.error('Error creating discussion:', error);
      toast({
        title: "Error",
        description: "Failed to create discussion. Please try again.",
        variant: "destructive",
      });
    },
  });
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
    onSuccess: () => {
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
