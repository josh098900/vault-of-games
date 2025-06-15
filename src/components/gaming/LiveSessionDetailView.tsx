
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { LiveSessionInfo } from "./LiveSessionInfo";
import { LiveSessionStats } from "./LiveSessionStats";
import { LiveSessionActions } from "./LiveSessionActions";
import { LiveSessionParticipants } from "./LiveSessionParticipants";
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

  const activeParticipants = (session.gaming_session_participants || []).filter((p: any) => !p.left_at);
  const isParticipant = activeParticipants.some((p: any) => p.user_id === user?.id);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Main Session Info */}
        <div className="lg:col-span-2 space-y-6">
          <LiveSessionInfo session={session} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <LiveSessionStats session={session} />
          
          <Card>
            <CardContent className="p-4">
              <LiveSessionActions 
                session={session} 
                isParticipant={isParticipant} 
              />
            </CardContent>
          </Card>

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
