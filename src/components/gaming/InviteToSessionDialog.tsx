
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserPlus, Search, Send } from "lucide-react";

interface InviteToSessionDialogProps {
  sessionId: string;
}

interface Follower {
  id: string;
  follower_id: string;
  profiles: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

export const InviteToSessionDialog = ({ sessionId }: InviteToSessionDialogProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  // Get user's followers
  const { data: followers = [], isLoading } = useQuery({
    queryKey: ['user-followers', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_follows')
        .select(`
          id,
          follower_id,
          profiles!user_follows_follower_id_fkey(
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('following_id', user.id);

      if (error) throw error;
      return data as Follower[];
    },
    enabled: !!user && open,
  });

  const inviteUsers = useMutation({
    mutationFn: async (userIds: string[]) => {
      // Get session details first
      const { data: session, error: sessionError } = await supabase
        .from('live_gaming_sessions')
        .select('*, games(title)')
        .eq('id', sessionId)
        .single();

      if (sessionError) throw sessionError;

      // Create notifications for each invited user
      const notifications = userIds.map(userId => ({
        user_id: userId,
        type: 'session_invite',
        title: 'Gaming Session Invite',
        message: `You've been invited to join a ${session.session_type.replace('_', ' ')} session for ${session.games?.title}`,
        data: {
          session_id: sessionId,
          session_type: session.session_type,
          game_title: session.games?.title,
          inviter_id: user?.id
        }
      }));

      const { error } = await supabase
        .from('notifications')
        .insert(notifications);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Invites sent!",
        description: `Successfully invited ${selectedUsers.length} user${selectedUsers.length !== 1 ? 's' : ''} to the session.`,
      });
      setSelectedUsers([]);
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      console.error('Error sending invites:', error);
      toast({
        title: "Error",
        description: "Failed to send invites. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredFollowers = followers.filter(follower =>
    follower.profiles?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    follower.profiles?.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSendInvites = () => {
    if (selectedUsers.length > 0) {
      inviteUsers.mutate(selectedUsers);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Followers
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Followers to Session</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search followers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="h-64 w-full">
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-3 p-2 animate-pulse">
                    <div className="w-10 h-10 bg-muted rounded-full"></div>
                    <div className="flex-1 space-y-1">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredFollowers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? "No followers found matching your search." : "You don't have any followers yet."}
              </div>
            ) : (
              <div className="space-y-1">
                {filteredFollowers.map((follower) => (
                  <div
                    key={follower.id}
                    className={`flex items-center space-x-3 p-2 rounded cursor-pointer transition-colors ${
                      selectedUsers.includes(follower.profiles.id)
                        ? 'bg-primary/10 border border-primary/20'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => handleUserToggle(follower.profiles.id)}
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={follower.profiles.avatar_url || ""} />
                      <AvatarFallback>
                        {follower.profiles.display_name?.[0] || 
                         follower.profiles.username?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {follower.profiles.display_name || follower.profiles.username}
                      </p>
                      {follower.profiles.username && follower.profiles.display_name && (
                        <p className="text-sm text-muted-foreground truncate">
                          @{follower.profiles.username}
                        </p>
                      )}
                    </div>
                    {selectedUsers.includes(follower.profiles.id) && (
                      <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="flex justify-between items-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              {selectedUsers.length} selected
            </p>
            <Button
              onClick={handleSendInvites}
              disabled={selectedUsers.length === 0 || inviteUsers.isPending}
            >
              <Send className="w-4 h-4 mr-2" />
              Send Invites
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
