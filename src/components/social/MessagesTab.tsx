
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Send, ArrowLeft, Users, Reply, Plus } from "lucide-react";
import { 
  useConversations, 
  useMessages, 
  useSendMessage,
  useGroupConversations,
  useGroupMessages,
  useSendGroupMessage
} from "@/hooks/useMessages";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { MessageReactions } from "./MessageReactions";
import { UserPresenceIndicator } from "./UserPresenceIndicator";
import { CreateGroupDialog } from "./CreateGroupDialog";

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
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const [replyToMessage, setReplyToMessage] = useState<string | null>(null);
  const [conversationType, setConversationType] = useState<"direct" | "group">("direct");
  
  const { data: conversations = [], isLoading: conversationsLoading } = useConversations();
  const { data: groupConversations = [], isLoading: groupsLoading } = useGroupConversations();
  const { data: messages = [], isLoading: messagesLoading } = useMessages(selectedConversation || "");
  const { data: groupMessages = [], isLoading: groupMessagesLoading } = useGroupMessages(selectedGroup || "");
  const sendMessage = useSendMessage();
  const sendGroupMessage = useSendGroupMessage();

  const currentMessages = conversationType === "direct" ? messages : groupMessages;
  const currentLoading = conversationType === "direct" ? messagesLoading : groupMessagesLoading;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim()) return;

    try {
      if (conversationType === "direct" && selectedConversation) {
        await sendMessage.mutateAsync({
          recipientId: selectedConversation,
          content: messageContent.trim(),
        });
      } else if (conversationType === "group" && selectedGroup) {
        await sendGroupMessage.mutateAsync({
          groupId: selectedGroup,
          content: messageContent.trim(),
          parentMessageId: replyToMessage || undefined,
        });
      }
      setMessageContent("");
      setReplyToMessage(null);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // Update selected conversation when initial prop changes
  useEffect(() => {
    if (initialSelectedConversation) {
      setSelectedConversation(initialSelectedConversation);
      setConversationType("direct");
    }
  }, [initialSelectedConversation]);

  // Notify parent when conversation changes
  const handleConversationSelect = (conversationId: string | null, type: "direct" | "group" = "direct") => {
    if (type === "direct") {
      setSelectedConversation(conversationId);
      setSelectedGroup(null);
    } else {
      setSelectedGroup(conversationId);
      setSelectedConversation(null);
    }
    setConversationType(type);
    setReplyToMessage(null);
    onConversationChange?.(conversationId);
  };

  const handleGroupCreated = (groupId: string) => {
    handleConversationSelect(groupId, "group");
  };

  if (selectedConversation || selectedGroup) {
    const isGroupChat = conversationType === "group";
    const conversation = isGroupChat 
      ? groupConversations.find(conv => conv.id === selectedGroup)
      : conversations.find(conv => conv.other_user_id === selectedConversation);
    
    const otherUserProfile = !isGroupChat ? conversation?.other_user_profile : null;
    const replyMessage = replyToMessage ? currentMessages.find(m => m.id === replyToMessage) : null;

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
            
            {isGroupChat ? (
              <>
                <Avatar className="w-8 h-8">
                  <AvatarImage src={conversation?.avatar_url || ""} />
                  <AvatarFallback>
                    <Users className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{conversation?.name}</CardTitle>
                  <CardDescription>
                    {conversation?.member_count} members
                  </CardDescription>
                </div>
              </>
            ) : (
              <>
                <div className="relative">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={otherUserProfile?.avatar_url || ""} />
                    <AvatarFallback>
                      {otherUserProfile?.display_name?.[0] || 
                       otherUserProfile?.username?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0 -right-0">
                    <UserPresenceIndicator userId={selectedConversation!} size="sm" />
                  </div>
                </div>
                <div>
                  <CardTitle className="text-lg">
                    {otherUserProfile?.display_name || 
                     otherUserProfile?.username || "Unknown User"}
                  </CardTitle>
                  <CardDescription>
                    @{otherUserProfile?.username || "anonymous"}
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
                {currentLoading ? (
                  <div className="text-center text-muted-foreground">Loading messages...</div>
                ) : currentMessages.length === 0 ? (
                  <div className="text-center text-muted-foreground">
                    No messages yet. Start a conversation!
                  </div>
                ) : (
                  currentMessages.map((message) => {
                    const isCurrentUser = message.sender_id === user?.id;
                    const isReply = message.parent_message_id;
                    
                    return (
                      <div key={message.id} className={`${isReply ? 'ml-8' : ''}`}>
                        <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? 'order-2' : ''}`}>
                            <div
                              className={`px-4 py-2 rounded-lg ${
                                isCurrentUser
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-foreground"
                              }`}
                            >
                              {isReply && (
                                <div className="text-xs opacity-70 mb-1 border-l-2 border-current pl-2">
                                  Replying to message
                                </div>
                              )}
                              <p className="text-sm">{message.content}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                              </p>
                            </div>
                            
                            <div className={`flex items-center gap-2 mt-1 ${isCurrentUser ? 'justify-end' : ''}`}>
                              <MessageReactions messageId={message.id} isGroupMessage={isGroupChat} />
                              
                              {isGroupChat && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-xs"
                                  onClick={() => setReplyToMessage(message.id)}
                                >
                                  <Reply className="w-3 h-3 mr-1" />
                                  Reply
                                </Button>
                              )}
                              
                              {message.thread_count > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  {message.thread_count} replies
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
            
            {replyMessage && (
              <div className="mb-2 p-2 bg-muted rounded text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Replying to: {replyMessage.content.substring(0, 50)}...
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyToMessage(null)}
                    className="h-auto p-1"
                  >
                    ×
                  </Button>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Type a message..."
                disabled={sendMessage.isPending || sendGroupMessage.isPending}
              />
              <Button 
                type="submit" 
                disabled={!messageContent.trim() || sendMessage.isPending || sendGroupMessage.isPending}
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
              Messages
            </CardTitle>
            <CardDescription>
              Private conversations and group chats
            </CardDescription>
          </div>
          <CreateGroupDialog onGroupCreated={handleGroupCreated}>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Group
            </Button>
          </CreateGroupDialog>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="direct" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="direct">Direct Messages</TabsTrigger>
            <TabsTrigger value="groups">Group Chats</TabsTrigger>
          </TabsList>
          
          <TabsContent value="direct" className="mt-4">
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
                    onClick={() => handleConversationSelect(conversation.other_user_id, "direct")}
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
          </TabsContent>
          
          <TabsContent value="groups" className="mt-4">
            {groupsLoading ? (
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
            ) : groupConversations.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">No group chats yet</p>
                <p className="text-sm text-muted-foreground">
                  Create a group chat to talk with multiple friends
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {groupConversations.map((group) => (
                  <div
                    key={group.id}
                    className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleConversationSelect(group.id, "group")}
                  >
                    <Avatar>
                      <AvatarImage src={group.avatar_url || ""} />
                      <AvatarFallback>
                        <Users className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{group.name}</p>
                        <div className="flex items-center gap-2">
                          {group.unread_count > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {group.unread_count}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(group.last_message_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {group.member_count} members • {group.last_message || "No messages yet"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
