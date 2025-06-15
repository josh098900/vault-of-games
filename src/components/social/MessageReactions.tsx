import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Smile, Heart, ThumbsUp, Laugh, Frown, Angry } from "lucide-react";
import { useMessageReactions, useAddReaction, useRemoveReaction } from "@/hooks/useMessages";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const reactionEmojis = {
  like: { icon: ThumbsUp, emoji: "👍" },
  heart: { icon: Heart, emoji: "❤️" },
  thumbs_up: { icon: ThumbsUp, emoji: "👍" },
  laugh: { icon: Laugh, emoji: "😂" },
  sad: { icon: Frown, emoji: "😢" },
  angry: { icon: Angry, emoji: "😠" },
};

interface MessageReactionsProps {
  messageId: string;
  isGroupMessage?: boolean;
}

export const MessageReactions = ({ messageId, isGroupMessage = false }: MessageReactionsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showPicker, setShowPicker] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  console.log("=== MessageReactions Component Debug ===");
  console.log("Props:", { messageId, isGroupMessage });
  console.log("User:", user?.id);
  
  const { data: reactions = [], refetch, isLoading, error } = useMessageReactions(messageId, isGroupMessage);
  const addReaction = useAddReaction();
  const removeReaction = useRemoveReaction();

  console.log("Query state:", { isLoading, error, reactionsCount: reactions.length });
  console.log("Raw reactions data:", reactions);

  const handleReactionClick = async (reactionType: string) => {
    if (!user || isProcessing) {
      console.log("Cannot add reaction:", { hasUser: !!user, isProcessing });
      return;
    }

    console.log("=== Starting Reaction Click ===");
    console.log("Reaction type:", reactionType);
    console.log("Message ID:", messageId);
    console.log("Is group message:", isGroupMessage);
    console.log("User ID:", user.id);
    console.log("Current reactions:", reactions);

    setIsProcessing(true);

    const existingReaction = reactions.find(
      r => r.user_id === user.id && r.reaction_type === reactionType
    );

    console.log("Existing reaction found:", existingReaction);

    try {
      if (existingReaction) {
        console.log("Removing existing reaction...");
        await removeReaction.mutateAsync({ 
          messageId, 
          reactionType, 
          isGroupMessage 
        });
        console.log("Reaction removed successfully");
      } else {
        console.log("Adding new reaction...");
        const result = await addReaction.mutateAsync({ 
          messageId, 
          reactionType, 
          isGroupMessage 
        });
        console.log("Reaction added successfully:", result);
      }
      
      console.log("Refetching reactions...");
      await refetch();
      console.log("Refetch completed");
      
      setShowPicker(false);
    } catch (error) {
      console.error("=== Reaction Error ===", error);
      
      toast({
        title: "Error",
        description: "Failed to update reaction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      console.log("=== Reaction Click Complete ===");
    }
  };

  // Group reactions by type
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.reaction_type]) {
      acc[reaction.reaction_type] = [];
    }
    acc[reaction.reaction_type].push(reaction);
    return acc;
  }, {} as Record<string, typeof reactions>);

  const userReactions = reactions.filter(r => r.user_id === user?.id).map(r => r.reaction_type);

  console.log("Processed data:", { groupedReactions, userReactions });

  if (isLoading) {
    console.log("Reactions loading...");
    return (
      <div className="flex items-center gap-1 mt-1">
        <div className="text-xs text-muted-foreground">Loading reactions...</div>
      </div>
    );
  }

  if (error) {
    console.error("Reactions error:", error);
  }

  return (
    <div className="flex items-center gap-1 mt-1">
      {/* Debug info */}
      <div className="text-xs text-muted-foreground mr-2">
        Debug: {reactions.length} reactions loaded
      </div>
      
      {/* Existing reactions */}
      {Object.entries(groupedReactions).map(([type, typeReactions]) => {
        console.log(`Rendering reaction badge for ${type}:`, typeReactions);
        return (
          <Badge
            key={type}
            variant={userReactions.includes(type) ? "default" : "secondary"}
            className={`px-2 py-0 text-xs cursor-pointer hover:bg-primary/80 ${
              isProcessing ? 'opacity-50 pointer-events-none' : ''
            }`}
            onClick={() => handleReactionClick(type)}
          >
            <span className="mr-1">{reactionEmojis[type as keyof typeof reactionEmojis]?.emoji}</span>
            {typeReactions.length}
          </Badge>
        );
      })}

      {/* Add reaction button */}
      <Popover open={showPicker} onOpenChange={setShowPicker}>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-6 w-6 p-0 ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
            disabled={isProcessing}
          >
            <Smile className="w-3 h-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <div className="flex gap-1">
            {Object.entries(reactionEmojis).map(([type, { emoji }]) => (
              <Button
                key={type}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-muted"
                onClick={() => handleReactionClick(type)}
                disabled={isProcessing}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
