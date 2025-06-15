
import { useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { LiveSessionDetailView } from "@/components/gaming/LiveSessionDetailView";

const LiveSessionDetail = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
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

  if (!sessionId) {
    return <Navigate to="/social" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <LiveSessionDetailView sessionId={sessionId} />
      </div>
    </div>
  );
};

export default LiveSessionDetail;
