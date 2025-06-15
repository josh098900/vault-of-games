
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, ArrowLeft } from "lucide-react";
import { 
  useConversations, 
  useMessages, 
  useSendMessage,
  useMarkMessageRead
} from "@/hooks/useMessages";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { MessageReactions } from "./MessageReactions";
import { UserPresenceIndicator } from "./UserPresenceIndicator";

interface MessagesTabProps {
  initialSelectedConversation?: string | null;
  onConversationChange?: (conversationId: string | null) => void;
}

export const MessagesTab = ({ 
  initialSelectedConversation, 
  onConversationChange 
}: MessagesTabProps) => {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(
    initialSelectedConversation || null
  );
  const [messageContent, setMessageContent] = useState("");
  
  const { data: conversations = [], isLoading: conversationsLoading } = useConversations();
  const { data: messages = [], isLoading: messagesLoading } = useMessages(selectedConversation || "");
  const sendMessage = useSendMessage();
  const markMessageRead = useMarkMessageRead();

  // Mark unread messages as read when opening a conversation
  useEffect(() => {
    if (selectedConversation && messages.length > 0) {
      const unreadMessages = messages.filter(
        msg => msg.recipient_id === user?.id && !msg.is_read
      );
      
      unreadMessages.forEach(msg => {
        markMessageRead.mutate(msg.id);
      });
    }
  }, [selectedConversation, messages, user?.id, markMessageRead]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim() || !selectedConversation) return;

    try {
      await sendMessage.mutateAsync({
        recipientId: selectedConversation,
        content: messageContent.trim(),
      });
      setMessageContent("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // Update selected conversation when initial prop changes
  useEffect(() => {
    if (initialSelectedConversation) {
      setSelectedConversation(initialSelectedConversation);
    }
  }, [initialSelectedConversation]);

  // Notify parent when conversation changes
  const handleConversationSelect = (conversationId: string | null) => {
    setSelectedConversation(conversationId);
    onConversationChange?.(conversationId);
  };

  if (selectedConversation) {
    const directConversation = conversations.find(conv => conv.other_user_id === selectedConversation);

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleConversationSelect(null)}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            
            {directConversation && (
              <>
                <div className="relative">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={directConversation.other_user_profile?.avatar_url || ""} />
                    <AvatarFallback>
                      {directConversation.other_user_profile?.display_name?.[0] || 
                       directConversation.other_user_profile?.username?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0 -right-0">
                    <UserPresenceIndicator userId={selectedConversation} size="sm" />
                  </div>
                </div>
                <div>
                  <CardTitle className="text-lg">
                    {directConversation.other_user_profile?.display_name || 
                     directConversation.other_user_profile?.username || "Unknown User"}
                  </CardTitle>
                  <CardDescription>
                    @{directConversation.other_user_profile?.username || "anonymous"}
                  </CardDescription>
                </div>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col h-96">
            <ScrollArea className="flex-1 mb-4">
              <div className="space-y-4 p-4">
                {messagesLoading ? (
                  <div className="text-center text-muted-foreground">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-muted-foreground">
                    No messages yet. Start a conversation!
                  </div>
                ) : (
                  messages.map((message) => {
                    const isCurrentUser = message.sender_id === user?.id;
                    
                    return (
                      <div key={message.id}>
                        <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? 'order-2' : ''}`}>
                            <div
                              className={`px-4 py-2 rounded-lg ${
                                isCurrentUser
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-foreground"
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                              </p>
                            </div>
                            
                            <div className={`flex items-center gap-2 mt-1 ${isCurrentUser ? 'justify-end' : ''}`}>
                              <MessageReactions messageId={message.id} isGroupMessage={false} />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
            
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Type a message..."
                disabled={sendMessage.isPending}
              />
              <Button 
                type="submit" 
                disabled={!messageContent.trim() || sendMessage.isPending}
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Direct Messages
            </CardTitle>
            <CardDescription>
              Private conversations with your friends
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {conversationsLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3 p-4 border rounded-lg">
                <div className="w-10 h-10 bg-muted rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">No direct messages yet</p>
            <p className="text-sm text-muted-foreground">
              Start a conversation with someone from your friends list
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => handleConversationSelect(conversation.other_user_id)}
              >
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={conversation.other_user_profile?.avatar_url || ""} />
                    <AvatarFallback>
                      {conversation.other_user_profile?.display_name?.[0] || 
                       conversation.other_user_profile?.username?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0 -right-0">
                    <UserPresenceIndicator userId={conversation.other_user_id} size="sm" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium truncate">
                      {conversation.other_user_profile?.display_name || 
                       conversation.other_user_profile?.username || "Unknown User"}
                    </p>
                    <div className="flex items-center gap-2">
                      {conversation.unread_count > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {conversation.unread_count}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.last_message || "No messages yet"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
