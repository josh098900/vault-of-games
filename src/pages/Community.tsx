
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, TrendingUp, MessageCircle, Users } from "lucide-react";
import { Header } from "@/components/Header";
import { DiscussionCard } from "@/components/DiscussionCard";
import { CreateDiscussionDialog } from "@/components/CreateDiscussionDialog";
import { CommunityStats } from "@/components/CommunityStats";
import { DiscussionSorting, SortOption } from "@/components/DiscussionSorting";
import { useDiscussions, useCreateDiscussion, useLikeDiscussion } from "@/hooks/useDiscussions";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

// Mock stats for now - these would come from the database in a real implementation
const mockStats = {
  totalMembers: 15420,
  activeDiscussions: 127,
  todaysPosts: 34,
  thisWeeksPosts: 298
};

const mockTopContributors = [
  { name: "GameMaster42", posts: 156 },
  { name: "PixelPundit", posts: 134 },
  { name: "RetroGamer", posts: 98 },
  { name: "SpeedRunner23", posts: 87 },
  { name: "IndieExplorer", posts: 72 }
];

const categories = [
  "All Categories",
  "General Discussion", 
  "Game Reviews",
  "Technical Help",
  "Gaming News",
  "Multiplayer",
  "Recommendations",
  "Off Topic"
];

const Community = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [timeFilter, setTimeFilter] = useState("All Time");

  const { data: discussions = [], isLoading, error } = useDiscussions(
    searchQuery || undefined, 
    selectedCategory !== "All Categories" ? selectedCategory : undefined
  );
  
  const createDiscussionMutation = useCreateDiscussion();
  const likeDiscussionMutation = useLikeDiscussion();

  const handleCreateDiscussion = (newDiscussion: any) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create discussions.",
        variant: "destructive",
      });
      return;
    }

    createDiscussionMutation.mutate(newDiscussion);
  };

  const handleLikeDiscussion = (id: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like discussions.",
        variant: "destructive",
      });
      return;
    }

    const discussion = discussions.find(d => d.id === id);
    if (discussion) {
      likeDiscussionMutation.mutate({
        discussionId: id,
        isLiked: discussion.is_liked || false
      });
    }
  };

  const handleDiscussionClick = (id: string) => {
    // In a real app, this would navigate to the discussion detail page
    toast({
      title: "Discussion clicked",
      description: "In a full implementation, this would open the discussion details.",
    });
  };

  // Sort discussions based on selected option
  const sortDiscussions = (discussions: any[]) => {
    const sorted = [...discussions];
    
    switch (sortBy) {
      case "oldest":
        return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      case "most_liked":
        return sorted.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
      case "most_replies":
        return sorted.sort((a, b) => (b.replies_count || 0) - (a.replies_count || 0));
      case "most_views":
        return sorted.sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
      case "recently_active":
        return sorted.sort((a, b) => new Date(b.last_activity_at || b.created_at).getTime() - new Date(a.last_activity_at || a.created_at).getTime());
      case "newest":
      default:
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  };

  // Filter discussions by time period
  const filterByTime = (discussions: any[]) => {
    if (timeFilter === "All Time") return discussions;
    
    const now = new Date();
    const timeThresholds = {
      "Today": new Date(now.setHours(0, 0, 0, 0)),
      "This Week": new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      "This Month": new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    };
    
    const threshold = timeThresholds[timeFilter as keyof typeof timeThresholds];
    if (!threshold) return discussions;
    
    return discussions.filter(discussion => 
      new Date(discussion.created_at) >= threshold
    );
  };

  // Apply sorting and filtering
  const processedDiscussions = sortDiscussions(filterByTime(discussions));

  // Transform discussions to match the expected format
  const transformedDiscussions = processedDiscussions.map(discussion => ({
    id: discussion.id,
    title: discussion.title,
    content: discussion.content,
    category: discussion.category,
    author: {
      name: discussion.profiles?.display_name || discussion.profiles?.username || "Anonymous",
      avatar: discussion.profiles?.avatar_url || undefined,
    },
    replies: discussion.replies_count,
    likes: discussion.likes_count,
    views: discussion.views_count || 0,
    lastActivity: discussion.last_activity_at,
    createdAt: discussion.created_at,
    tags: discussion.tags || [],
    isLiked: discussion.is_liked || false,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4 text-gradient">Gaming Community</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with fellow gamers, share experiences, and discover new perspectives in our vibrant community.
          </p>
          <CreateDiscussionDialog onSubmit={handleCreateDiscussion} />
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <CommunityStats stats={mockStats} topContributors={mockTopContributors} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search discussions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50 border-white/20"
                />
              </div>
              <Button variant="outline" className="border-white/20">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className={`cursor-pointer ${
                    selectedCategory === category ? "bg-primary" : "border-white/20"
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>

            {/* Sorting and Time Filters */}
            <DiscussionSorting
              currentSort={sortBy}
              onSortChange={setSortBy}
              currentTimeFilter={timeFilter}
              onTimeFilterChange={setTimeFilter}
            />

            {/* Stats Bar */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground bg-card/50 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                <span>{transformedDiscussions.length} discussions</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{mockStats.totalMembers.toLocaleString()} members</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>{mockStats.todaysPosts} posts today</span>
              </div>
            </div>

            {/* Discussions List */}
            <div className="space-y-4">
              {error ? (
                <div className="text-center py-8">
                  <p className="text-destructive">Error loading discussions. Please try again.</p>
                </div>
              ) : isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="gaming-card p-6 animate-pulse">
                      <div className="space-y-3">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                        <div className="h-4 bg-muted rounded w-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : transformedDiscussions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No discussions found.</p>
                </div>
              ) : (
                transformedDiscussions.map((discussion) => (
                  <DiscussionCard
                    key={discussion.id}
                    discussion={discussion}
                    onLike={handleLikeDiscussion}
                    onClick={handleDiscussionClick}
                    isLiked={discussion.isLiked}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
