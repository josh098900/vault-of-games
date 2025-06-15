
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Tables } from '@/integrations/supabase/types';

export type EnhancedUserPresence = Tables<'user_presence'> & {
  games?: { title: string; cover_image_url?: string };
};

export const useEnhancedUserPresence = (userId: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['enhanced-user-presence', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_presence')
        .select(`
          *,
          games(title, cover_image_url)
        `)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user presence:', error);
        throw error;
      }

      return data;
    },
    enabled: !!userId,
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`user-presence-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence',
          filter: `user_id=eq.${userId}`
        },
        () => {
          query.refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, query]);

  return query;
};

export const useUpdateUserPresence = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      status,
      gameStatus,
      currentGameId,
      mood,
      customStatus,
      progressData
    }: {
      status?: string;
      gameStatus?: string;
      currentGameId?: string;
      mood?: string;
      customStatus?: string;
      progressData?: Record<string, any>;
    }) => {
      if (!user) throw new Error('User must be authenticated');

      const updateData: any = {
        updated_at: new Date().toISOString(),
        last_seen: new Date().toISOString()
      };

      if (status !== undefined) updateData.status = status;
      if (gameStatus !== undefined) updateData.game_status = gameStatus;
      if (currentGameId !== undefined) updateData.current_game_id = currentGameId;
      if (mood !== undefined) updateData.mood = mood;
      if (customStatus !== undefined) updateData.custom_status = customStatus;
      if (progressData !== undefined) updateData.progress_data = progressData;

      const { data, error } = await supabase
        .from('user_presence')
        .upsert({
          user_id: user.id,
          ...updateData
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-user-presence'] });
    },
  });
};
