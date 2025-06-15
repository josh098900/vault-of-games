
import { Header } from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { FriendsTab } from "@/components/social/FriendsTab";
import { GroupsTab } from "@/components/social/GroupsTab";
import { ChallengesTab } from "@/components/social/ChallengesTab";
import { RecommendationsTab } from "@/components/social/RecommendationsTab";
import { EventsTab } from "@/components/social/EventsTab";

const Social = () => {
  const { user, loading } = useAuth();

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
      
      <section className="py-16 px-4 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-red-600/20">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4 text-gradient">Social Gaming Hub</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with friends, join groups, take on challenges, and discover new games together.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="friends" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="friends">Friends</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>
          
          <TabsContent value="friends" className="mt-6">
            <FriendsTab />
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
