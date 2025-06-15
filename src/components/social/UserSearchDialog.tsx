
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, UserPlus, Users } from "lucide-react";
import { useUserSearch } from "@/hooks/useUserSearch";
import { useFriends } from "@/hooks/useFriends";
import { toast } from "@/hooks/use-toast";

interface UserSearchDialogProps {
  children: React.ReactNode;
}

export const UserSearchDialog = ({ children }: UserSearchDialogProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { data: searchResults = [], isLoading } = useUserSearch(searchTerm);
  const { followUser, isFollowing } = useFriends();

  const handleFollow = async (userId: string) => {
    try {
      await followUser.mutateAsync(userId);
      toast({
        title: "Success",
        description: "You are now following this user.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to follow user.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Find Friends
          </DialogTitle>
          <DialogDescription>
            Search for users by username or display name to connect with them.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search for users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {isLoading && searchTerm.length >= 2 && (
              <div className="text-center py-4 text-muted-foreground">
                Searching...
              </div>
            )}

            {searchTerm.length < 2 && (
              <div className="text-center py-8 text-muted-foreground">
                Type at least 2 characters to search for users
              </div>
            )}

            {searchTerm.length >= 2 && !isLoading && searchResults.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No users found matching "{searchTerm}"
              </div>
            )}

            {searchResults.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={user.avatar_url || ""} />
                    <AvatarFallback>
                      {user.display_name?.[0] || user.username?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {user.display_name || user.username || "Unknown User"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      @{user.username || "anonymous"}
                    </p>
                  </div>
                </div>
                
                {isFollowing(user.id) ? (
                  <Button variant="outline" size="sm" disabled>
                    <Users className="w-4 h-4 mr-2" />
                    Following
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFollow(user.id)}
                    disabled={followUser.isPending}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Follow
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
