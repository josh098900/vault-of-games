
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Crown, Eye } from "lucide-react";

interface Participant {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  left_at: string | null;
  profiles: {
    username: string;
    display_name: string;
    avatar_url: string;
  } | null;
}

interface LiveSessionParticipantsProps {
  participants: Participant[];
  sessionType: string;
}

export const LiveSessionParticipants = ({ participants, sessionType }: LiveSessionParticipantsProps) => {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'host':
        return <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />;
      case 'spectator':
        return <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />;
      default:
        return <Users className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'host':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20';
      case 'spectator':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/20';
      default:
        return 'bg-green-500/20 text-green-400 border-green-500/20';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          {sessionType === 'streaming' ? 'Viewers' : 'Participants'}
          <span className="text-xs sm:text-sm font-normal text-muted-foreground">
            ({participants.length})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {participants.length === 0 ? (
          <div className="text-center text-muted-foreground py-4 sm:py-6">
            <Users className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 opacity-50" />
            <p className="text-xs sm:text-sm">
              No {sessionType === 'streaming' ? 'viewers' : 'participants'} yet
            </p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-muted/30"
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <Avatar className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
                    <AvatarImage src={participant.profiles?.avatar_url || ""} />
                    <AvatarFallback className="text-xs">
                      {participant.profiles?.display_name?.[0] || 
                       participant.profiles?.username?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-xs sm:text-sm truncate">
                      {participant.profiles?.display_name || 
                       participant.profiles?.username || "Unknown User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      @{participant.profiles?.username || "anonymous"}
                    </p>
                  </div>
                </div>
                <Badge 
                  className={`${getRoleBadgeColor(participant.role)} text-xs flex items-center gap-1 flex-shrink-0`}
                >
                  {getRoleIcon(participant.role)}
                  <span className="capitalize">{participant.role}</span>
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
