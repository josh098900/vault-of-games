
import { Header } from "@/components/Header";
import { ProfileManager } from "@/components/ProfileManager";
import { ProfileStatistics } from "@/components/profile/ProfileStatistics";
import { RecentActivity } from "@/components/profile/RecentActivity";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const Profile = () => {
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
      
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4 text-gradient">Your Profile</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Manage your gaming profile and track your achievements.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Management - Left Column */}
          <div className="lg:col-span-1">
            <ProfileManager />
          </div>
          
          {/* Statistics and Activity - Right Columns */}
          <div className="lg:col-span-2 space-y-8">
            <ProfileStatistics />
            <RecentActivity />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
