
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCreateReply } from "@/hooks/useReplies";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface ReplyFormProps {
  discussionId: string;
}

export const ReplyForm = ({ discussionId }: ReplyFormProps) => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const createReplyMutation = useCreateReply();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to reply to discussions.",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please enter a reply before submitting.",
        variant: "destructive",
      });
      return;
    }

    createReplyMutation.mutate({
      discussionId,
      content: content.trim(),
    }, {
      onSuccess: () => {
        setContent("");
      }
    });
  };

  if (!user) {
    return (
      <Card className="gaming-card">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Please sign in to reply to this discussion.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gaming-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.display_name || user.email} />
            <AvatarFallback>
              {(user.user_metadata?.display_name || user.email || "U").charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="text-lg">Add a Reply</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Share your thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px] bg-background/50 border-white/20"
            disabled={createReplyMutation.isPending}
          />
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={createReplyMutation.isPending || !content.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {createReplyMutation.isPending ? "Posting..." : "Post Reply"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
