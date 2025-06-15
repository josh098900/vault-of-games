
import { ReplyCard } from "@/components/ReplyCard";
import { useReplies } from "@/hooks/useReplies";

interface ReplyListProps {
  discussionId: string;
}

export const ReplyList = ({ discussionId }: ReplyListProps) => {
  const { data: replies = [], isLoading, error } = useReplies(discussionId);

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Error loading replies. Please try again.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="gaming-card p-6 animate-pulse">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-muted rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (replies.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No replies yet. Be the first to share your thoughts!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">
        Replies ({replies.length})
      </h2>
      {replies.map((reply) => (
        <ReplyCard key={reply.id} reply={reply} />
      ))}
    </div>
  );
};
