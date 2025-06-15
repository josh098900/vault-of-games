
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, Eye, Users, Play } from "lucide-react";
import { getGameImage } from "@/utils/gameImageMapping";

interface LiveSessionInfoProps {
  session: {
    id: string;
    session_type: string;
    description?: string;
    games?: {
      title: string;
      description?: string;
      genre?: string;
      platform?: string;
      cover_image_url?: string;
    };
    profiles?: {
      username: string;
      display_name: string;
      avatar_url: string;
    };
  };
}

export const LiveSessionInfo = ({ session }: LiveSessionInfoProps) => {
  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'streaming':
        return <Eye className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'looking_for_party':
        return <Users className="w-4 h-4 sm:w-5 sm:h-5" />;
      default:
        return <Play className="w-4 h-4 sm:w-5 sm:h-5" />;
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

  return (
    <>
      {/* Header with Session Type Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold">Live Gaming Session</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Join the action or watch the stream</p>
        </div>
        <Badge className={`${getSessionTypeColor(session.session_type)} px-3 py-2 self-start sm:self-auto`}>
          {getSessionTypeIcon(session.session_type)}
          <span className="ml-2 capitalize text-xs sm:text-sm">
            {session.session_type.replace('_', ' ')}
          </span>
        </Badge>
      </div>

      {/* Game Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-3">
            <img
              src={getGameImage(session.games)}
              alt={session.games?.title}
              className="w-12 h-12 sm:w-16 sm:h-16 rounded object-cover self-start"
            />
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-semibold">{session.games?.title}</h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-muted-foreground mt-1">
                <span>{session.games?.genre}</span>
                <span className="hidden sm:inline">•</span>
                <span>{session.games?.platform}</span>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {session.games?.description && (
            <p className="text-muted-foreground text-sm sm:text-base">{session.games.description}</p>
          )}
          {session.description && (
            <div>
              <h4 className="font-medium mb-2 text-sm sm:text-base">Session Description</h4>
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
          <CardTitle className="flex items-center gap-3 text-base sm:text-lg">
            <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
            Session Host
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
              <AvatarImage src={session.profiles?.avatar_url || ""} />
              <AvatarFallback className="text-sm">
                {session.profiles?.display_name?.[0] || 
                 session.profiles?.username?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm sm:text-base">
                {session.profiles?.display_name || session.profiles?.username}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">Host</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
