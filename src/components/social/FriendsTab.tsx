import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, UserMinus, Search, MessageCircle } from "lucide-react";
import { useFriends } from "@/hooks/useFriends";
import { UserSearchDialog } from "./UserSearchDialog";
import { StartConversationDialog } from "./StartConversationDialog";
import { toast } from "@/hooks/use-toast";

export const FriendsTab = () => {
  const { following, followers, isLoadingFollowing, isLoadingFollowers, followUser, unfollowUser, isFollowing } = useFriends();

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

  const handleUnfollow = async (userId: string) => {
    try {
      await unfollowUser.mutateAsync(userId);
      toast({
        title: "Success",
        description: "You have unfollowed this user.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unfollow user.",
        variant: "destructive",
      });
    }
  };

  const handleConversationStarted = (userId: string) => {
    // Could navigate to messages tab or show success message
    toast({
      title: "Success",
      description: "Message sent! Check the Messages tab to continue the conversation.",
    });
  };

  if (isLoadingFollowing || isLoadingFollowers) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="animate-pulse h-6 bg-muted rounded w-1/3"></div>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-muted rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Friends & Connections</h2>
          <p className="text-muted-foreground">Connect with other gamers and build your network</p>
        </div>
        <UserSearchDialog>
          <Button>
            <Search className="w-4 h-4 mr-2" />
            Find Friends
          </Button>
        </UserSearchDialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Following ({following.length})
            </CardTitle>
            <CardDescription>
              People you follow to see their gaming activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            {following.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  You're not following anyone yet.
                </p>
                <UserSearchDialog>
                  <Button variant="outline">
                    <Search className="w-4 h-4 mr-2" />
                    Find Friends
                  </Button>
                </UserSearchDialog>
              </div>
            ) : (
              <div className="space-y-4">
                {following.map((follow) => (
                  <div key={follow.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={follow.profiles.avatar_url || ""} />
                        <AvatarFallback>
                          {follow.profiles.display_name?.[0] || follow.profiles.username?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {follow.profiles.display_name || follow.profiles.username || "Unknown User"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          @{follow.profiles.username || "anonymous"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StartConversationDialog onConversationStarted={handleConversationStarted}>
                        <Button variant="outline" size="sm">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Message
                        </Button>
                      </StartConversationDialog>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnfollow(follow.following_id)}
                        disabled={unfollowUser.isPending}
                      >
                        <UserMinus className="w-4 h-4 mr-2" />
                        Unfollow
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Followers ({followers.length})
            </CardTitle>
            <CardDescription>
              People who follow your gaming activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            {followers.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No followers yet. Share your gaming achievements to attract followers!
              </p>
            ) : (
              <div className="space-y-4">
                {followers.map((follower) => (
                  <div key={follower.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={follower.profiles.avatar_url || ""} />
                        <AvatarFallback>
                          {follower.profiles.display_name?.[0] || follower.profiles.username?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {follower.profiles.display_name || follower.profiles.username || "Unknown User"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          @{follower.profiles.username || "anonymous"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isFollowing(follower.follower_id) ? (
                        <Badge variant="secondary">Following</Badge>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFollow(follower.follower_id)}
                          disabled={followUser.isPending}
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Follow Back
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
