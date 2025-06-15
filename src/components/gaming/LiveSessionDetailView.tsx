import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Play, Users, Clock, UserPlus, Crown, Eye } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { LiveSessionTimer } from "./LiveSessionTimer";
import { LiveSessionParticipants } from "./LiveSessionParticipants";
import { InviteToSessionDialog } from "./InviteToSessionDialog";
import { useJoinGamingSession, useEndGamingSession } from "@/hooks/useLiveGamingSessions";
import { getGameImage } from "@/utils/gameImageMapping";
import { LiveSessionChat } from "./LiveSessionChat";

interface LiveSessionDetailViewProps {
  sessionId: string;
}

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

export const LiveSessionDetailView = ({ sessionId }: LiveSessionDetailViewProps) => {
  const { user } = useAuth();
  const joinSession = useJoinGamingSession();
  const endSession = useEndGamingSession();

  const { data: session, isLoading, error } = useQuery({
    queryKey: ['live-session-detail', sessionId],
    queryFn: async () => {
      console.log('Fetching session detail for:', sessionId);
      
      // First get the session with game and host info
      const { data: sessionData, error: sessionError } = await supabase
        .from('live_gaming_sessions')
        .select(`
          *,
          games!inner(title, cover_image_url, description, genre, platform),
          profiles!inner(username, display_name, avatar_url)
        `)
        .eq('id', sessionId)
        .eq('status', 'active')
        .single();

      if (sessionError) {
        console.error('Error fetching session:', sessionError);
        throw sessionError;
      }

      // Then get participants with their profiles
      const { data: participantsData, error: participantsError } = await supabase
        .from('gaming_session_participants')
        .select(`
          id,
          user_id,
          role,
          joined_at,
          left_at
        `)
        .eq('session_id', sessionId);

      if (participantsError) {
        console.error('Error fetching participants:', participantsError);
        throw participantsError;
      }

      // Get profile data for participants
      let participantsWithProfiles = [];
      if (participantsData && participantsData.length > 0) {
        const participantIds = participantsData.map(p => p.user_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .in('id', participantIds);

        if (profilesError) {
          console.error('Error fetching participant profiles:', profilesError);
        }

        participantsWithProfiles = participantsData.map(participant => {
          const profile = profilesData?.find(p => p.id === participant.user_id);
          return {
            ...participant,
            profiles: profile ? {
              username: profile.username,
              display_name: profile.display_name,
              avatar_url: profile.avatar_url
            } : null
          };
        });
      }

      console.log('Successfully fetched session:', sessionData);
      
      // Return data in the expected format
      return {
        ...sessionData,
        games: sessionData.games,
        profiles: sessionData.profiles,
        gaming_session_participants: participantsWithProfiles
      };
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !session) {
    console.error('Session not found or error:', error);
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Session not found or no longer active.</p>
          <p className="text-sm text-muted-foreground mt-2">
            The session may have ended or you may not have permission to view it.
          </p>
        </CardContent>
      </Card>
    );
  }

  const isHost = session.user_id === user?.id;
  const activeParticipants = (session.gaming_session_participants || []).filter((p: any) => !p.left_at);
  const isParticipant = activeParticipants.some((p: any) => p.user_id === user?.id);

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'streaming':
        return <Eye className="w-5 h-5" />;
      case 'looking_for_party':
        return <Users className="w-5 h-5" />;
      default:
        return <Play className="w-5 h-5" />;
    }
  };

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'streaming':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/20';
      case 'looking_for_party':
        return 'bg-green-500/20 text-green-400 border-green-500/20';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/20';
    }
  };

  const handleJoinSession = () => {
    const role = session.session_type === 'streaming' ? 'spectator' : 'participant';
    joinSession.mutate({ sessionId: session.id, role });
  };

  const handleEndSession = () => {
    endSession.mutate(session.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Live Gaming Session</h1>
          <p className="text-muted-foreground">Join the action or watch the stream</p>
        </div>
        <Badge className={`${getSessionTypeColor(session.session_type)} px-4 py-2`}>
          {getSessionTypeIcon(session.session_type)}
          <span className="ml-2 capitalize">
            {session.session_type.replace('_', ' ')}
          </span>
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Main Session Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Game Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <img
                  src={getGameImage(session.games)}
                  alt={session.games?.title}
                  className="w-16 h-16 rounded object-cover"
                />
                <div>
                  <h3 className="text-xl font-semibold">{session.games?.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{session.games?.genre}</span>
                    <span>•</span>
                    <span>{session.games?.platform}</span>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {session.games?.description && (
                <p className="text-muted-foreground">{session.games.description}</p>
              )}
              {session.description && (
                <div>
                  <h4 className="font-medium mb-2">Session Description</h4>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                    {session.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Host Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Crown className="w-5 h-5 text-yellow-500" />
                Session Host
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={session.profiles?.avatar_url || ""} />
                  <AvatarFallback>
                    {session.profiles?.display_name?.[0] || 
                     session.profiles?.username?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {session.profiles?.display_name || session.profiles?.username}
                  </p>
                  <p className="text-sm text-muted-foreground">Host</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Session Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Session Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <LiveSessionTimer startTime={session.created_at} />
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Participants</p>
                <div className="flex items-center gap-2 mt-1">
                  <Users className="w-4 h-4" />
                  <span className="font-medium">{session.current_participants}</span>
                  {session.max_participants && (
                    <span className="text-muted-foreground">/ {session.max_participants}</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardContent className="p-4 space-y-3">
              {isHost ? (
                <>
                  <InviteToSessionDialog sessionId={sessionId} />
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={handleEndSession}
                    disabled={endSession.isPending}
                  >
                    End Session
                  </Button>
                </>
              ) : !isParticipant ? (
                <Button 
                  className="w-full"
                  onClick={handleJoinSession}
                  disabled={joinSession.isPending || 
                    (session.max_participants && session.current_participants >= session.max_participants)}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {session.session_type === 'streaming' ? 'Watch Stream' : 'Join Session'}
                </Button>
              ) : (
                <Badge variant="secondary" className="w-full justify-center py-2">
                  {session.session_type === 'streaming' ? 'Watching' : 'Joined'}
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Participants */}
          <LiveSessionParticipants 
            participants={activeParticipants as Participant[]}
            sessionType={session.session_type}
          />
        </div>

        {/* Chat Section */}
        <div className="lg:col-span-1">
          <LiveSessionChat sessionId={sessionId} />
        </div>
      </div>
    </div>
  );
};
