
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Target, Medal } from "lucide-react";
import { useAchievementNotifications } from "@/hooks/useAchievements";

const getAchievementIcon = (type: string) => {
  switch (type) {
    case 'game_completed':
      return <Trophy className="w-6 h-6 text-amber-400" />;
    case 'high_score':
      return <Star className="w-6 h-6 text-blue-400" />;
    case 'milestone':
      return <Target className="w-6 h-6 text-green-400" />;
    default:
      return <Medal className="w-6 h-6 text-purple-400" />;
  }
};

export const AchievementNotificationToast = () => {
  const { data: achievements = [] } = useAchievementNotifications();

  // Show floating achievement notifications
  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
      {achievements.slice(0, 3).map((achievement) => (
        <Card 
          key={achievement.id} 
          className="p-4 border-2 border-amber-400/50 bg-gradient-to-r from-amber-900/20 to-yellow-900/20 animate-in slide-in-from-right duration-500"
        >
          <div className="flex items-center gap-3">
            {getAchievementIcon(achievement.achievement_type)}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-amber-500/20 text-amber-400 text-xs">
                  🎉 Achievement
                </Badge>
              </div>
              <h4 className="font-semibold text-sm">{achievement.achievement_title}</h4>
              {achievement.achievement_description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {achievement.achievement_description}
                </p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
