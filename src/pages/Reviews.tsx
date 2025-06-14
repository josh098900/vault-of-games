
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Star, ThumbsUp, MessageSquare, Calendar } from "lucide-react";
import { Header } from "@/components/Header";

const Reviews = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const reviews = [
    {
      id: 1,
      game: "Baldur's Gate 3",
      rating: 5,
      title: "A Masterpiece of Modern RPG Design",
      content: "This game exceeded every expectation I had. The story branching is incredible, and every choice feels meaningful. The character development is top-notch.",
      author: "GameMaster42",
      authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=32&h=32&fit=crop&crop=face",
      date: "2023-11-15",
      likes: 47,
      comments: 12,
      helpful: true
    },
    {
      id: 2,
      game: "Spider-Man 2",
      rating: 4,
      title: "Great Combat, Amazing Graphics",
      content: "The web-swinging mechanics are perfected here. Combat feels fluid and the story is engaging, though it feels a bit short for the price point.",
      author: "WebSlinger",
      authorAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b5bb?w=32&h=32&fit=crop&crop=face",
      date: "2023-11-10",
      likes: 23,
      comments: 8,
      helpful: false
    },
    {
      id: 3,
      game: "Alan Wake 2",
      rating: 4,
      title: "Atmospheric Horror at Its Best",
      content: "The psychological horror elements are brilliantly executed. The narrative structure is unique and keeps you engaged throughout.",
      author: "HorrorFan88",
      authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
      date: "2023-11-08",
      likes: 31,
      comments: 15,
      helpful: true
    }
  ];

  const topReviewers = [
    { name: "GameCritic Pro", reviews: 127, followers: 1250 },
    { name: "IndieExplorer", reviews: 89, followers: 890 },
    { name: "AAA_Analyst", reviews: 156, followers: 2100 }
  ];

  const filteredReviews = reviews.filter(review =>
    searchQuery === "" || 
    review.game.toLowerCase().includes(searchQuery.toLowerCase()) ||
    review.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Reviews Section */}
          <div className="flex-1">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-6">Game Reviews</h1>
              
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search reviews..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button className="bg-primary hover:bg-primary/80">
                  Write Review
                </Button>
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-6">
              {filteredReviews.map((review) => (
                <Card key={review.id} className="gaming-card">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={review.authorAvatar} />
                          <AvatarFallback>{review.author[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-bold">{review.author}</h3>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(review.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="mb-2">
                          {review.game}
                        </Badge>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h4 className="text-lg font-semibold mb-3">{review.title}</h4>
                    <p className="text-muted-foreground mb-4">{review.content}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm" className="text-muted-foreground">
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          {review.likes}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-muted-foreground">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          {review.comments}
                        </Button>
                      </div>
                      {review.helpful && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          Helpful Review
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-80">
            <Card className="gaming-card mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Top Reviewers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topReviewers.map((reviewer, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{reviewer.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {reviewer.reviews} reviews
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{reviewer.followers}</p>
                        <p className="text-xs text-muted-foreground">followers</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="text-lg">Review Guidelines</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• Be honest and constructive</li>
                  <li>• Focus on gameplay experience</li>
                  <li>• Avoid spoilers in titles</li>
                  <li>• Rate based on game quality</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reviews;
