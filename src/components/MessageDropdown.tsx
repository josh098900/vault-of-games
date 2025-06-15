
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Plus } from "lucide-react";
import { useConversations, useUnreadMessageCount, useUpdatePresence, useMarkMessageRead } from "@/hooks/useMessages";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { StartConversationDialog } from "./social/StartConversationDialog";
import { UserPresenceIndicator } from "./social/UserPresenceIndicator";
import { useAuth } from "@/contexts/AuthContext";

export const MessageDropdown = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const { data: conversations = [], isLoading } = useConversations();
  const { data: unreadCount = 0 } = useUnreadMessageCount();
  const updatePresence = useUpdatePresence();
  const markMessageRead = useMarkMessageRead();
  const navigate = useNavigate();

  const recentConversations = conversations.slice(0, 5);

  // Update user presence to online when component mounts and periodically
  useEffect(() => {
    if (user) {
      updatePresence.mutate("online");
      
      const interval = setInterval(() => {
        updatePresence.mutate("online");
      }, 60000); // Update every minute

      return () => clearInterval(interval);
    }
  }, [user]);

  // Set user to offline when page unloads
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user) {
        navigator.sendBeacon('/api/presence', JSON.stringify({ status: 'offline' }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [user]);

  const handleConversationClick = (otherUserId: string) => {
    console.log("Navigating to conversation with user:", otherUserId);
    
    // Mark unread messages as read immediately when clicking
    const conversation = conversations.find(conv => conv.other_user_id === otherUserId);
    if (conversation && conversation.unread_count > 0) {
      console.log(`Marking ${conversation.unread_count} messages as read for user:`, otherUserId);
      // Note: The actual message marking will happen in MessagesTab when it loads
    }
    
    navigate("/social", { state: { selectedConversation: otherUserId } });
    setOpen(false);
  };

  const handleConversationStarted = (userId: string) => {
    navigate("/social", { state: { selectedConversation: userId } });
    setOpen(false);
  };

  const handleViewAllMessages = () => {
    navigate("/social");
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <MessageCircle className="w-4 h-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-pink-500 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-background/95 backdrop-blur-md border border-white/20">
        <div className="flex items-center justify-between p-3">
          <DropdownMenuLabel className="text-primary p-0">Messages</DropdownMenuLabel>
          <StartConversationDialog onConversationStarted={handleConversationStarted}>
            <Button variant="ghost" size="sm" className="h-auto p-1">
              <Plus className="w-4 h-4" />
            </Button>
          </StartConversationDialog>
        </div>
        <DropdownMenuSeparator />
        
        {isLoading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading messages...
          </div>
        ) : recentConversations.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No conversations yet
          </div>
        ) : (
          <ScrollArea className="max-h-64">
            {recentConversations.map((conversation) => (
              <DropdownMenuItem
                key={conversation.id}
                onClick={() => handleConversationClick(conversation.other_user_id)}
                className={`flex items-center gap-3 p-3 cursor-pointer ${
                  conversation.unread_count > 0 ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                }`}
              >
                <div className="relative">
                  <Avatar className="w-8 h-8">
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
                    <p className="font-medium text-sm truncate">
                      {conversation.other_user_profile?.display_name || 
                       conversation.other_user_profile?.username || "Unknown User"}
                    </p>
                    <div className="flex items-center gap-2">
                      {conversation.unread_count > 0 && (
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {conversation.last_message || "No messages yet"}
                  </p>
                </div>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleViewAllMessages}
          className="text-center text-sm text-primary"
        >
          View all messages
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
