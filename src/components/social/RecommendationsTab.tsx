
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Send, Eye, Plus } from "lucide-react";
import { useRecommendations } from "@/hooks/useRecommendations";
import { SendRecommendationDialog } from "./SendRecommendationDialog";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

export const RecommendationsTab = () => {
  const { receivedRecommendations, sentRecommendations, isLoading, markAsRead } = useRecommendations();

  const handleMarkAsRead = async (recommendationId: string) => {
    try {
      await markAsRead.mutateAsync(recommendationId);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark as read.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="animate-pulse h-6 bg-muted rounded w-1/3"></div>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Game Recommendations</h2>
          <p className="text-muted-foreground">Share and discover games with your friends</p>
        </div>
        <SendRecommendationDialog>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Send Recommendation
          </Button>
        </SendRecommendationDialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Received Recommendations ({receivedRecommendations.length})
            </CardTitle>
            <CardDescription>
              Game recommendations from your friends
            </CardDescription>
          </CardHeader>
          <CardContent>
            {receivedRecommendations.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No recommendations yet. Connect with friends to get personalized game suggestions!
              </p>
            ) : (
              <div className="space-y-4">
                {receivedRecommendations.map((recommendation) => (
                  <Card key={recommendation.id} className={`p-4 ${!recommendation.is_read ? 'border-primary/50' : ''}`}>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={recommendation.profiles.avatar_url || ""} />
                            <AvatarFallback>
                              {recommendation.profiles.display_name?.[0] || recommendation.profiles.username?.[0] || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">
                              {recommendation.profiles.display_name || recommendation.profiles.username || "Unknown User"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(recommendation.created_at), "MMM dd")}
                            </p>
                          </div>
                        </div>
                        {!recommendation.is_read && (
                          <Badge variant="secondary" className="text-xs">New</Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {recommendation.games.cover_image_url && (
                          <img
                            src={recommendation.games.cover_image_url}
                            alt={recommendation.games.title}
                            className="w-12 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold">{recommendation.games.title}</h4>
                          {recommendation.games.genre && (
                            <p className="text-sm text-muted-foreground">{recommendation.games.genre}</p>
                          )}
                        </div>
                      </div>
                      
                      {recommendation.message && (
                        <p className="text-sm bg-muted p-2 rounded italic">
                          "{recommendation.message}"
                        </p>
                      )}
                      
                      {!recommendation.is_read && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsRead(recommendation.id)}
                          disabled={markAsRead.isPending}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Mark as Read
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Sent Recommendations ({sentRecommendations.length})
            </CardTitle>
            <CardDescription>
              Games you've recommended to friends
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sentRecommendations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  You haven't sent any recommendations yet.
                </p>
                <SendRecommendationDialog>
                  <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Send Your First Recommendation
                  </Button>
                </SendRecommendationDialog>
              </div>
            ) : (
              <div className="space-y-4">
                {sentRecommendations.map((recommendation) => (
                  <Card key={recommendation.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={recommendation.profiles.avatar_url || ""} />
                            <AvatarFallback>
                              {recommendation.profiles.display_name?.[0] || recommendation.profiles.username?.[0] || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">
                              To: {recommendation.profiles.display_name || recommendation.profiles.username || "Unknown User"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(recommendation.created_at), "MMM dd")}
                            </p>
                          </div>
                        </div>
                        <Badge variant={recommendation.is_read ? "secondary" : "default"} className="text-xs">
                          {recommendation.is_read ? "Read" : "Unread"}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {recommendation.games.cover_image_url && (
                          <img
                            src={recommendation.games.cover_image_url}
                            alt={recommendation.games.title}
                            className="w-12 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold">{recommendation.games.title}</h4>
                          {recommendation.games.genre && (
                            <p className="text-sm text-muted-foreground">{recommendation.games.genre}</p>
                          )}
                        </div>
                      </div>
                      
                      {recommendation.message && (
                        <p className="text-sm bg-muted p-2 rounded italic">
                          "{recommendation.message}"
                        </p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
