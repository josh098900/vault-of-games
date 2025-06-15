
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

export type AchievementNotification = Tables<'achievement_notifications'>;

export const useAchievementNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['achievement-notifications'],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('achievement_notifications')
        .select('*')
        .eq('user_id', user.id)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching achievement notifications:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user,
  });

  // Set up real-time subscription for new achievements
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('achievement-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'achievement_notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newAchievement = payload.new as AchievementNotification;
          
          // Show celebratory toast
          toast({
            title: "🎉 Achievement Unlocked!",
            description: newAchievement.achievement_title,
          });

          // Refresh the query
          query.refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, query]);

  return query;
};

export const useCreateAchievement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      gameId,
      achievementType,
      achievementTitle,
      achievementDescription,
      achievementData = {}
    }: {
      gameId: string;
      achievementType: string;
      achievementTitle: string;
      achievementDescription?: string;
      achievementData?: Record<string, any>;
    }) => {
      const { data, error } = await supabase
        .from('achievement_notifications')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user!.id,
          game_id: gameId,
          achievement_type: achievementType,
          achievement_title: achievementTitle,
          achievement_description: achievementDescription,
          achievement_data: achievementData
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievement-notifications'] });
    },
  });
};
