
import { useState } from "react";
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
import { useConversations, useUnreadMessageCount } from "@/hooks/useMessages";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { StartConversationDialog } from "./social/StartConversationDialog";

export const MessageDropdown = () => {
  const [open, setOpen] = useState(false);
  const { data: conversations = [], isLoading } = useConversations();
  const { data: unreadCount = 0 } = useUnreadMessageCount();
  const navigate = useNavigate();

  const recentConversations = conversations.slice(0, 5);

  const handleConversationClick = (conversationId: string) => {
    navigate("/social", { state: { selectedConversation: conversationId } });
    setOpen(false);
  };

  const handleConversationStarted = (userId: string) => {
    navigate("/social", { state: { selectedConversation: userId } });
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
            {recentConversations.map((conversation) => {
              const otherUserId = conversation.user1_id === conversation.user2_id ? 
                conversation.user1_id : 
                (conversation.user1_id !== conversation.user2_id ? 
                  conversation.user2_id : conversation.user1_id);
              
              return (
                <DropdownMenuItem
                  key={conversation.id}
                  onClick={() => handleConversationClick(otherUserId)}
                  className={`flex items-center gap-3 p-3 cursor-pointer ${
                    conversation.unread_count > 0 ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                  }`}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={conversation.other_user_profile?.avatar_url || ""} />
                    <AvatarFallback>
                      {conversation.other_user_profile?.display_name?.[0] || 
                       conversation.other_user_profile?.username?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  
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
              );
            })}
          </ScrollArea>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => {
            navigate("/social");
            setOpen(false);
          }}
          className="text-center text-sm text-primary"
        >
          View all messages
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
