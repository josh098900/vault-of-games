
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
  const [showPicker, setShowPicker] = useState(false);
  const { data: reactions = [], refetch } = useMessageReactions(messageId, isGroupMessage);
  const addReaction = useAddReaction();
  const removeReaction = useRemoveReaction();

  console.log("MessageReactions render:", { messageId, isGroupMessage, reactions });

  const handleReactionClick = async (reactionType: string) => {
    if (!user) return;

    console.log("Handling reaction click:", { reactionType, messageId, isGroupMessage });

    const existingReaction = reactions.find(
      r => r.user_id === user.id && r.reaction_type === reactionType
    );

    try {
      if (existingReaction) {
        console.log("Removing existing reaction:", existingReaction);
        await removeReaction.mutateAsync({ messageId, reactionType, isGroupMessage });
      } else {
        console.log("Adding new reaction");
        await addReaction.mutateAsync({ messageId, reactionType, isGroupMessage });
      }
      
      // Manually refetch to ensure we get the latest data
      await refetch();
      setShowPicker(false);
    } catch (error) {
      console.error("Error handling reaction:", error);
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

  console.log("Grouped reactions:", groupedReactions);
  console.log("User reactions:", userReactions);

  return (
    <div className="flex items-center gap-1 mt-1">
      {/* Existing reactions */}
      {Object.entries(groupedReactions).map(([type, typeReactions]) => (
        <Badge
          key={type}
          variant={userReactions.includes(type) ? "default" : "secondary"}
          className="px-2 py-0 text-xs cursor-pointer hover:bg-primary/80"
          onClick={() => handleReactionClick(type)}
        >
          <span className="mr-1">{reactionEmojis[type as keyof typeof reactionEmojis]?.emoji}</span>
          {typeReactions.length}
        </Badge>
      ))}

      {/* Add reaction button */}
      <Popover open={showPicker} onOpenChange={setShowPicker}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
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
