
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Clock, Users, BookOpen, Target } from "lucide-react";
import { useUserGames } from "@/hooks/useUserGames";
import { useFriends } from "@/hooks/useFriends";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { LevelUpSystem } from "@/components/LevelUpSystem";

export const ProfileStatistics = () => {
  const { user } = useAuth();
  const { userGames } = useUserGames();
  const { following, followers } = useFriends();

  const { data: reviewStats } = useQuery({
    queryKey: ["userReviewStats", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("reviews")
        .select("rating")
        .eq("user_id", user.id);

      if (error) throw error;
      
      const totalReviews = data.length;
      const averageRating = totalReviews > 0 
        ? data.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
        : 0;

      return { totalReviews, averageRating };
    },
    enabled: !!user,
  });

  // Calculate gaming statistics
  const completedGames = userGames.filter(game => game.status === 'completed').length;
  const currentlyPlaying = userGames.filter(game => game.status === 'playing').length;
  const totalHours = userGames.reduce((sum, game) => sum + (game.hours_played || 0), 0);
  const averageRating = userGames.filter(game => game.user_rating).length > 0
    ? userGames.filter(game => game.user_rating).reduce((sum, game) => sum + (game.user_rating || 0), 0) / userGames.filter(game => game.user_rating).length
    : 0;

  const stats = [
    {
      icon: <Trophy className="w-5 h-5 text-amber-400 morphing-icon" />,
      label: "Games Completed",
      value: completedGames,
      color: "bg-amber-600/10 border-amber-600/20",
      glow: "glow-yellow"
    },
    {
      icon: <Target className="w-5 h-5 text-blue-400 morphing-icon" />,
      label: "Currently Playing",
      value: currentlyPlaying,
      color: "bg-blue-600/10 border-blue-600/20",
      glow: "glow-blue"
    },
    {
      icon: <Clock className="w-5 h-5 text-purple-400 morphing-icon" />,
      label: "Hours Played",
      value: `${totalHours}h`,
      color: "bg-purple-600/10 border-purple-600/20",
      glow: "glow-purple"
    },
    {
      icon: <Star className="w-5 h-5 text-yellow-400 morphing-icon" />,
      label: "Avg Game Rating",
      value: averageRating > 0 ? averageRating.toFixed(1) : "N/A",
      color: "bg-yellow-600/10 border-yellow-600/20",
      glow: "glow-yellow"
    },
    {
      icon: <Users className="w-5 h-5 text-green-400 morphing-icon" />,
      label: "Following",
      value: following.length,
      color: "bg-green-600/10 border-green-600/20",
      glow: "glow-green"
    },
    {
      icon: <Users className="w-5 h-5 text-pink-400 morphing-icon" />,
      label: "Followers",
      value: followers.length,
      color: "bg-pink-600/10 border-pink-600/20",
      glow: "glow-pink"
    },
    {
      icon: <BookOpen className="w-5 h-5 text-indigo-400 morphing-icon" />,
      label: "Reviews Written",
      value: reviewStats?.totalReviews || 0,
      color: "bg-indigo-600/10 border-indigo-600/20",
      glow: "glow-indigo"
    },
    {
      icon: <Star className="w-5 h-5 text-orange-400 morphing-icon" />,
      label: "Avg Review Rating",
      value: reviewStats?.averageRating ? reviewStats.averageRating.toFixed(1) : "N/A",
      color: "bg-orange-600/10 border-orange-600/20",
      glow: "glow-orange"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Level Up System */}
      <LevelUpSystem />

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 morphing-icon" />
            Gaming Statistics
          </CardTitle>
          <CardDescription>
            Your gaming achievements and social stats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className={`glass-card p-4 ${stat.color} micro-interaction group hover:${stat.glow} transition-all duration-300`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  {stat.icon}
                  <span className="text-sm font-medium text-foreground">{stat.label}</span>
                </div>
                <div className="text-2xl font-bold text-foreground animate-counter">
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
          
          {userGames.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium mb-3">Game Status Breakdown</h4>
              <div className="flex flex-wrap gap-2">
                {['playing', 'completed', 'wishlist', 'backlog', 'dropped'].map((status) => {
                  const count = userGames.filter(game => game.status === status).length;
                  return count > 0 ? (
                    <Badge key={status} variant="outline" className="glass-card border-white/20 capitalize micro-interaction">
                      {status}: {count}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
