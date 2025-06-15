
import { Badge } from "@/components/ui/badge";
import { useUserPresence } from "@/hooks/useMessages";

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

interface UserPresenceIndicatorProps {
  userId: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export const UserPresenceIndicator = ({ 
  userId, 
  showLabel = false, 
  size = "sm" 
}: UserPresenceIndicatorProps) => {
  const { data: presence } = useUserPresence(userId);
  
  if (!presence) return null;

  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3", 
    lg: "w-4 h-4",
  };

  if (showLabel) {
    return (
      <Badge variant="secondary" className="text-xs">
        <div className={`${sizeClasses[size]} ${statusColors[presence.status]} rounded-full mr-1`} />
        {statusLabels[presence.status]}
      </Badge>
    );
  }

  return (
    <div 
      className={`${sizeClasses[size]} ${statusColors[presence.status]} rounded-full border-2 border-white`}
      title={statusLabels[presence.status]}
    />
  );
};
