
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

interface LiveSessionMessage {
  id: string;
  session_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

export const useLiveSessionMessages = (sessionId: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['live-session-messages', sessionId],
    queryFn: async () => {
      if (!sessionId) return [];

      try {
        // First, get the messages without the join
        const { data: messages, error: messagesError } = await supabase
          .from('live_session_messages' as any)
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true });

        if (messagesError) {
          console.error('Error fetching messages:', messagesError);
          throw messagesError;
        }

        if (!messages || messages.length === 0) {
          return [];
        }

        // Get unique user IDs from messages
        const userIds = [...new Set(messages.map((msg: any) => msg.user_id))];

        // Fetch profiles for all users
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .in('id', userIds);

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          // Continue without profiles if fetch fails
        }

        // Combine messages with profiles
        const messagesWithProfiles = messages.map((message: any) => {
          const profile = profiles?.find((p) => p.id === message.user_id);
          return {
            ...message,
            profiles: profile ? {
              username: profile.username,
              display_name: profile.display_name,
              avatar_url: profile.avatar_url
            } : undefined
          };
        });

        return messagesWithProfiles as LiveSessionMessage[];
      } catch (error) {
        console.error('Failed to fetch session messages:', error);
        return [];
      }
    },
    enabled: !!sessionId,
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`live-session-messages-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'live_session_messages',
          filter: `session_id=eq.${sessionId}`
        },
        () => {
          console.log('New message received, refetching...');
          query.refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, query]);

  return query;
};

export const useSendSessionMessage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, content }: { sessionId: string; content: string }) => {
      if (!user) throw new Error('User not authenticated');

      try {
        const { data, error } = await supabase
          .from('live_session_messages' as any)
          .insert({
            session_id: sessionId,
            user_id: user.id,
            content: content.trim()
          })
          .select('*')
          .single();

        if (error) {
          console.error('Error sending message:', error);
          throw error;
        }

        if (!data) {
          throw new Error('No data returned from message insert');
        }

        // Get user profile separately
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, display_name, avatar_url')
          .eq('id', user.id)
          .single();

        // Create the return object with proper typing
        const messageWithProfile: LiveSessionMessage = {
          id: data.id,
          session_id: data.session_id,
          user_id: data.user_id,
          content: data.content,
          created_at: data.created_at,
          updated_at: data.updated_at,
          profiles: profile ? {
            username: profile.username,
            display_name: profile.display_name,
            avatar_url: profile.avatar_url
          } : undefined
        };

        return messageWithProfile;
      } catch (error) {
        console.error('Failed to send message:', error);
        throw error;
      }
    },
    onSuccess: (_, { sessionId }) => {
      queryClient.invalidateQueries({ queryKey: ['live-session-messages', sessionId] });
    },
  });
};
