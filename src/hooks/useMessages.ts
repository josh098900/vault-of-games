
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface DirectMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  sender_profile?: {
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  last_message_at: string;
  created_at: string;
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

      const { data: conversations, error } = await supabase
        .from("message_conversations")
        .select(`
          *,
          direct_messages!inner (
            content,
            created_at,
            is_read,
            sender_id
          )
        `)
        .order("last_message_at", { ascending: false });

      if (error) throw error;

      const conversationsWithProfiles = await Promise.all(
        conversations.map(async (conv) => {
          const otherUserId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id;
          
          const { data: profile } = await supabase
            .from("profiles")
            .select("username, display_name, avatar_url")
            .eq("id", otherUserId)
            .single();

          const messages = conv.direct_messages as any[];
          const lastMessage = messages.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0];

          const unreadCount = messages.filter(msg => 
            !msg.is_read && msg.sender_id !== user.id
          ).length;

          return {
            ...conv,
            other_user_profile: profile,
            last_message: lastMessage?.content,
            unread_count: unreadCount
          };
        })
      );

      return conversationsWithProfiles as Conversation[];
    },
    enabled: !!user,
  });
};

export const useMessages = (recipientId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["messages", user?.id, recipientId],
    queryFn: async () => {
      if (!user) return [];

      const { data: messages, error } = await supabase
        .from("direct_messages")
        .select(`
          *,
          sender_profile:profiles!sender_id (
            username,
            display_name,
            avatar_url
          )
        `)
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${user.id})`)
        .order("created_at", { ascending: true });

      if (error) throw error;

      return messages as DirectMessage[];
    },
    enabled: !!user && !!recipientId,
  });
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
    },
  });
};
