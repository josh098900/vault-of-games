
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export interface DirectMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  parent_message_id?: string;
  thread_count: number;
  sender_profile?: {
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  };
  reactions?: MessageReaction[];
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  reaction_type: 'like' | 'heart' | 'thumbs_up' | 'laugh' | 'sad' | 'angry';
  created_at: string;
  user_profile?: {
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export interface UserPresence {
  user_id: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  last_seen: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  last_message_at: string;
  created_at: string;
  other_user_id: string;
  other_user_profile?: {
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  };
  last_message?: string;
  unread_count: number;
}

export const useConversations = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get conversations where user is participant
      const { data: conversations, error } = await supabase
        .from("message_conversations")
        .select("*")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order("last_message_at", { ascending: false });

      if (error) throw error;
      if (!conversations || conversations.length === 0) return [];

      // Process conversations to get other user details and last messages
      const conversationsWithData = await Promise.all(
        conversations.map(async (conv) => {
          // Determine the other user ID
          const otherUserId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id;
          
          // Get other user's profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("username, display_name, avatar_url")
            .eq("id", otherUserId)
            .single();

          // Get the most recent message in this conversation
          const { data: lastMessageData } = await supabase
            .from("direct_messages")
            .select("content, created_at, sender_id")
            .or(`and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`)
            .order("created_at", { ascending: false })
            .limit(1);

          const lastMessage = lastMessageData && lastMessageData.length > 0 ? lastMessageData[0] : null;

          // Count unread messages from the other user to current user
          const { count: unreadCount } = await supabase
            .from("direct_messages")
            .select("*", { count: "exact", head: true })
            .eq("recipient_id", user.id)
            .eq("sender_id", otherUserId)
            .eq("is_read", false);

          return {
            ...conv,
            other_user_id: otherUserId,
            other_user_profile: profile,
            last_message: lastMessage?.content,
            unread_count: unreadCount || 0
          };
        })
      );

      return conversationsWithData as Conversation[];
    },
    enabled: !!user,
  });
};

export const useMessages = (otherUserId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["messages", user?.id, otherUserId],
    queryFn: async () => {
      if (!user || !otherUserId) return [];

      // Get all messages between current user and the other user
      const { data: messages, error } = await supabase
        .from("direct_messages")
        .select("*")
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        throw error;
      }

      if (!messages || messages.length === 0) return [];

      // Get unique sender IDs to fetch their profiles
      const senderIds = [...new Set(messages.map(msg => msg.sender_id))];
      
      // Fetch profiles for all senders
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .in("id", senderIds);

      // Create a profile lookup map
      const profileMap = new Map();
      profiles?.forEach(profile => {
        profileMap.set(profile.id, profile);
      });

      // Attach profiles to messages
      const messagesWithProfiles = messages.map(message => ({
        ...message,
        sender_profile: profileMap.get(message.sender_id) || null
      }));

      return messagesWithProfiles as DirectMessage[];
    },
    enabled: !!user && !!otherUserId,
  });
};

export const useMessageReactions = (messageId: string, isGroupMessage = false) => {
  return useQuery({
    queryKey: ["message_reactions", messageId, isGroupMessage],
    queryFn: async () => {
      if (!messageId) return [];

      const table = isGroupMessage ? "group_message_reactions" : "message_reactions";
      
      const { data: reactions, error } = await supabase
        .from(table)
        .select(`
          id,
          message_id,
          user_id,
          reaction_type,
          created_at
        `)
        .eq("message_id", messageId);

      if (error) throw error;
      return reactions || [];
    },
    enabled: !!messageId,
  });
};

export const useUserPresence = (userId?: string) => {
  return useQuery({
    queryKey: ["user_presence", userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from("user_presence")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data as UserPresence | null;
    },
    enabled: !!userId,
  });
};

export const useUnreadMessageCount = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["unread_messages_count", user?.id],
    queryFn: async () => {
      if (!user) return 0;

      const { count, error } = await supabase
        .from("direct_messages")
        .select("*", { count: "exact", head: true })
        .eq("recipient_id", user.id)
        .eq("is_read", false);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('unread-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `recipient_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.new && payload.new.recipient_id === user.id && payload.new.sender_id !== user.id) {
            query.refetch();
            queryClient.invalidateQueries({ queryKey: ["conversations", user.id] });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'direct_messages',
          filter: `recipient_id=eq.${user.id}`
        },
        (payload) => {
          query.refetch();
          queryClient.invalidateQueries({ queryKey: ["conversations", user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, query, queryClient]);

  return query;
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ recipientId, content }: { recipientId: string; content: string }) => {
      const { data, error } = await supabase
        .from("direct_messages")
        .insert({
          sender_id: user!.id,
          recipient_id: recipientId,
          content,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { recipientId }) => {
      queryClient.invalidateQueries({ queryKey: ["messages", user?.id, recipientId] });
      queryClient.invalidateQueries({ queryKey: ["conversations", user?.id] });
    },
  });
};

export const useAddReaction = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      messageId, 
      reactionType, 
      isGroupMessage = false 
    }: { 
      messageId: string; 
      reactionType: string; 
      isGroupMessage?: boolean;
    }) => {
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      const table = isGroupMessage ? "group_message_reactions" : "message_reactions";
      
      // First check if reaction already exists
      const { data: existingReaction, error: checkError } = await supabase
        .from(table)
        .select("id")
        .eq("message_id", messageId)
        .eq("user_id", user.id)
        .eq("reaction_type", reactionType)
        .maybeSingle();

      if (checkError) throw checkError;
      if (existingReaction) return existingReaction;

      const { data, error } = await supabase
        .from(table)
        .insert({
          message_id: messageId,
          user_id: user.id,
          reaction_type: reactionType,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') return null;
        throw error;
      }
      
      return data;
    },
    onSuccess: (_, { messageId, isGroupMessage }) => {
      queryClient.invalidateQueries({ 
        queryKey: ["message_reactions", messageId, isGroupMessage] 
      });
      queryClient.refetchQueries({ 
        queryKey: ["message_reactions", messageId, isGroupMessage] 
      });
    },
  });
};

export const useRemoveReaction = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      messageId, 
      reactionType, 
      isGroupMessage = false 
    }: { 
      messageId: string; 
      reactionType: string; 
      isGroupMessage?: boolean;
    }) => {
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      const table = isGroupMessage ? "group_message_reactions" : "message_reactions";
      
      const { error } = await supabase
        .from(table)
        .delete()
        .eq("message_id", messageId)
        .eq("user_id", user.id)
        .eq("reaction_type", reactionType);

      if (error) throw error;
    },
    onSuccess: (_, { messageId, isGroupMessage }) => {
      queryClient.invalidateQueries({ 
        queryKey: ["message_reactions", messageId, isGroupMessage] 
      });
      queryClient.refetchQueries({ 
        queryKey: ["message_reactions", messageId, isGroupMessage] 
      });
    },
  });
};

export const useUpdatePresence = () => {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (status: 'online' | 'away' | 'busy' | 'offline') => {
      if (!user) return;

      const { error } = await supabase
        .from("user_presence")
        .upsert({
          user_id: user.id,
          status,
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
    },
  });
};

export const useMarkMessageRead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from("direct_messages")
        .update({ is_read: true })
        .eq("id", messageId)
        .eq("recipient_id", user!.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["unread_messages_count", user?.id] });
    },
  });
};
