
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Activity, Star, Trophy, Users, BookOpen } from "lucide-react";
import { useUserActivities } from "@/hooks/useUserActivities";
import { formatDistanceToNow } from "date-fns";

const getActivityIcon = (activityType: string) => {
  switch (activityType) {
    case 'game_completed':
      return <Trophy className="w-4 h-4 text-amber-400" />;
    case 'review_posted':
      return <Star className="w-4 h-4 text-blue-400" />;
    case 'user_followed':
      return <Users className="w-4 h-4 text-green-400" />;
    default:
      return <Activity className="w-4 h-4 text-muted-foreground" />;
  }
};

const getActivityColor = (activityType: string) => {
  switch (activityType) {
    case 'game_completed':
      return 'bg-amber-900/20 border-amber-700/30';
    case 'review_posted':
      return 'bg-blue-900/20 border-blue-700/30';
    case 'user_followed':
      return 'bg-green-900/20 border-green-700/30';
    default:
      return 'bg-muted/50 border-border';
  }
};

export const SocialActivityFeed = () => {
  const { data: activities = [], isLoading } = useUserActivities();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Social Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3 p-4 border rounded-lg">
                <div className="w-10 h-10 bg-muted rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Social Activity Feed
        </CardTitle>
        <CardDescription>
          Recent activities from you and people you follow
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">No activities yet</p>
            <p className="text-sm text-muted-foreground">
              Follow friends or complete games to see activities here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div 
                key={activity.id} 
                className={`flex items-start space-x-3 p-4 border rounded-lg ${getActivityColor(activity.activity_type)}`}
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={activity.profiles?.avatar_url || ""} />
                  <AvatarFallback>
                    {activity.profiles?.display_name?.[0] || 
                     activity.profiles?.username?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getActivityIcon(activity.activity_type)}
                    <span className="font-medium text-sm">
                      {activity.profiles?.display_name || 
                       activity.profiles?.username || "Unknown User"}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {activity.activity_type.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {activity.description}
                  </p>
                  
                  {activity.data && (
                    <div className="text-xs text-muted-foreground">
                      {activity.activity_type === 'game_completed' && activity.data.rating && (
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          Rating: {activity.data.rating}/5
                        </span>
                      )}
                      {activity.activity_type === 'review_posted' && (
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          "{activity.data.review_title}"
                        </span>
                      )}
                    </div>
                  )}
                  
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
