
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

export type LiveGamingSession = Tables<'live_gaming_sessions'>;
export type GamingSessionParticipant = Tables<'gaming_session_participants'>;

export const useLiveGamingSessions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['live-gaming-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('live_gaming_sessions')
        .select(`
          *,
          games(title, cover_image_url),
          profiles(username, display_name, avatar_url),
          gaming_session_participants(*)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching live gaming sessions:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user,
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('live-gaming-sessions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_gaming_sessions'
        },
        () => {
          query.refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'gaming_session_participants'
        },
        () => {
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

export const useCreateGamingSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      gameId,
      sessionType,
      description,
      maxParticipants,
      isPublic = true
    }: {
      gameId: string;
      sessionType: 'playing' | 'streaming' | 'looking_for_party';
      description?: string;
      maxParticipants?: number;
      isPublic?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('live_gaming_sessions')
        .insert({
          game_id: gameId,
          session_type: sessionType,
          description,
          max_participants: maxParticipants,
          is_public: isPublic,
          user_id: (await supabase.auth.getUser()).data.user!.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-gaming-sessions'] });
      toast({
        title: "Gaming session started!",
        description: "Your live gaming session is now active.",
      });
    },
    onError: (error) => {
      console.error('Error creating gaming session:', error);
      toast({
        title: "Error",
        description: "Failed to start gaming session. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useJoinGamingSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, role = 'participant' }: {
      sessionId: string;
      role?: 'participant' | 'spectator';
    }) => {
      const { data, error } = await supabase
        .from('gaming_session_participants')
        .insert({
          session_id: sessionId,
          user_id: (await supabase.auth.getUser()).data.user!.id,
          role
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-gaming-sessions'] });
      toast({
        title: "Joined session!",
        description: "You've successfully joined the gaming session.",
      });
    },
    onError: (error) => {
      console.error('Error joining gaming session:', error);
      toast({
        title: "Error",
        description: "Failed to join gaming session. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useEndGamingSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { data, error } = await supabase
        .from('live_gaming_sessions')
        .update({ 
          status: 'ended', 
          ended_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-gaming-sessions'] });
      toast({
        title: "Session ended",
        description: "Your gaming session has been ended.",
      });
    },
  });
};
