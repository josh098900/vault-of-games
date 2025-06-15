
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Play, Users, Eye, Clock, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useJoinGamingSession, useEndGamingSession } from "@/hooks/useLiveGamingSessions";
import { useAuth } from "@/contexts/AuthContext";
import { getGameImage } from "@/utils/gameImageMapping";
import { useNavigate } from "react-router-dom";

interface LiveGamingSessionCardProps {
  session: any;
}

export const LiveGamingSessionCard = ({ session }: LiveGamingSessionCardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const joinSession = useJoinGamingSession();
  const endSession = useEndGamingSession();

  const isHost = session.user_id === user?.id;
  const isParticipant = session.gaming_session_participants?.some(
    (p: any) => p.user_id === user?.id && !p.left_at
  );

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'streaming':
        return <Eye className="w-4 h-4" />;
      case 'looking_for_party':
        return <Users className="w-4 h-4" />;
      default:
        return <Play className="w-4 h-4" />;
    }
  };

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'streaming':
        return 'bg-purple-500/20 text-purple-400';
      case 'looking_for_party':
        return 'bg-green-500/20 text-green-400';
      default:
        return 'bg-blue-500/20 text-blue-400';
    }
  };

  const handleJoinSession = () => {
    const role = session.session_type === 'streaming' ? 'spectator' : 'participant';
    joinSession.mutate({ sessionId: session.id, role });
  };

  const handleEndSession = () => {
    endSession.mutate(session.id);
  };

  const handleViewDetails = () => {
    navigate(`/live-session/${session.id}`);
  };

  return (
    <Card className="gaming-card hover:bg-accent/50 transition-colors cursor-pointer group">
      <div onClick={handleViewDetails}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={session.profiles?.avatar_url || ""} />
                <AvatarFallback>
                  {session.profiles?.display_name?.[0] || 
                   session.profiles?.username?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-sm">
                  {session.profiles?.display_name || session.profiles?.username}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getSessionTypeColor(session.session_type)}>
                {getSessionTypeIcon(session.session_type)}
                <span className="ml-1 capitalize">
                  {session.session_type.replace('_', ' ')}
                </span>
              </Badge>
              <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <img
              src={getGameImage(session.games)}
              alt={session.games?.title}
              className="w-12 h-12 rounded object-cover"
            />
            <div className="flex-1">
              <h4 className="font-medium">{session.games?.title}</h4>
              {session.description && (
                <p className="text-sm text-muted-foreground line-clamp-1">{session.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{session.current_participants}</span>
              {session.max_participants && (
                <span>/ {session.max_participants}</span>
              )}
              <Clock className="w-4 h-4 ml-2" />
              <span>Active</span>
            </div>
          </div>
        </CardContent>
      </div>

      {/* Action buttons - prevent click propagation */}
      <CardContent className="pt-0">
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          {isHost ? (
            <Button 
              size="sm" 
              variant="destructive"
              onClick={handleEndSession}
              disabled={endSession.isPending}
              className="flex-1"
            >
              End Session
            </Button>
          ) : !isParticipant ? (
            <Button 
              size="sm"
              onClick={handleJoinSession}
              disabled={joinSession.isPending || 
                (session.max_participants && session.current_participants >= session.max_participants)}
              className="flex-1"
            >
              {session.session_type === 'streaming' ? 'Watch' : 'Join'}
            </Button>
          ) : (
            <Badge variant="secondary" className="flex-1 justify-center py-1">
              {session.session_type === 'streaming' ? 'Watching' : 'Joined'}
            </Badge>
          )}
          <Button size="sm" variant="outline" onClick={handleViewDetails}>
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
