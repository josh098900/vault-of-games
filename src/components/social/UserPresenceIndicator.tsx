
import { Badge } from "@/components/ui/badge";
import { useEnhancedUserPresence } from "@/hooks/useEnhancedUserPresence";
import { Gamepad2, Coffee, Moon, Zap } from "lucide-react";

const statusColors = {
  online: "bg-green-500",
  away: "bg-yellow-500", 
  busy: "bg-red-500",
  offline: "bg-gray-400",
};

const statusLabels = {
  online: "Online",
  away: "Away",
  busy: "Busy", 
  offline: "Offline",
};

const gameStatusIcons = {
  playing: <Gamepad2 className="w-3 h-3" />,
  paused: <Coffee className="w-3 h-3" />,
  menu: <Moon className="w-3 h-3" />,
  lobby: <Zap className="w-3 h-3" />,
  offline: null,
};

interface UserPresenceIndicatorProps {
  userId: string;
  showLabel?: boolean;
  showGameStatus?: boolean;
  size?: "sm" | "md" | "lg";
}

export const UserPresenceIndicator = ({ 
  userId, 
  showLabel = false, 
  showGameStatus = false,
  size = "sm" 
}: UserPresenceIndicatorProps) => {
  const { data: presence } = useEnhancedUserPresence(userId);
  
  if (!presence) return null;

  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3", 
    lg: "w-4 h-4",
  };

  if (showLabel || showGameStatus) {
    return (
      <div className="flex flex-col gap-1">
        <Badge variant="secondary" className="text-xs">
          <div className={`${sizeClasses[size]} ${statusColors[presence.status]} rounded-full mr-1`} />
          {statusLabels[presence.status]}
        </Badge>
        
        {showGameStatus && presence.game_status && presence.game_status !== 'offline' && (
          <div className="flex items-center gap-2">
            {presence.games && (
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                {gameStatusIcons[presence.game_status as keyof typeof gameStatusIcons]}
                <span className="capitalize">{presence.game_status}</span>
                <span className="text-muted-foreground">•</span>
                <span>{presence.games.title}</span>
              </Badge>
            )}
            {presence.custom_status && (
              <Badge variant="secondary" className="text-xs">
                {presence.custom_status}
              </Badge>
            )}
            {presence.mood && (
              <span className="text-lg" title={`Mood: ${presence.mood}`}>
                {presence.mood}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className={`${sizeClasses[size]} ${statusColors[presence.status]} rounded-full border-2 border-white relative`}
      title={statusLabels[presence.status]}
    >
      {presence.game_status && presence.game_status !== 'offline' && (
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border border-white flex items-center justify-center">
          <Gamepad2 className="w-2 h-2 text-white" />
        </div>
      )}
    </div>
  );
};
