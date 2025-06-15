import { Header } from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { FriendsTab } from "@/components/social/FriendsTab";
import { GroupsTab } from "@/components/social/GroupsTab";
import { ChallengesTab } from "@/components/social/ChallengesTab";
import { RecommendationsTab } from "@/components/social/RecommendationsTab";
import { EventsTab } from "@/components/social/EventsTab";
import { MessagesTab } from "@/components/social/MessagesTab";
import { SocialActivityFeed } from "@/components/social/SocialActivityFeed";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const Social = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Social Activity Feed and Hero Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-red-600/20">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4 text-gradient">Social Gaming Hub</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with friends, join groups, take on challenges, and discover new games together.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Social Activity Feed at the top */}
        <div className="mb-8">
          <SocialActivityFeed />
        </div>

        <Tabs defaultValue={selectedConversation ? "messages" : "friends"} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="friends">Friends</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>
          
          <TabsContent value="friends" className="mt-6">
            <FriendsTab />
          </TabsContent>
          
          <TabsContent value="messages" className="mt-6">
            <MessagesTab 
              initialSelectedConversation={selectedConversation}
              onConversationChange={setSelectedConversation}
            />
          </TabsContent>
          
          <TabsContent value="groups" className="mt-6">
            <GroupsTab />
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
