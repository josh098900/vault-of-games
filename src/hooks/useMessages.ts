
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

      // Get conversations where user is participant
      const { data: conversations, error } = await supabase
        .from("message_conversations")
        .select("*")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order("last_message_at", { ascending: false });

      if (error) throw error;
      if (!conversations || conversations.length === 0) return [];

      // Get profiles and messages for each conversation
      const conversationsWithData = await Promise.all(
        conversations.map(async (conv) => {
          const otherUserId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id;
          
          // Get other user's profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("username, display_name, avatar_url")
            .eq("id", otherUserId)
            .single();

          // Get messages for this conversation
          const { data: messages } = await supabase
            .from("direct_messages")
            .select("content, created_at, is_read, sender_id")
            .or(`and(sender_id.eq.${conv.user1_id},recipient_id.eq.${conv.user2_id}),and(sender_id.eq.${conv.user2_id},recipient_id.eq.${conv.user1_id})`)
            .order("created_at", { ascending: false })
            .limit(1);

          const lastMessage = messages && messages.length > 0 ? messages[0] : null;

          // Count unread messages
          const { count: unreadCount } = await supabase
            .from("direct_messages")
            .select("*", { count: "exact", head: true })
            .eq("recipient_id", user.id)
            .eq("sender_id", otherUserId)
            .eq("is_read", false);

          return {
            ...conv,
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

export const useMessages = (recipientId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["messages", user?.id, recipientId],
    queryFn: async () => {
      if (!user) return [];

      // Get messages between current user and recipient
      const { data: messages, error } = await supabase
        .from("direct_messages")
        .select("*")
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${user.id})`)
        .order("created_at", { ascending: true });

      if (error) throw error;
      if (!messages) return [];

      // Get sender profiles for all messages
      const messagesWithProfiles = await Promise.all(
        messages.map(async (message) => {
          const { data: senderProfile } = await supabase
            .from("profiles")
            .select("username, display_name, avatar_url")
            .eq("id", message.sender_id)
            .single();

          return {
            ...message,
            sender_profile: senderProfile
          };
        })
      );

      return messagesWithProfiles as DirectMessage[];
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
