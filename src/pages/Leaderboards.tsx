
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Medal, Star, TrendingUp, Award, Crown } from "lucide-react";
import { Header } from "@/components/Header";

const Leaderboards = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  const topGamers = [
    {
      rank: 1,
      name: "GameMaster42",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face",
      points: 15420,
      gamesCompleted: 89,
      averageRating: 4.8,
      streak: 15
    },
    {
      rank: 2,
      name: "SpeedRunner99",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b5bb?w=40&h=40&fit=crop&crop=face",
      points: 14250,
      gamesCompleted: 76,
      averageRating: 4.6,
      streak: 12
    },
    {
      rank: 3,
      name: "IndieExplorer",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
      points: 13890,
      gamesCompleted: 124,
      averageRating: 4.7,
      streak: 8
    }
  ];

  const topReviewers = [
    {
      rank: 1,
      name: "CriticPro",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      reviews: 156,
      helpfulVotes: 1240,
      averageRating: 4.9
    },
    {
      rank: 2,
      name: "HonestGamer",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
      reviews: 134,
      helpfulVotes: 980,
      averageRating: 4.7
    },
    {
      rank: 3,
      name: "DetailedAnalyst",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face",
      reviews: 98,
      helpfulVotes: 1450,
      averageRating: 4.8
    }
  ];

  const achievements = [
    {
      title: "Marathon Gamer",
      description: "Complete 50 games in a year",
      rarity: "Legendary",
      holders: 23
    },
    {
      title: "Review Master",
      description: "Write 100 helpful reviews",
      rarity: "Epic",
      holders: 156
    },
    {
      title: "Genre Explorer",
      description: "Play games from 10 different genres",
      rarity: "Rare",
      holders: 892
    }
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold">{rank}</span>;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Legendary':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'Epic':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'Rare':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-6 flex items-center">
            <Trophy className="w-10 h-10 mr-3 text-yellow-500" />
            Leaderboards
          </h1>
          
          <div className="flex gap-2 mb-6">
            {['week', 'month', 'year', 'all-time'].map(period => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "default" : "outline"}
                onClick={() => setSelectedPeriod(period)}
                className="capitalize"
              >
                {period.replace('-', ' ')}
              </Button>
            ))}
          </div>
        </div>

        <Tabs defaultValue="gamers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="gamers">Top Gamers</TabsTrigger>
            <TabsTrigger value="reviewers">Top Reviewers</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="gamers">
            <div className="grid gap-6">
              {/* Top 3 Spotlight */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {topGamers.slice(0, 3).map((gamer) => (
                  <Card key={gamer.rank} className="gaming-card text-center">
                    <CardContent className="p-6">
                      <div className="flex justify-center mb-4">
                        {getRankIcon(gamer.rank)}
                      </div>
                      <Avatar className="w-16 h-16 mx-auto mb-4">
                        <AvatarImage src={gamer.avatar} />
                        <AvatarFallback>{gamer.name[0]}</AvatarFallback>
                      </Avatar>
                      <h3 className="font-bold text-lg mb-2">{gamer.name}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Points:</span>
                          <span className="font-medium">{gamer.points.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Games:</span>
                          <span className="font-medium">{gamer.gamesCompleted}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Avg Rating:</span>
                          <span className="font-medium flex items-center">
                            <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                            {gamer.averageRating}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Streak:</span>
                          <span className="font-medium">{gamer.streak} days</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Extended Leaderboard */}
              <Card className="gaming-card">
                <CardHeader>
                  <CardTitle>Complete Rankings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topGamers.map((gamer, index) => (
                      <div key={gamer.rank} className="flex items-center justify-between p-4 rounded-lg bg-card/50">
                        <div className="flex items-center space-x-4">
                          <div className="w-8 flex justify-center">
                            {getRankIcon(gamer.rank)}
                          </div>
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={gamer.avatar} />
                            <AvatarFallback>{gamer.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{gamer.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {gamer.gamesCompleted} games completed
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{gamer.points.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">points</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reviewers">
            <Card className="gaming-card">
              <CardHeader>
                <CardTitle>Top Reviewers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topReviewers.map((reviewer) => (
                    <div key={reviewer.rank} className="flex items-center justify-between p-4 rounded-lg bg-card/50">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 flex justify-center">
                          {getRankIcon(reviewer.rank)}
                        </div>
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={reviewer.avatar} />
                          <AvatarFallback>{reviewer.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{reviewer.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {reviewer.reviews} reviews • {reviewer.helpfulVotes} helpful votes
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                          <span className="font-medium">{reviewer.averageRating}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">avg rating</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement, index) => (
                <Card key={index} className="gaming-card">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                      <Trophy className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{achievement.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{achievement.description}</p>
                    <div className="space-y-2">
                      <Badge className={getRarityColor(achievement.rarity)}>
                        {achievement.rarity}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        Earned by {achievement.holders} players
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Leaderboards;
