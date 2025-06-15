
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, MessageCircle, ThumbsUp, Eye, Clock, Share2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Header } from "@/components/Header";
import { ReplyForm } from "@/components/ReplyForm";
import { ReplyList } from "@/components/ReplyList";
import { useDiscussionDetail, useLikeDiscussion } from "@/hooks/useDiscussionDetail";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const DiscussionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { data: discussion, isLoading, error } = useDiscussionDetail(id!);
  const likeDiscussionMutation = useLikeDiscussion();

  const handleLikeDiscussion = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like discussions.",
        variant: "destructive",
      });
      return;
    }

    if (discussion) {
      likeDiscussionMutation.mutate({
        discussionId: discussion.id,
        isLiked: discussion.is_liked || false
      });
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: discussion?.title,
          text: discussion?.content.substring(0, 100) + "...",
          url: url,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "Discussion link has been copied to clipboard.",
      });
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-destructive">Error loading discussion. Please try again.</p>
            <Button onClick={() => navigate("/community")} className="mt-4">
              Back to Community
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!discussion) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-muted-foreground">Discussion not found.</p>
            <Button onClick={() => navigate("/community")} className="mt-4">
              Back to Community
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/community")}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Community
          </Button>
        </div>

        {/* Discussion Content */}
        <div className="gaming-card p-8 mb-8">
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <Avatar className="w-12 h-12">
              <AvatarImage 
                src={discussion.profiles?.avatar_url || undefined} 
                alt={discussion.profiles?.display_name || discussion.profiles?.username || "Anonymous"} 
              />
              <AvatarFallback>
                {(discussion.profiles?.display_name || discussion.profiles?.username || "A").charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="secondary">{discussion.category}</Badge>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(discussion.created_at), { addSuffix: true })}
                </span>
              </div>
              
              <h1 className="text-2xl font-bold mb-2">{discussion.title}</h1>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>by {discussion.profiles?.display_name || discussion.profiles?.username || "Anonymous"}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-sm max-w-none mb-6">
            <p className="text-foreground whitespace-pre-wrap">{discussion.content}</p>
          </div>

          {/* Tags */}
          {discussion.tags && discussion.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {discussion.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Stats and Actions */}
          <div className="flex items-center justify-between pt-6 border-t">
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                {discussion.replies_count} replies
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                {discussion.views_count || 0} views
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Last activity {formatDistanceToNow(new Date(discussion.last_activity_at), { addSuffix: true })}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLikeDiscussion}
                className={`gap-2 ${discussion.is_liked ? 'text-pink-400 hover:text-pink-500' : 'text-muted-foreground hover:text-pink-400'}`}
              >
                <ThumbsUp className={`w-4 h-4 ${discussion.is_liked ? 'fill-current' : ''}`} />
                {discussion.likes_count}
              </Button>
            </div>
          </div>
        </div>

        {/* Reply Form */}
        <div className="mb-8">
          <ReplyForm discussionId={discussion.id} />
        </div>

        {/* Replies */}
        <ReplyList discussionId={discussion.id} />
      </div>
    </div>
  );
};

export default DiscussionDetail;
