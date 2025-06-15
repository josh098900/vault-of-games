
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface Reply {
  id: string;
  content: string;
  created_at: string;
  profiles?: {
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface ReplyCardProps {
  reply: Reply;
}

export const ReplyCard = ({ reply }: ReplyCardProps) => {
  const authorName = reply.profiles?.display_name || reply.profiles?.username || "Anonymous";
  
  return (
    <Card className="gaming-card">
      <CardContent className="p-6">
        <div className="flex gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage 
              src={reply.profiles?.avatar_url || undefined} 
              alt={authorName} 
            />
            <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-sm">{authorName}</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
              </span>
            </div>
            
            <p className="text-sm text-foreground whitespace-pre-wrap">{reply.content}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
