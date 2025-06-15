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
      console.log('Fetching live gaming sessions...');
      
      // First, let's try a simpler query to see if basic data is there
      const { data: basicSessions, error: basicError } = await supabase
        .from('live_gaming_sessions')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (basicError) {
        console.error('Error fetching basic sessions:', basicError);
        throw basicError;
      }

      console.log('Basic sessions found:', basicSessions?.length || 0);

      // Now fetch with joins
      const { data, error } = await supabase
        .from('live_gaming_sessions')
        .select(`
          *,
          games(title, cover_image_url),
          profiles(username, display_name, avatar_url),
          gaming_session_participants(
            id,
            user_id,
            role,
            joined_at,
            left_at
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching live gaming sessions with joins:', error);
        // Fallback to basic query if joins fail
        return basicSessions || [];
      }

      console.log('Fetched sessions with joins:', data?.length || 0);
      console.log('Session data:', data);
      
      return data || [];
    },
    enabled: !!user,
    refetchInterval: 10000, // Refetch every 10 seconds as backup
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    console.log('Setting up real-time subscription for live gaming sessions');
    
    const channel = supabase
      .channel('live-gaming-sessions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_gaming_sessions'
        },
        (payload) => {
          console.log('Live gaming session change detected:', payload);
          // Force immediate refetch
          queryClient.invalidateQueries({ queryKey: ['live-gaming-sessions'] });
          queryClient.refetchQueries({ queryKey: ['live-gaming-sessions'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'gaming_session_participants'
        },
        (payload) => {
          console.log('Gaming session participant change detected:', payload);
          // Force immediate refetch
          queryClient.invalidateQueries({ queryKey: ['live-gaming-sessions'] });
          queryClient.refetchQueries({ queryKey: ['live-gaming-sessions'] });
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
      });

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

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
      console.log('Creating gaming session with data:', {
        gameId,
        sessionType,
        description,
        maxParticipants,
        isPublic
      });

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('live_gaming_sessions')
        .insert({
          game_id: gameId,
          session_type: sessionType,
          description,
          max_participants: maxParticipants,
          is_public: isPublic,
          user_id: user.user.id,
          status: 'active', // Explicitly set status
          current_participants: 1 // Start with 1 participant (the creator)
        })
        .select(`
          *,
          games(title, cover_image_url),
          profiles(username, display_name, avatar_url)
        `)
        .single();

      if (error) {
        console.error('Error creating gaming session:', error);
        throw error;
      }

      console.log('Created gaming session:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Gaming session created successfully');
      console.log('New session data:', data);
      
      // Force immediate refetch and invalidation
      queryClient.invalidateQueries({ queryKey: ['live-gaming-sessions'] });
      queryClient.refetchQueries({ queryKey: ['live-gaming-sessions'] });
      
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
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('gaming_session_participants')
        .insert({
          session_id: sessionId,
          user_id: user.user.id,
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
