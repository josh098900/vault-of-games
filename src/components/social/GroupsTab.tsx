
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Plus, Lock, Globe } from "lucide-react";
import { useGroups } from "@/hooks/useGroups";
import { CreateGroupDialog } from "@/components/social/CreateGroupDialog";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export const GroupsTab = () => {
  const { groups, myGroups, isLoading, joinGroup, leaveGroup } = useGroups();

  const handleJoinGroup = async (groupId: string) => {
    try {
      await joinGroup.mutateAsync(groupId);
      toast({
        title: "Success",
        description: "You have joined the group!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join group.",
        variant: "destructive",
      });
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    try {
      await leaveGroup.mutateAsync(groupId);
      toast({
        title: "Success",
        description: "You have left the group.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to leave group.",
        variant: "destructive",
      });
    }
  };

  const isInGroup = (groupId: string) => {
    return myGroups.some(group => group.id === groupId);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse h-6 bg-muted rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="animate-pulse h-6 bg-muted rounded w-3/4"></div>
                <div className="animate-pulse h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gaming Groups</h2>
          <p className="text-muted-foreground">Join communities around your favorite games</p>
        </div>
        <CreateGroupDialog>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </Button>
        </CreateGroupDialog>
      </div>

      {myGroups.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">My Groups ({myGroups.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myGroups.map((group) => (
              <Card key={group.id} className="border-primary/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {group.is_private ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                      {group.name}
                    </CardTitle>
                    <Badge variant="secondary">Member</Badge>
                  </div>
                  <CardDescription>{group.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      {group.member_count} members
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLeaveGroup(group.id)}
                      disabled={leaveGroup.isPending}
                    >
                      Leave
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-4">Discover Groups</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups
            .filter(group => !isInGroup(group.id))
            .map((group) => (
              <Card key={group.id}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {group.is_private ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                    {group.name}
                  </CardTitle>
                  <CardDescription>{group.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      {group.member_count} members
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleJoinGroup(group.id)}
                      disabled={joinGroup.isPending || group.is_private}
                    >
                      {group.is_private ? "Private" : "Join"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
};
