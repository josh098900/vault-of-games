
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Eye, Play } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Participant {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profiles: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

interface LiveSessionParticipantsProps {
  participants: Participant[];
  sessionType: string;
}

export const LiveSessionParticipants = ({ participants, sessionType }: LiveSessionParticipantsProps) => {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'spectator':
        return <Eye className="w-3 h-3" />;
      default:
        return <Play className="w-3 h-3" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'spectator':
        return 'bg-purple-500/20 text-purple-400';
      default:
        return 'bg-blue-500/20 text-blue-400';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Participants ({participants.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {participants.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No participants yet
          </p>
        ) : (
          participants.map((participant) => (
            <div key={participant.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={participant.profiles?.avatar_url || ""} />
                  <AvatarFallback>
                    {participant.profiles?.display_name?.[0] || 
                     participant.profiles?.username?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {participant.profiles?.display_name || participant.profiles?.username}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Joined {formatDistanceToNow(new Date(participant.joined_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <Badge className={`${getRoleColor(participant.role)} text-xs`}>
                {getRoleIcon(participant.role)}
                <span className="ml-1 capitalize">{participant.role}</span>
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
