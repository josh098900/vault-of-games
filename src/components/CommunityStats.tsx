
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, MessageCircle, TrendingUp, Calendar } from "lucide-react";

interface CommunityStatsProps {
  stats: {
    totalMembers: number;
    activeDiscussions: number;
    todaysPosts: number;
    thisWeeksPosts: number;
  };
  topContributors: Array<{
    name: string;
    avatar?: string;
    posts: number;
  }>;
}

export const CommunityStats = ({ stats, topContributors }: CommunityStatsProps) => {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="gaming-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-600/20">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Members</p>
                <p className="text-xl font-bold">{stats.totalMembers.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gaming-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-600/20">
                <MessageCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-xl font-bold">{stats.activeDiscussions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gaming-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-600/20">
                <Calendar className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today</p>
                <p className="text-xl font-bold">{stats.todaysPosts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gaming-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-600/20">
                <TrendingUp className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-xl font-bold">{stats.thisWeeksPosts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Contributors */}
      <Card className="gaming-card">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Top Contributors
          </h3>
          <div className="space-y-3">
            {topContributors.map((contributor, index) => (
              <div key={contributor.name} className="flex items-center gap-3">
                <Badge variant={index === 0 ? "default" : "secondary"} className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                  {index + 1}
                </Badge>
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white font-medium text-sm">
                  {contributor.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{contributor.name}</p>
                  <p className="text-xs text-muted-foreground">{contributor.posts} posts</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
