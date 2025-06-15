
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageSquare } from 'lucide-react';
import { useLiveSessionMessages, useSendSessionMessage } from '@/hooks/useLiveSessionChat';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';

interface LiveSessionChatProps {
  sessionId: string;
}

export const LiveSessionChat = ({ sessionId }: LiveSessionChatProps) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  const { data: messages = [], isLoading } = useLiveSessionMessages(sessionId);
  const sendMessage = useSendSessionMessage();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sendMessage.isPending) return;

    try {
      await sendMessage.mutateAsync({
        sessionId,
        content: message
      });
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
            Session Chat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chatHeight = isMobile ? 'h-[350px]' : 'h-[500px]';

  return (
    <Card className={`${chatHeight} flex flex-col`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
          Session Chat
          <span className="text-xs sm:text-sm font-normal text-muted-foreground">
            ({messages.length})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-3 sm:px-4" ref={scrollAreaRef}>
          <div className="space-y-3 sm:space-y-4 pb-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-6 sm:py-8">
                <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                <p className="text-sm sm:text-base">No messages yet</p>
                <p className="text-xs sm:text-sm mt-1">Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-2 sm:gap-3">
                  <Avatar className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
                    <AvatarImage src={msg.profiles?.avatar_url || ""} />
                    <AvatarFallback className="text-xs">
                      {msg.profiles?.display_name?.[0] || 
                       msg.profiles?.username?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-xs sm:text-sm truncate">
                        {msg.profiles?.display_name || msg.profiles?.username}
                      </span>
                      {msg.user_id === user?.id && (
                        <span className="text-xs text-blue-500 flex-shrink-0">You</span>
                      )}
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {format(new Date(msg.created_at), 'HH:mm')}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm break-words">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        
        <div className="border-t p-3 sm:p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              disabled={sendMessage.isPending}
              className="flex-1 text-sm"
              maxLength={500}
            />
            <Button 
              type="submit" 
              size="sm"
              disabled={!message.trim() || sendMessage.isPending}
              className="flex-shrink-0"
            >
              <Send className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};
