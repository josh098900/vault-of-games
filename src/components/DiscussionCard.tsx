
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, ThumbsUp, Eye, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Discussion {
  id: string;
  title: string;
  content: string;
  category: string;
  author: {
    name: string;
    avatar?: string;
  };
  replies: number;
  likes: number;
  views: number;
  lastActivity: string;
  createdAt: string;
  tags: string[];
  isLiked?: boolean;
}

interface DiscussionCardProps {
  discussion: Discussion;
  onLike?: (id: string) => void;
  onClick?: (id: string) => void;
  isLiked?: boolean;
}

export const DiscussionCard = ({ discussion, onLike, onClick, isLiked }: DiscussionCardProps) => {
  const liked = isLiked ?? discussion.isLiked ?? false;

  return (
    <Card className="gaming-card hover:border-primary/30 transition-colors cursor-pointer" onClick={() => onClick?.(discussion.id)}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={discussion.author.avatar} alt={discussion.author.name} />
            <AvatarFallback>{discussion.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {discussion.category}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(discussion.createdAt), { addSuffix: true })}
              </span>
            </div>
            
            <h3 className="font-semibold text-lg leading-tight hover:text-primary transition-colors">
              {discussion.title}
            </h3>
            
            <p className="text-sm text-muted-foreground line-clamp-2">
              {discussion.content}
            </p>
            
            <div className="flex flex-wrap gap-1">
              {discussion.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              {discussion.replies}
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {discussion.views}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatDistanceToNow(new Date(discussion.lastActivity), { addSuffix: true })}
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              onLike?.(discussion.id);
            }}
            className={`gap-1 ${liked ? 'text-pink-400 hover:text-pink-500' : 'text-muted-foreground hover:text-pink-400'}`}
          >
            <ThumbsUp className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
            {discussion.likes}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
