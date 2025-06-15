
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserGames } from "@/hooks/useUserGames";

interface LevelUpSystemProps {
  className?: string;
}

export const LevelUpSystem = ({ className }: LevelUpSystemProps) => {
  const { user } = useAuth();
  const { userGames } = useUserGames();
  const [currentXP, setCurrentXP] = useState(0);
  const [level, setLevel] = useState(1);
  const [showLevelUp, setShowLevelUp] = useState(false);

  // Calculate XP based on user activities
  const calculateXP = () => {
    const gamesCompleted = userGames.filter(game => game.status === 'completed').length;
    const hoursPlayed = userGames.reduce((sum, game) => sum + (game.hours_played || 0), 0);
    const gamesRated = userGames.filter(game => game.user_rating).length;
    
    return (gamesCompleted * 100) + (hoursPlayed * 5) + (gamesRated * 25);
  };

  // Calculate level from XP
  const calculateLevel = (xp: number) => {
    return Math.floor(xp / 500) + 1;
  };

  const getXPForNextLevel = (currentLevel: number) => {
    return currentLevel * 500;
  };

  const getCurrentLevelXP = (xp: number, currentLevel: number) => {
    return xp - ((currentLevel - 1) * 500);
  };

  useEffect(() => {
    if (userGames.length > 0) {
      const newXP = calculateXP();
      const newLevel = calculateLevel(newXP);
      
      if (newLevel > level && level > 1) {
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 3000);
      }
      
      setCurrentXP(newXP);
      setLevel(newLevel);
    }
  }, [userGames, level]);

  const xpForNextLevel = getXPForNextLevel(level);
  const currentLevelXP = getCurrentLevelXP(currentXP, level);
  const progressPercentage = (currentLevelXP / 500) * 100;

  const getLevelBadgeColor = (level: number) => {
    if (level >= 50) return "from-purple-400 to-pink-500";
    if (level >= 25) return "from-blue-400 to-purple-500";
    if (level >= 10) return "from-green-400 to-blue-500";
    return "from-yellow-400 to-orange-500";
  };

  const getLevelTitle = (level: number) => {
    if (level >= 50) return "Gaming Legend";
    if (level >= 25) return "Master Gamer";
    if (level >= 10) return "Experienced Player";
    if (level >= 5) return "Rising Star";
    return "Novice Gamer";
  };

  if (!user) return null;

  return (
    <>
      <Card className={`glass-card ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`level-badge bg-gradient-to-r ${getLevelBadgeColor(level)} animate-scale-in`}>
                <Trophy className="w-4 h-4 inline mr-1" />
                Level {level}
              </div>
              <div>
                <h3 className="font-bold text-lg">{getLevelTitle(level)}</h3>
                <p className="text-sm text-muted-foreground">
                  {currentXP.toLocaleString()} XP
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Next Level</p>
              <p className="font-bold">{(500 - currentLevelXP).toLocaleString()} XP</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to Level {level + 1}</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="xp-bar h-3">
              <div 
                className="xp-fill animate-counter"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 text-center">
            <div className="p-2 rounded-lg bg-primary/10">
              <Star className="w-4 h-4 mx-auto mb-1 text-yellow-400" />
              <p className="text-xs font-medium">Games</p>
              <p className="text-sm">{userGames.length}</p>
            </div>
            <div className="p-2 rounded-lg bg-green-500/10">
              <Trophy className="w-4 h-4 mx-auto mb-1 text-green-400" />
              <p className="text-xs font-medium">Completed</p>
              <p className="text-sm">{userGames.filter(g => g.status === 'completed').length}</p>
            </div>
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Zap className="w-4 h-4 mx-auto mb-1 text-purple-400" />
              <p className="text-xs font-medium">Hours</p>
              <p className="text-sm">{userGames.reduce((sum, game) => sum + (game.hours_played || 0), 0)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Level Up Notification */}
      {showLevelUp && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-level-up">
          <Card className="glass-card border-2 border-yellow-400 glow-blue">
            <CardContent className="p-6 text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-400 animate-pulse" />
              <h2 className="text-2xl font-bold text-gradient mb-2">LEVEL UP!</h2>
              <p className="text-lg">You reached Level {level}!</p>
              <Badge className="mt-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black">
                {getLevelTitle(level)}
              </Badge>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};
