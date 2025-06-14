
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, TrendingUp, MessageCircle, Users } from "lucide-react";
import { Header } from "@/components/Header";
import { DiscussionCard } from "@/components/DiscussionCard";
import { CreateDiscussionDialog } from "@/components/CreateDiscussionDialog";
import { CommunityStats } from "@/components/CommunityStats";
import { toast } from "@/hooks/use-toast";

// Mock data for discussions
const mockDiscussions = [
  {
    id: "1",
    title: "Best RPGs of 2024 - What are your favorites?",
    content: "I've been diving into some amazing RPGs this year and wanted to share my thoughts. Baldur's Gate 3 absolutely blew me away with its storytelling and character development. The voice acting is phenomenal and every choice feels meaningful...",
    category: "Game Reviews",
    author: { name: "GameMaster42", avatar: "" },
    replies: 23,
    likes: 45,
    views: 234,
    lastActivity: "2024-01-15T10:30:00Z",
    createdAt: "2024-01-14T08:15:00Z",
    tags: ["rpg", "2024", "recommendations"]
  },
  {
    id: "2",
    title: "Looking for co-op partners for Elden Ring",
    content: "Anyone interested in doing some co-op runs through Elden Ring? I'm on PC and usually play evenings EST. Looking for chill players who don't mind dying a lot while we learn the bosses together!",
    category: "Multiplayer",
    author: { name: "SoulsVeteran", avatar: "" },
    replies: 12,
    likes: 28,
    views: 156,
    lastActivity: "2024-01-15T14:22:00Z",
    createdAt: "2024-01-15T09:45:00Z",
    tags: ["elden-ring", "co-op", "pc"]
  },
  {
    id: "3",
    title: "Performance issues with Cyberpunk 2077 after update",
    content: "Has anyone else been experiencing frame drops and stuttering after the latest Cyberpunk 2077 update? My rig used to run it smoothly at high settings, but now I'm getting constant dips below 30fps...",
    category: "Technical Help",
    author: { name: "TechTrouble", avatar: "" },
    replies: 8,
    likes: 15,
    views: 89,
    lastActivity: "2024-01-15T16:10:00Z",
    createdAt: "2024-01-15T12:30:00Z",
    tags: ["cyberpunk", "performance", "help"]
  }
];

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [discussions, setDiscussions] = useState(mockDiscussions);
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set()); // Track which discussions user has liked

  const filteredDiscussions = discussions.filter(discussion => {
    const matchesSearch = !searchQuery || 
      discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discussion.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discussion.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === "All Categories" || discussion.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleCreateDiscussion = (newDiscussion: any) => {
    const discussion = {
      id: Date.now().toString(),
      ...newDiscussion,
      author: { name: "You", avatar: "" },
      replies: 0,
      likes: 0,
      views: 0,
      lastActivity: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    setDiscussions([discussion, ...discussions]);
    toast({
      title: "Discussion created!",
      description: "Your discussion has been posted to the community.",
    });
  };

  const handleLikeDiscussion = (id: string) => {
    const isCurrentlyLiked = userLikes.has(id);
    
    setDiscussions(discussions.map(d => 
      d.id === id ? { 
        ...d, 
        likes: isCurrentlyLiked ? d.likes - 1 : d.likes + 1 
      } : d
    ));

    setUserLikes(prev => {
      const newLikes = new Set(prev);
      if (isCurrentlyLiked) {
        newLikes.delete(id);
      } else {
        newLikes.add(id);
      }
      return newLikes;
    });
  };

  const handleDiscussionClick = (id: string) => {
    // In a real app, this would navigate to the discussion detail page
    toast({
      title: "Discussion clicked",
      description: "In a full implementation, this would open the discussion details.",
    });
  };

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

            {/* Stats Bar */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground bg-card/50 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                <span>{filteredDiscussions.length} discussions</span>
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
              {filteredDiscussions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No discussions found.</p>
                </div>
              ) : (
                filteredDiscussions.map((discussion) => (
                  <DiscussionCard
                    key={discussion.id}
                    discussion={discussion}
                    onLike={handleLikeDiscussion}
                    onClick={handleDiscussionClick}
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
