
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Calendar, User, Globe, Gamepad2 } from "lucide-react";
import type { GameSubmission } from "@/hooks/useGameSubmission";

interface SubmissionCardProps {
  submission: GameSubmission;
  onApprove: (id: string) => void;
  onReject: (id: string, reason?: string) => void;
  isApproving?: boolean;
  isRejecting?: boolean;
}

export const SubmissionCard = ({ 
  submission, 
  onApprove, 
  onReject, 
  isApproving, 
  isRejecting 
}: SubmissionCardProps) => {
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionForm, setShowRejectionForm] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500";
      case "approved": return "bg-green-500";
      case "rejected": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const handleReject = () => {
    onReject(submission.id, rejectionReason);
    setShowRejectionForm(false);
    setRejectionReason("");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <Gamepad2 className="w-5 h-5" />
              {submission.title}
            </CardTitle>
            <CardDescription className="mt-2">
              {submission.description || "No description provided"}
            </CardDescription>
          </div>
          <Badge className={getStatusColor(submission.status!)}>
            {submission.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <span><strong>Genre:</strong> {submission.genre || "N/A"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-muted-foreground" />
            <span><strong>Platform:</strong> {submission.platform || "N/A"}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span><strong>Developer:</strong> {submission.developer || "N/A"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span><strong>Release Year:</strong> {submission.release_year || "N/A"}</span>
          </div>
        </div>

        {submission.cover_image_url && (
          <div>
            <img 
              src={submission.cover_image_url} 
              alt={`${submission.title} cover`}
              className="w-32 h-44 object-cover rounded-md"
            />
          </div>
        )}

        {submission.status === "pending" && (
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={() => onApprove(submission.id)}
              disabled={isApproving || isRejecting}
              className="flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              {isApproving ? "Approving..." : "Approve"}
            </Button>
            
            {!showRejectionForm ? (
              <Button 
                variant="destructive"
                onClick={() => setShowRejectionForm(true)}
                disabled={isApproving || isRejecting}
                className="flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </Button>
            ) : (
              <div className="flex-1 space-y-2">
                <Label htmlFor="rejection-reason">Rejection Reason (Optional)</Label>
                <Textarea
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide a reason for rejection..."
                  className="min-h-[60px]"
                />
                <div className="flex gap-2">
                  <Button 
                    variant="destructive"
                    onClick={handleReject}
                    disabled={isRejecting}
                    size="sm"
                  >
                    {isRejecting ? "Rejecting..." : "Confirm Reject"}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setShowRejectionForm(false)}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {submission.admin_notes && (
          <div className="pt-4 border-t">
            <Label className="text-sm font-medium">Admin Notes:</Label>
            <p className="text-sm text-muted-foreground mt-1">{submission.admin_notes}</p>
          </div>
        )}

        <div className="text-xs text-muted-foreground pt-2 border-t">
          <p>Submitted: {new Date(submission.created_at).toLocaleDateString()}</p>
          {submission.reviewed_at && (
            <p>Reviewed: {new Date(submission.reviewed_at).toLocaleDateString()}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
