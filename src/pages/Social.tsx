import { Header } from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { FriendsTab } from "@/components/social/FriendsTab";
import { ChallengesTab } from "@/components/social/ChallengesTab";
import { RecommendationsTab } from "@/components/social/RecommendationsTab";
import { EventsTab } from "@/components/social/EventsTab";
import { MessagesTab } from "@/components/social/MessagesTab";
import { SocialActivityFeed } from "@/components/social/SocialActivityFeed";
import { LiveGamingSessionCard } from "@/components/gaming/LiveGamingSessionCard";
import { StartGamingSessionDialog } from "@/components/gaming/StartGamingSessionDialog";
import { AchievementNotificationToast } from "@/components/gaming/AchievementNotificationToast";
import { useLiveGamingSessions } from "@/hooks/useLiveGamingSessions";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Users } from "lucide-react";

const Social = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const { data: liveSessions = [], isLoading: sessionsLoading, error: sessionsError } = useLiveGamingSessions();

  // Debug logging
  useEffect(() => {
    console.log('Live sessions data:', liveSessions);
    console.log('Sessions loading:', sessionsLoading);
    console.log('Sessions error:', sessionsError);
  }, [liveSessions, sessionsLoading, sessionsError]);

  // Handle navigation from message dropdown
  useEffect(() => {
    const state = location.state as any;
    if (state?.selectedConversation) {
      setSelectedConversation(state.selectedConversation);
    }
  }, [location.state]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const LiveSessionsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Live Gaming Sessions</h2>
          <p className="text-muted-foreground">
            Join friends who are currently playing or start your own session
          </p>
        </div>
        <StartGamingSessionDialog />
      </div>

      {sessionsError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">Error loading sessions: {sessionsError.message}</p>
          </CardContent>
        </Card>
      )}

      {sessionsLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : liveSessions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Play className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Active Sessions</h3>
            <p className="text-muted-foreground text-center mb-4">
              No one is currently hosting a gaming session. Be the first to start one!
            </p>
            <StartGamingSessionDialog />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Found {liveSessions.length} active session{liveSessions.length !== 1 ? 's' : ''}
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {liveSessions.map((session) => (
              <LiveGamingSessionCard key={session.id} session={session} />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Achievement notifications overlay */}
      <AchievementNotificationToast />
      
      {/* Social Activity Feed and Hero Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-red-600/20">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4 text-gradient">Social Gaming Hub</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with friends, take on challenges, and discover new games together.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Social Activity Feed at the top */}
        <div className="mb-8">
          <SocialActivityFeed />
        </div>

        <Tabs defaultValue={selectedConversation ? "messages" : "live-sessions"} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="live-sessions">Live Sessions</TabsTrigger>
            <TabsTrigger value="friends">Friends</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>
          
          <TabsContent value="live-sessions" className="mt-6">
            <LiveSessionsTab />
          </TabsContent>
          
          <TabsContent value="friends" className="mt-6">
            <FriendsTab />
          </TabsContent>
          
          <TabsContent value="messages" className="mt-6">
            <MessagesTab 
              initialSelectedConversation={selectedConversation}
              onConversationChange={setSelectedConversation}
            />
          </TabsContent>
          
          <TabsContent value="challenges" className="mt-6">
            <ChallengesTab />
          </TabsContent>
          
          <TabsContent value="recommendations" className="mt-6">
            <RecommendationsTab />
          </TabsContent>
          
          <TabsContent value="events" className="mt-6">
            <EventsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Social;
