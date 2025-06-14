
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Users, MessageSquare, TrendingUp, Calendar, Pin } from "lucide-react";
import { Header } from "@/components/Header";

const Community = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const discussions = [
    {
      id: 1,
      title: "Best RPGs of 2023 - What's your top pick?",
      author: "RPGLover",
      authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=32&h=32&fit=crop&crop=face",
      category: "Discussion",
      replies: 42,
      lastActivity: "2 hours ago",
      isPinned: true,
      tags: ["RPG", "2023", "Recommendations"]
    },
    {
      id: 2,
      title: "Looking for co-op partners for Baldur's Gate 3",
      author: "PartySeeker",
      authorAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b5bb?w=32&h=32&fit=crop&crop=face",
      category: "LFG",
      replies: 15,
      lastActivity: "4 hours ago",
      isPinned: false,
      tags: ["Co-op", "Baldur's Gate 3", "PC"]
    },
    {
      id: 3,
      title: "Spider-Man 2 - Performance issues on PS5?",
      author: "TechGamer",
      authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
      category: "Technical",
      replies: 28,
      lastActivity: "6 hours ago",
      isPinned: false,
      tags: ["Spider-Man 2", "PS5", "Performance"]
    }
  ];

  const activeUsers = [
    { name: "GameMaster42", status: "online", level: 15 },
    { name: "IndieExplorer", status: "online", level: 12 },
    { name: "CompetitivePro", status: "away", level: 18 },
    { name: "CasualGamer", status: "online", level: 8 }
  ];

  const events = [
    {
      title: "Weekly Game Night",
      date: "2023-11-18",
      time: "8:00 PM EST",
      participants: 24
    },
    {
      title: "Speedrun Competition",
      date: "2023-11-20",
      time: "3:00 PM EST",
      participants: 16
    }
  ];

  const filteredDiscussions = discussions.filter(discussion =>
    searchQuery === "" || 
    discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    discussion.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-6">Community</h1>
              
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search discussions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button className="bg-primary hover:bg-primary/80">
                  New Discussion
                </Button>
              </div>
            </div>

            <Tabs defaultValue="all" className="mb-6">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="discussion">Discussions</TabsTrigger>
                <TabsTrigger value="lfg">Looking for Group</TabsTrigger>
                <TabsTrigger value="technical">Technical</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {filteredDiscussions.map((discussion) => (
                  <Card key={discussion.id} className="gaming-card">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          {discussion.isPinned && (
                            <Pin className="w-4 h-4 text-primary" />
                          )}
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={discussion.authorAvatar} />
                            <AvatarFallback>{discussion.author[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{discussion.author}</p>
                            <p className="text-sm text-muted-foreground">{discussion.lastActivity}</p>
                          </div>
                        </div>
                        <Badge variant="outline">{discussion.category}</Badge>
                      </div>
                      
                      <h3 className="text-lg font-semibold mb-3 hover:text-primary cursor-pointer">
                        {discussion.title}
                      </h3>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          {discussion.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          {discussion.replies} replies
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 space-y-6">
            {/* Active Users */}
            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Active Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeUsers.map((user, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          user.status === 'online' ? 'bg-green-400' : 'bg-yellow-400'
                        }`} />
                        <span className="text-sm">{user.name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Lvl {user.level}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {events.map((event, index) => (
                    <div key={index} className="border-l-2 border-primary pl-4">
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.date).toLocaleDateString()} at {event.time}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {event.participants} participants
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Community Stats */}
            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="text-lg">Community Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Members</span>
                    <span className="font-medium">2,847</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Online Now</span>
                    <span className="font-medium">156</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Active Discussions</span>
                    <span className="font-medium">89</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
