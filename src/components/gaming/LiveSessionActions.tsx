
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { InviteToSessionDialog } from "./InviteToSessionDialog";
import { useJoinGamingSession, useEndGamingSession } from "@/hooks/useLiveGamingSessions";

interface LiveSessionActionsProps {
  session: {
    id: string;
    user_id: string;
    session_type: string;
    max_participants?: number;
    current_participants: number;
  };
  isParticipant: boolean;
}

export const LiveSessionActions = ({ session, isParticipant }: LiveSessionActionsProps) => {
  const { user } = useAuth();
  const joinSession = useJoinGamingSession();
  const endSession = useEndGamingSession();

  const isHost = session.user_id === user?.id;

  const handleJoinSession = () => {
    const role = session.session_type === 'streaming' ? 'spectator' : 'participant';
    joinSession.mutate({ sessionId: session.id, role });
  };

  const handleEndSession = () => {
    endSession.mutate(session.id);
  };

  if (isHost) {
    return (
      <div className="space-y-3">
        <InviteToSessionDialog sessionId={session.id} />
        <Button 
          variant="destructive" 
          className="w-full"
          onClick={handleEndSession}
          disabled={endSession.isPending}
        >
          End Session
        </Button>
      </div>
    );
  }

  if (!isParticipant) {
    return (
      <Button 
        className="w-full"
        onClick={handleJoinSession}
        disabled={joinSession.isPending || 
          (session.max_participants && session.current_participants >= session.max_participants)}
      >
        <UserPlus className="w-4 h-4 mr-2" />
        {session.session_type === 'streaming' ? 'Watch Stream' : 'Join Session'}
      </Button>
    );
  }

  return (
    <Badge variant="secondary" className="w-full justify-center py-2">
      {session.session_type === 'streaming' ? 'Watching' : 'Joined'}
    </Badge>
  );
};
