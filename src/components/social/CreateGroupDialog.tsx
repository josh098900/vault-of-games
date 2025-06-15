
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
  
  const { data: friends = [] } = useFriends();
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
      setOpen(false);
      setName("");
      setDescription("");
      setIsPrivate(false);
      setSelectedMembers([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create group",
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
            Create a new group conversation with your friends
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Group Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter group name"
              required
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
            <Label>Add Members</Label>
            <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
              {friends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center justify-between p-2 border rounded-lg cursor-pointer hover:bg-muted"
                  onClick={() => toggleMember(friend.id)}
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={friend.avatar_url || ""} />
                      <AvatarFallback>
                        {friend.display_name?.[0] || friend.username?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">
                      {friend.display_name || friend.username}
                    </span>
                  </div>
                  {selectedMembers.includes(friend.id) && (
                    <Badge variant="default" className="text-xs">
                      Selected
                    </Badge>
                  )}
                </div>
              ))}
            </div>

            {selectedMembers.length > 0 && (
              <div className="mt-3">
                <Label className="text-sm text-muted-foreground">
                  Selected Members ({selectedMembers.length})
                </Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedMembers.map((memberId) => {
                    const friend = friends.find(f => f.id === memberId);
                    return (
                      <Badge 
                        key={memberId} 
                        variant="secondary" 
                        className="text-xs flex items-center gap-1"
                      >
                        {friend?.display_name || friend?.username}
                        <X 
                          className="w-3 h-3 cursor-pointer" 
                          onClick={() => toggleMember(memberId)}
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
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createGroup.isPending || !name.trim()}
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
