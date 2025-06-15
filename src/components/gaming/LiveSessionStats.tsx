
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Clock, Users } from "lucide-react";
import { LiveSessionTimer } from "./LiveSessionTimer";

interface LiveSessionStatsProps {
  session: {
    created_at: string;
    current_participants: number;
    max_participants?: number;
  };
}

export const LiveSessionStats = ({ session }: LiveSessionStatsProps) => {
  return (
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
  );
};
