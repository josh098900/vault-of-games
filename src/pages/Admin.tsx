
import { Header } from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useAdminSubmissions } from "@/hooks/useAdminSubmissions";
import { SubmissionCard } from "@/components/SubmissionCard";
import { Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, Users } from "lucide-react";

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const { canReviewSubmissions, isLoading: roleLoading } = useUserRole();
  const {
    pendingSubmissions,
    reviewedSubmissions,
    isLoading: submissionsLoading,
    approveSubmission,
    rejectSubmission,
    isApproving,
    isRejecting,
  } = useAdminSubmissions();

  if (authLoading || roleLoading) {
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

  if (!canReviewSubmissions) {
    return <Navigate to="/" replace />;
  }

  const approvedCount = reviewedSubmissions.filter(s => s.status === "approved").length;
  const rejectedCount = reviewedSubmissions.filter(s => s.status === "rejected").length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="py-16 px-4 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-teal-600/20">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4 text-gradient">Admin Dashboard</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Review and manage game submissions from the community.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingSubmissions.length}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting review
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedCount}</div>
              <p className="text-xs text-muted-foreground">
                Added to database
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rejectedCount}</div>
              <p className="text-xs text-muted-foreground">
                Not approved
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pendingSubmissions.length + reviewedSubmissions.length}
              </div>
              <p className="text-xs text-muted-foreground">
                All submissions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Submissions Tabs */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending ({pendingSubmissions.length})
            </TabsTrigger>
            <TabsTrigger value="reviewed" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Reviewed ({reviewedSubmissions.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="space-y-4">
            {submissionsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-64 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : pendingSubmissions.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No pending submissions</h3>
                    <p className="text-muted-foreground">
                      All submissions have been reviewed. Great job!
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {pendingSubmissions.map((submission) => (
                  <SubmissionCard
                    key={submission.id}
                    submission={submission}
                    onApprove={(id) => approveSubmission.mutate(id)}
                    onReject={(id, reason) => rejectSubmission.mutate({ submissionId: id, reason })}
                    isApproving={isApproving}
                    isRejecting={isRejecting}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="reviewed" className="space-y-4">
            {submissionsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-64 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : reviewedSubmissions.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No reviewed submissions</h3>
                    <p className="text-muted-foreground">
                      Start reviewing pending submissions to see them here.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {reviewedSubmissions.map((submission) => (
                  <SubmissionCard
                    key={submission.id}
                    submission={submission}
                    onApprove={() => {}}
                    onReject={() => {}}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
