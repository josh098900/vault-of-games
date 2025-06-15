import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { X, Users, Plus } from "lucide-react";
import { useCreateGroupConversation } from "@/hooks/useMessages";
import { useFriends } from "@/hooks/useFriends";
import { toast } from "@/hooks/use-toast";

interface CreateGroupDialogProps {
  children: React.ReactNode;
  onGroupCreated?: (groupId: string) => void;
}

export const CreateGroupDialog = ({ children, onGroupCreated }: CreateGroupDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  
  const { following: friends = [] } = useFriends();
  const createGroup = useCreateGroupConversation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Group name is required",
        variant: "destructive",
      });
      return;
    }

    if (name.trim().length < 2) {
      toast({
        title: "Error", 
        description: "Group name must be at least 2 characters",
        variant: "destructive",
      });
      return;
    }

    try {
      const group = await createGroup.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        isPrivate,
        memberIds: selectedMembers,
      });

      toast({
        title: "Success",
        description: `Group "${name}" created successfully!`,
      });

      onGroupCreated?.(group.id);
      
      // Reset form and close dialog
      setOpen(false);
      setName("");
      setDescription("");
      setIsPrivate(false);
      setSelectedMembers([]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create group";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const toggleMember = (userId: string) => {
    setSelectedMembers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleDialogOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset form when closing
      setName("");
      setDescription("");
      setIsPrivate(false);
      setSelectedMembers([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Create Group Chat
          </DialogTitle>
          <DialogDescription>
            Create a new group conversation with your friends. You can add more members later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Group Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter group name"
              required
              maxLength={50}
              minLength={2}
            />
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this group about?"
              rows={2}
              maxLength={200}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="private"
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
            />
            <Label htmlFor="private">Private Group</Label>
          </div>

          <div>
            <Label>Add Members (Optional)</Label>
            <p className="text-sm text-muted-foreground mb-2">
              You can create a group with just yourself and add members later
            </p>
            {friends.length > 0 ? (
              <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                {friends.map((friend) => (
                  <div
                    key={friend.profiles.id}
                    className="flex items-center justify-between p-2 border rounded-lg cursor-pointer hover:bg-muted"
                    onClick={() => toggleMember(friend.profiles.id)}
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={friend.profiles.avatar_url || ""} />
                        <AvatarFallback>
                          {friend.profiles.display_name?.[0] || friend.profiles.username?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">
                        {friend.profiles.display_name || friend.profiles.username}
                      </span>
                    </div>
                    {selectedMembers.includes(friend.profiles.id) && (
                      <Badge variant="default" className="text-xs">
                        Selected
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mt-2">
                No friends available to add. You can still create the group and invite members later.
              </p>
            )}

            {selectedMembers.length > 0 && (
              <div className="mt-3">
                <Label className="text-sm text-muted-foreground">
                  Selected Members ({selectedMembers.length})
                </Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedMembers.map((memberId) => {
                    const friend = friends.find(f => f.profiles.id === memberId);
                    return (
                      <Badge 
                        key={memberId} 
                        variant="secondary" 
                        className="text-xs flex items-center gap-1"
                      >
                        {friend?.profiles.display_name || friend?.profiles.username}
                        <X 
                          className="w-3 h-3 cursor-pointer" 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMember(memberId);
                          }}
                        />
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
              disabled={createGroup.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createGroup.isPending || !name.trim() || name.trim().length < 2}
              className="flex-1"
            >
              {createGroup.isPending ? "Creating..." : "Create Group"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
