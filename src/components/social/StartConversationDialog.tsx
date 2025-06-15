
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Search } from "lucide-react";
import { useFriends } from "@/hooks/useFriends";
import { useSendMessage } from "@/hooks/useMessages";
import { toast } from "@/hooks/use-toast";

interface StartConversationDialogProps {
  children: React.ReactNode;
  onConversationStarted: (userId: string) => void;
}

export const StartConversationDialog = ({ children, onConversationStarted }: StartConversationDialogProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState("");

  const { following } = useFriends();
  const sendMessage = useSendMessage();

  const filteredFollowing = following.filter(follow =>
    follow.profiles.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    follow.profiles.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !messageContent.trim()) return;

    try {
      await sendMessage.mutateAsync({
        recipientId: selectedUser,
        content: messageContent.trim(),
      });
      
      toast({
        title: "Success",
        description: "Message sent successfully!",
      });
      
      onConversationStarted(selectedUser);
      setOpen(false);
      setSelectedUser(null);
      setMessageContent("");
      setSearchQuery("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start a Conversation</DialogTitle>
          <DialogDescription>
            Send a message to someone you follow
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search people you follow..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="max-h-48 overflow-y-auto space-y-2">
            {filteredFollowing.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                {searchQuery ? "No matching followers found" : "You're not following anyone yet"}
              </p>
            ) : (
              filteredFollowing.map((follow) => (
                <div
                  key={follow.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedUser === follow.following_id
                      ? "bg-primary/10 border-primary"
                      : "hover:bg-muted/50 border-transparent"
                  } border`}
                  onClick={() => setSelectedUser(follow.following_id)}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={follow.profiles.avatar_url || ""} />
                    <AvatarFallback>
                      {follow.profiles.display_name?.[0] || follow.profiles.username?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">
                      {follow.profiles.display_name || follow.profiles.username || "Unknown User"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      @{follow.profiles.username || "anonymous"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {selectedUser && (
            <form onSubmit={handleStartConversation} className="space-y-3">
              <Input
                placeholder="Type your message..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                disabled={sendMessage.isPending}
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelectedUser(null);
                    setMessageContent("");
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!messageContent.trim() || sendMessage.isPending}
                  className="flex-1"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
