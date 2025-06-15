
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

interface LiveSessionChatProps {
  sessionId: string;
}

export const LiveSessionChat = ({ sessionId }: LiveSessionChatProps) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
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
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
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

  return (
    <Card className="h-[500px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Session Chat
          <span className="text-sm font-normal text-muted-foreground">
            ({messages.length} messages)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
          <div className="space-y-4 pb-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-3">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={msg.profiles?.avatar_url || ""} />
                    <AvatarFallback className="text-xs">
                      {msg.profiles?.display_name?.[0] || 
                       msg.profiles?.username?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {msg.profiles?.display_name || msg.profiles?.username}
                      </span>
                      {msg.user_id === user?.id && (
                        <span className="text-xs text-blue-500">You</span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(msg.created_at), 'HH:mm')}
                      </span>
                    </div>
                    <p className="text-sm break-words">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        
        <div className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              disabled={sendMessage.isPending}
              className="flex-1"
              maxLength={500}
            />
            <Button 
              type="submit" 
              size="sm"
              disabled={!message.trim() || sendMessage.isPending}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};
